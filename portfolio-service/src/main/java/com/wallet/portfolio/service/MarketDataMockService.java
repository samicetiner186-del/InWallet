package com.wallet.portfolio.service;

import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.util.HashMap;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;

@Service
public class MarketDataMockService {

    private static final Logger LOGGER = LoggerFactory.getLogger(MarketDataMockService.class);
    private final Map<String, BigDecimal> currentPrices = new ConcurrentHashMap<>();
    private final RestTemplate restTemplate = new RestTemplate();

    public MarketDataMockService() {
        // Varsayılan fiyatlar (Veri çekilemezse fallback olarak kullanılır)
        currentPrices.put("XAU", new BigDecimal("2450.00"));
        currentPrices.put("AAPL", new BigDecimal("185.00"));
        currentPrices.put("BTC", new BigDecimal("64500.00"));
    }

    /**
     * Her 1 dakikada bir Yahoo Finance üzerinden hem BIST hem Global verileri çeker.
     * Mynet scraping stabil olmadığı için en güvenilir kaynak olan Yahoo Finance'e geçilmiştir.
     */
    @Scheduled(fixedRate = 60000) 
    public void fetchAllMarketData() {
        LOGGER.info("Piyasa verileri Yahoo Finance üzerinden güncelleniyor...");
        
        // BIST hisselerine otomatik .IS ekliyoruz (Yahoo standardı)
        String[] symbols = {
            "THYAO.IS", "ASTOR.IS", "TUPRS.IS", "SASA.IS", "EREGL.IS", "ASELS.IS", 
            "BTC-USD", "ETH-USD", "AAPL", "GC=F"
        };
        
        for (String symbol : symbols) {
            try {
                BigDecimal price = fetchPriceFromYahoo(symbol);
                if (price != null) {
                    // Sembolü sadeleştir (Örn: THYAO.IS -> THYAO)
                    String cleanSymbol = symbol.replace(".IS", "").replace("-USD", "").replace("=F", "");
                    if (cleanSymbol.equals("GC")) cleanSymbol = "XAU";
                    
                    currentPrices.put(cleanSymbol, price);
                }
            } catch (Exception e) {
                LOGGER.warn("Veri çekilemedi: {} -> {}", symbol, e.getMessage());
            }
        }
        LOGGER.info("Toplam {} adet varlık fiyatı güncellendi.", currentPrices.size());
    }

    private BigDecimal fetchPriceFromYahoo(String symbol) {
        try {
            // Yahoo v7 API - Hızlı ve Güvenilir
            String url = "https://query1.finance.yahoo.com/v7/finance/quote?symbols=" + symbol;
            Map<String, Object> response = restTemplate.getForObject(url, Map.class);
            
            if (response != null && response.containsKey("quoteResponse")) {
                Map<String, Object> quoteResponse = (Map<String, Object>) response.get("quoteResponse");
                java.util.List<Map<String, Object>> result = (java.util.List<Map<String, Object>>) quoteResponse.get("result");
                
                if (result != null && !result.isEmpty()) {
                    Object priceObj = result.get(0).get("regularMarketPrice");
                    if (priceObj != null) {
                        return new BigDecimal(priceObj.toString()).setScale(2, RoundingMode.HALF_UP);
                    }
                }
            }
        } catch (Exception e) {
            return null;
        }
        return null;
    }

    public BigDecimal getPriceForSymbol(String symbol) {
        // Eğer tabloda yoksa (örn: yeni eklenen bir hisse), anlık çekmeyi dene
        if (!currentPrices.containsKey(symbol) || currentPrices.get(symbol).compareTo(BigDecimal.ZERO) == 0) {
            BigDecimal price = fetchPriceFromYahoo(symbol.endsWith(".IS") ? symbol : symbol + ".IS");
            if (price != null) {
                currentPrices.put(symbol, price);
                return price;
            }
        }
        return currentPrices.getOrDefault(symbol, BigDecimal.ZERO);
    }

    public Map<String, BigDecimal> getAllPrices() {
        return new HashMap<>(currentPrices);
    }
}
