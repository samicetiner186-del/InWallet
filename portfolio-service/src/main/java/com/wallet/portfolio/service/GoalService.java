package com.wallet.portfolio.service;

import com.wallet.portfolio.entity.Goal;
import com.wallet.portfolio.repository.GoalRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.temporal.ChronoUnit;
import java.util.List;

@Service
@RequiredArgsConstructor
public class GoalService {

    private final GoalRepository goalRepository;
    private final EmailService emailService;
    private final com.wallet.portfolio.repository.AssetRepository assetRepository;

    public List<Goal> getGoalsByUserId(Long userId) {
        List<Goal> goals = goalRepository.findByUserId(userId);
        
        // 1. Hedefleri önce önceliğe (priority), sonra tarihe göre sırala
        goals.sort(java.util.Comparator.comparing(Goal::getPriority)
                                     .thenComparing(Goal::getTargetDate));

        // 2. Kullanıcının toplam varlık değerini (dağıtılacak havuz) hesapla
        BigDecimal remainingPool = calculateTotalPortfolioValue(userId);
        
        for (Goal goal : goals) {
            // Önce bu hedef için enflasyon düzeltmesini hesapla (currentTargetPrice belirlensin)
            calculateInflationAdjustment(goal);
            
            BigDecimal targetNeeded = goal.getCurrentTargetPrice() != null ? goal.getCurrentTargetPrice() : goal.getTargetAmount();
            
            // Havuzdaki paradan bu hedefe ne kadar düşüyor?
            if (remainingPool.compareTo(BigDecimal.ZERO) > 0) {
                BigDecimal allocation = remainingPool.min(targetNeeded);
                goal.setCurrentAmount(allocation);
                remainingPool = remainingPool.subtract(allocation);
            } else {
                goal.setCurrentAmount(BigDecimal.ZERO);
            }
            
            // Yüzdeyi yeniden hesapla (Çünkü currentAmount değişti)
            recalculatePercentage(goal);
        }
        return goals;
    }

    private void recalculatePercentage(Goal goal) {
        BigDecimal target = goal.getCurrentTargetPrice() != null ? goal.getCurrentTargetPrice() : goal.getTargetAmount();
        if (target != null && target.compareTo(BigDecimal.ZERO) > 0) {
            BigDecimal current = goal.getCurrentAmount() != null ? goal.getCurrentAmount() : BigDecimal.ZERO;
            BigDecimal percentage = current.multiply(new BigDecimal(100))
                                          .divide(target, 2, RoundingMode.HALF_UP);
            goal.setCompletionPercentage(percentage);
        }
    }

    private BigDecimal calculateTotalPortfolioValue(Long userId) {
        List<com.wallet.portfolio.entity.Asset> assets = assetRepository.findByUserId(userId);
        return assets.stream()
                .map(asset -> {
                    // Eğer anlık fiyat yoksa alış fiyatını baz al
                    BigDecimal price = asset.getCurrentPrice();
                    if (price == null || price.compareTo(BigDecimal.ZERO) == 0) {
                        price = asset.getAverageBuyPrice() != null ? asset.getAverageBuyPrice() : BigDecimal.ZERO;
                    }
                    BigDecimal quantity = asset.getQuantity() != null ? asset.getQuantity() : BigDecimal.ZERO;
                    return price.multiply(quantity);
                })
                .reduce(BigDecimal.ZERO, BigDecimal::add);
    }

    private void calculateInflationAdjustment(Goal goal) {
        if (goal.getTargetAmount() == null || goal.getExpectedInflationRate() == null || goal.getTargetDate() == null) {
            return;
        }

        long monthsToGoal = java.time.temporal.ChronoUnit.MONTHS.between(java.time.OffsetDateTime.now(), goal.getTargetDate());
        if (monthsToGoal <= 0) {
            goal.setCurrentTargetPrice(goal.getTargetAmount());
            return;
        }

        double inflationRate = goal.getExpectedInflationRate().doubleValue() / 100.0;
        double years = monthsToGoal / 12.0;
        
        double adjustedPrice = goal.getTargetAmount().doubleValue() * Math.pow(1 + inflationRate, years);
        goal.setCurrentTargetPrice(new BigDecimal(adjustedPrice).setScale(2, RoundingMode.HALF_UP));
    }

    @Transactional
    public Goal createGoal(Goal goal) {
        if (goal.getTargetAmount() == null || goal.getTargetAmount().compareTo(BigDecimal.ZERO) <= 0) {
            throw new IllegalArgumentException("Hedef tutarı 0'dan büyük olmalıdır.");
        }
        if (goal.getName() == null || goal.getName().trim().isEmpty()) {
            throw new IllegalArgumentException("Hedef adı boş olamaz.");
        }
        if (goal.getTargetDate() == null) {
            throw new IllegalArgumentException("Hedef tarihi belirtilmelidir.");
        }
        if (goal.getUser() == null || goal.getUser().getId() == null) {
            throw new IllegalArgumentException("Hedef için kullanıcı bilgisi zorunludur.");
        }
        
        Goal saved = goalRepository.save(goal);
        calculateInflationAdjustment(saved);
        return saved;
    }

    @Transactional
    public Goal updateGoalAmount(Long goalId, BigDecimal amountToAdd) {
        Goal goal = goalRepository.findById(goalId)
                .orElseThrow(() -> new RuntimeException("Hedef bulunamadı"));
        
        BigDecimal oldAmount = goal.getCurrentAmount() != null ? goal.getCurrentAmount() : BigDecimal.ZERO;
        BigDecimal newAmount = oldAmount.add(amountToAdd);
        
        goal.setCurrentAmount(newAmount);
        Goal saved = goalRepository.save(goal);
        calculateInflationAdjustment(saved);

        // Eğer yeni ulaşıldıysa mail at
        if (oldAmount.compareTo(goal.getTargetAmount()) < 0 && newAmount.compareTo(goal.getTargetAmount()) >= 0) {
            emailService.sendGoalReachedEmail(goal.getUser().getEmail(), goal.getName());
        }

        return saved;
    }

    @Transactional
    public void deleteGoal(Long id) {
        goalRepository.deleteById(id);
    }
}
