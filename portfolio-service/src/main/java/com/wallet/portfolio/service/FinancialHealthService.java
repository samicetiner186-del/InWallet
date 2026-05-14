package com.wallet.portfolio.service;

import com.wallet.portfolio.entity.Asset;
import com.wallet.portfolio.entity.Transaction;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.math.MathContext;
import java.math.RoundingMode;
import java.util.*;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class FinancialHealthService {

    private final TransactionService transactionService;
    private final AssetService assetService;
    private final MarketDataService marketDataService;

    // Ağırlıklar (toplam = 100)
    private static final double W_SAVINGS = 0.30;
    private static final double W_DEBT    = 0.25;
    private static final double W_DIVERS  = 0.20;
    private static final double W_EMERGENCY = 0.15;
    private static final double W_INVESTMENT = 0.10;

    // ─── Ana Skor Hesabı ──────────────────────────────────────────────────────

    public Map<String, Object> calculateHealthScore(Long userId) {
        List<Transaction> transactions = transactionService.getTransactionsByUserId(userId);
        List<Asset> assets = assetService.getAssetsByUserId(userId);

        BigDecimal income  = sumByType(transactions, "INCOME");
        BigDecimal expense = sumByType(transactions, "EXPENSE");
        BigDecimal cash    = income.subtract(expense);
        BigDecimal monthlyExpense = expense.compareTo(BigDecimal.ZERO) > 0 ? expense : BigDecimal.ONE;

        // --- 5 Metrik ---
        int savingsScore    = calcSavingsScore(income, expense);
        int debtScore       = calcDebtScore(income, expense);
        int divScore        = calcDiversificationScore(assets);
        int emergencyScore  = calcEmergencyScore(cash, monthlyExpense);
        int investmentScore = calcInvestmentScore(assets);

        int totalScore = (int) Math.round(
            savingsScore    * W_SAVINGS +
            debtScore       * W_DEBT +
            divScore        * W_DIVERS +
            emergencyScore  * W_EMERGENCY +
            investmentScore * W_INVESTMENT
        );
        totalScore = Math.min(100, Math.max(0, totalScore));

        // --- Piyasa Bağlamı ---
        Map<String, BigDecimal> marketPrices = marketDataService.getAllPrices();
        BigDecimal usdTry  = marketPrices.getOrDefault("USDTRY", marketPrices.getOrDefault("USD", BigDecimal.ZERO));
        BigDecimal goldGram = marketPrices.getOrDefault("XAU", BigDecimal.ZERO);

        Map<String, Object> result = new LinkedHashMap<>();
        result.put("totalScore", totalScore);
        result.put("status", getStatus(totalScore));
        result.put("grade", getGrade(totalScore));
        result.put("metrics", Map.of(
            "savings",     Map.of("score", savingsScore,    "weight", (int)(W_SAVINGS * 100),    "label", "Tasarruf Oranı"),
            "debt",        Map.of("score", debtScore,       "weight", (int)(W_DEBT * 100),       "label", "Gider/Gelir Oranı"),
            "diversification", Map.of("score", divScore,    "weight", (int)(W_DIVERS * 100),     "label", "Portföy Çeşitliliği"),
            "emergency",   Map.of("score", emergencyScore,  "weight", (int)(W_EMERGENCY * 100),  "label", "Acil Durum Fonu"),
            "investment",  Map.of("score", investmentScore, "weight", (int)(W_INVESTMENT * 100), "label", "Yatırım Birikimi")
        ));
        result.put("recommendations", buildRecommendations(savingsScore, debtScore, divScore, emergencyScore, investmentScore));
        result.put("marketContext", Map.of(
            "usdTry", usdTry,
            "goldGramTry", goldGram,
            "lastUpdated", java.time.Instant.now().toString()
        ));
        return result;
    }

    // ─── 5 Metrik Algoritması ─────────────────────────────────────────────────

    /** %40 tasarruf = 100 puan; %0 tasarruf = 0 puan */
    private int calcSavingsScore(BigDecimal income, BigDecimal expense) {
        if (income.compareTo(BigDecimal.ZERO) <= 0) return 0;
        BigDecimal savings = income.subtract(expense);
        BigDecimal rate = savings.divide(income, 4, RoundingMode.HALF_UP);
        // 0.40 tasarruf oranı = 100 puan
        return clamp(rate.multiply(new BigDecimal("250")).intValue());
    }

    /** Gider/Gelir %30 altı = 100 puan; %80+ = 0 puan */
    private int calcDebtScore(BigDecimal income, BigDecimal expense) {
        if (income.compareTo(BigDecimal.ZERO) <= 0) return 0;
        BigDecimal ratio = expense.divide(income, 4, RoundingMode.HALF_UP);
        // 100 - ratio*200; 0.30 oran → 40 puan penaltı → 100-40=60
        int score = 100 - ratio.multiply(new BigDecimal("200")).intValue();
        return clamp(score);
    }

    /** 4+ farklı varlık sınıfı = 100 puan */
    private int calcDiversificationScore(List<Asset> assets) {
        long typeCount = assets.stream()
                .map(Asset::getType)
                .filter(Objects::nonNull)
                .distinct().count();
        return clamp((int)(typeCount * 25));
    }

    /** 6 aylık gider = nakit = 100 puan */
    private int calcEmergencyScore(BigDecimal cash, BigDecimal monthlyExpense) {
        if (cash.compareTo(BigDecimal.ZERO) <= 0) return 0;
        BigDecimal months = cash.divide(monthlyExpense, 2, RoundingMode.HALF_UP);
        // 6 ay = 100 puan
        return clamp(months.multiply(new BigDecimal("16.67")).intValue());
    }

    /** Toplam varlık değeri: 100.000 TL = 100 puan */
    private int calcInvestmentScore(List<Asset> assets) {
        BigDecimal totalValue = assets.stream()
                .map(a -> safeMultiply(a.getQuantity(), a.getAverageBuyPrice()))
                .reduce(BigDecimal.ZERO, BigDecimal::add);
        if (totalValue.compareTo(BigDecimal.ZERO) <= 0) return 0;
        return clamp(totalValue.divide(new BigDecimal("1000"), 0, RoundingMode.HALF_UP).intValue());
    }

    // ─── Enflasyon Analizi ────────────────────────────────────────────────────

    /** Paranın enflasyon karşısındaki erimesini ve korunma için gereken yatırımı hesaplar */
    public Map<String, Object> calculateInflationDefense(Long userId, BigDecimal annualInflationRate) {
        List<Transaction> transactions = transactionService.getTransactionsByUserId(userId);
        BigDecimal income  = sumByType(transactions, "INCOME");
        BigDecimal expense = sumByType(transactions, "EXPENSE");
        BigDecimal monthlyCash = income.subtract(expense);
        BigDecimal annualCash  = monthlyCash.multiply(new BigDecimal("12"));

        // Enflasyon ile 1, 3, 5 yıl sonraki değer kaybı
        BigDecimal inflationFactor = annualInflationRate.divide(new BigDecimal("100"), 4, RoundingMode.HALF_UP).add(BigDecimal.ONE);
        BigDecimal loss1y  = annualCash.subtract(annualCash.divide(inflationFactor.pow(1),  2, RoundingMode.HALF_UP));
        BigDecimal loss3y  = annualCash.subtract(annualCash.divide(inflationFactor.pow(3),  2, RoundingMode.HALF_UP));
        BigDecimal loss5y  = annualCash.subtract(annualCash.divide(inflationFactor.pow(5),  2, RoundingMode.HALF_UP));

        // Korunmak için gereken aylık yatırım (enflasyon = beklenen getiri varsayımı)
        BigDecimal requiredMonthlyInvestment = monthlyCash
                .multiply(annualInflationRate.divide(new BigDecimal("1200"), 4, RoundingMode.HALF_UP));

        Map<String, Object> result = new LinkedHashMap<>();
        result.put("monthlyCashBalance", monthlyCash.setScale(2, RoundingMode.HALF_UP));
        result.put("annualInflationRate", annualInflationRate);
        result.put("purchasingPowerLoss1Year",  loss1y.setScale(2, RoundingMode.HALF_UP));
        result.put("purchasingPowerLoss3Years", loss3y.setScale(2, RoundingMode.HALF_UP));
        result.put("purchasingPowerLoss5Years", loss5y.setScale(2, RoundingMode.HALF_UP));
        result.put("requiredMonthlyInvestmentToProtect", requiredMonthlyInvestment.setScale(2, RoundingMode.HALF_UP));
        result.put("verdict", buildInflationVerdict(loss1y, monthlyCash));
        return result;
    }

    /** Basit enflasyon etkisi (belirli bir tutar için) */
    public Map<String, Object> calculateInflationImpact(BigDecimal amount, int years, BigDecimal annualInflationRate) {
        BigDecimal rate = annualInflationRate.divide(new BigDecimal("100"), 4, RoundingMode.HALF_UP).add(BigDecimal.ONE);
        BigDecimal futureValue = amount.multiply(rate.pow(years)).setScale(2, RoundingMode.HALF_UP);

        return Map.of(
            "presentValue", amount,
            "years", years,
            "annualInflationRate", annualInflationRate,
            "futureEquivalentNeeded", futureValue,
            "purchasingPowerLoss", futureValue.subtract(amount).setScale(2, RoundingMode.HALF_UP),
            "realValueToday", amount.divide(rate.pow(years), 2, RoundingMode.HALF_UP)
        );
    }

    /** AI servisi için kullanıcının finansal özetini döndürür */
    public Map<String, Object> buildAiContext(Long userId) {
        List<Transaction> transactions = transactionService.getTransactionsByUserId(userId);
        List<Asset> assets = assetService.getAssetsByUserId(userId);

        BigDecimal income  = sumByType(transactions, "INCOME");
        BigDecimal expense = sumByType(transactions, "EXPENSE");

        Map<String, BigDecimal> prices = marketDataService.getAllPrices();

        List<Map<String, Object>> assetSummary = assets.stream().map(a -> {
            Map<String, Object> m = new LinkedHashMap<>();
            m.put("symbol", a.getSymbol());
            m.put("type", a.getType());
            m.put("quantity", a.getQuantity());
            m.put("avgBuyPrice", a.getAverageBuyPrice());
            m.put("currentPrice", a.getCurrentPrice());
            return m;
        }).collect(Collectors.toList());

        Map<String, Object> ctx = new LinkedHashMap<>();
        ctx.put("monthlyIncome",  income.setScale(2, RoundingMode.HALF_UP));
        ctx.put("monthlyExpense", expense.setScale(2, RoundingMode.HALF_UP));
        ctx.put("monthlySavings", income.subtract(expense).setScale(2, RoundingMode.HALF_UP));
        ctx.put("assets", assetSummary);
        ctx.put("healthScore", calculateHealthScore(userId).get("totalScore"));
        ctx.put("marketPrices", prices);
        ctx.put("generatedAt", java.time.Instant.now().toString());
        return ctx;
    }

    // ─── Yardımcı Metotlar ────────────────────────────────────────────────────

    private BigDecimal sumByType(List<Transaction> transactions, String type) {
        return transactions.stream()
                .filter(t -> type.equals(t.getType()))
                .map(Transaction::getAmount)
                .filter(Objects::nonNull)
                .reduce(BigDecimal.ZERO, BigDecimal::add);
    }

    private BigDecimal safeMultiply(BigDecimal a, BigDecimal b) {
        if (a == null || b == null) return BigDecimal.ZERO;
        return a.multiply(b);
    }

    private int clamp(int val) {
        return Math.min(100, Math.max(0, val));
    }

    private String getStatus(int score) {
        if (score >= 80) return "Mükemmel";
        if (score >= 60) return "İyi";
        if (score >= 40) return "Geliştirilebilir";
        return "Riskli";
    }

    private String getGrade(int score) {
        if (score >= 90) return "A+";
        if (score >= 80) return "A";
        if (score >= 70) return "B";
        if (score >= 60) return "C";
        if (score >= 45) return "D";
        return "F";
    }

    private List<String> buildRecommendations(int savings, int debt, int div, int emergency, int investment) {
        List<String> recs = new ArrayList<>();
        if (savings < 50) recs.add("💡 Tasarruf oranın düşük. Aylık gelirinizin en az %20'sini biriktirmeyi hedefleyin.");
        if (debt > 0 && debt < 50) recs.add("⚠️ Giderleriniz gelirinize yakın. Sabit giderlerinizi gözden geçirin.");
        if (div < 50)  recs.add("📊 Portföy çeşitliliği yetersiz. Altın, hisse ve kripto gibi farklı sınıflara yayın.");
        if (emergency < 50) recs.add("🛡️ Acil durum fonunuz yetersiz. En az 3 aylık giderinizi nakitte tutun.");
        if (investment < 50) recs.add("📈 Yatırım birikimi düşük. Aylık düzenli yatırımla bileşik faizden yararlanın.");
        if (recs.isEmpty()) recs.add("🏆 Harika gidiyorsun! Mevcut stratejini korumaya devam et.");
        return recs;
    }

    private String buildInflationVerdict(BigDecimal loss1y, BigDecimal monthlyCash) {
        if (monthlyCash.compareTo(BigDecimal.ZERO) <= 0) return "Tasarruf verisi yetersiz.";
        BigDecimal lossRatio = loss1y.divide(monthlyCash.multiply(new BigDecimal("12")), 2, RoundingMode.HALF_UP);
        if (lossRatio.compareTo(new BigDecimal("0.3")) > 0)
            return "🔴 Nakitinizin %30'undan fazlası 1 yılda erinecek! Acilen yatırıma yönelmelisiniz.";
        if (lossRatio.compareTo(new BigDecimal("0.15")) > 0)
            return "🟡 Nakit varlıklarınız orta düzeyde enflasyon erimesine maruz kalıyor.";
        return "🟢 Nakit tarafınız enflasyona karşı görece korunaklı görünüyor.";
    }
}

