package com.wallet.portfolio.service;

import com.wallet.portfolio.repository.AssetRepository;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpMethod;
import org.springframework.http.ResponseEntity;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;
import java.util.stream.Collectors;

@Service
public class MarketDataService {

    private static final Logger LOGGER = LoggerFactory.getLogger(MarketDataService.class);
    private final Map<String, BigDecimal> currentPrices = new ConcurrentHashMap<>();
    private final RestTemplate restTemplate = new RestTemplate();
    private final AssetRepository assetRepository;

    public MarketDataService(AssetRepository assetRepository) {
        this.assetRepository = assetRepository;
        // Varsayılan fiyatlar
        currentPrices.put("XAU", new BigDecimal("2450.00"));
        currentPrices.put("AAPL", new BigDecimal("185.00"));
        currentPrices.put("BTC", new BigDecimal("64500.00"));
    }

    @Scheduled(fixedRate = 900000) // 15 Dakikada bir (15 * 60 * 1000)
    public void fetchAllMarketData() {
        LOGGER.info("Piyasa verileri Yahoo Finance üzerinden güncelleniyor (15 dk periyot)...");
        
        List<String> userSymbols = assetRepository.findAll().stream()
                .map(asset -> asset.getSymbol().toUpperCase())
                .distinct()
                .collect(Collectors.toList());

        List<String> defaultSymbols = List.of("THYAO", "ASTOR", "BTC", "ETH", "AAPL", "XAU");
        for (String s : defaultSymbols) {
            if (!userSymbols.contains(s)) userSymbols.add(s);
        }

        for (String symbol : userSymbols) {
            try {
                BigDecimal price = fetchPriceFromYahoo(formatToYahooSymbol(symbol));
                if (price != null) {
                    currentPrices.put(symbol, price);
                }
            } catch (Exception e) {
                LOGGER.warn("Veri çekilemedi: {} -> {}", symbol, e.getMessage());
            }
        }
    }

    private String formatToYahooSymbol(String symbol) {
        String s = symbol.toUpperCase().trim();
        if (s.equals("XAU") || s.equals("GOLD")) return "GC=F";
        if (s.equals("XAG") || s.equals("SILVER")) return "SI=F";
        if (s.equals("BTC")) return "BTC-USD";
        if (s.equals("ETH")) return "ETH-USD";
        if (s.contains(".") || s.contains("-") || s.contains("=")) return s;
        
        // BIST hissesi tahmini: 5 karakterli ise .IS ekle (Örn: THYAO, FROTO)
        // Global hisseler genelde 1-4 karakterdir (AAPL, TSLA, T).
        if (s.length() >= 5) return s + ".IS";
        
        return s;
    }

    private BigDecimal fetchPriceFromYahoo(String symbol) {
        try {
            // query2 ve v8/finance/chart uç noktası genellikle daha kararlıdır
            String url = "https://query2.finance.yahoo.com/v8/finance/chart/" + symbol + "?interval=1m&range=1d";
            HttpHeaders headers = new HttpHeaders();
            headers.set("User-Agent", "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/121.0.0.0 Safari/537.36");
            headers.set("Accept", "application/json");
            
            HttpEntity<String> entity = new HttpEntity<>(headers);

            ResponseEntity<Map> responseEntity = restTemplate.exchange(url, HttpMethod.GET, entity, Map.class);
            Map<String, Object> response = responseEntity.getBody();
            
            if (response != null && response.containsKey("chart")) {
                Map<String, Object> chart = (Map<String, Object>) response.get("chart");
                List<Map<String, Object>> result = (List<Map<String, Object>>) chart.get("result");
                
                if (result != null && !result.isEmpty()) {
                    Map<String, Object> meta = (Map<String, Object>) result.get(0).get("meta");
                    Object priceObj = meta.get("regularMarketPrice");
                    if (priceObj != null) {
                        return new BigDecimal(priceObj.toString()).setScale(2, RoundingMode.HALF_UP);
                    }
                }
            }
            Thread.sleep(1000); 
        } catch (Exception e) {
            LOGGER.warn("Yahoo API hatası ({}): {}", symbol, e.getMessage());
            return null;
        }
        return null;
    }

    public BigDecimal getPriceForSymbol(String symbol) {
        String s = symbol.toUpperCase();
        if (!currentPrices.containsKey(s) || currentPrices.get(s).compareTo(BigDecimal.ZERO) == 0) {
            BigDecimal price = fetchPriceFromYahoo(formatToYahooSymbol(s));
            if (price != null) {
                currentPrices.put(s, price);
                return price;
            }
        }
        return currentPrices.getOrDefault(s, BigDecimal.ZERO);
    }

    public Map<String, BigDecimal> getAllPrices() {
        return new HashMap<>(currentPrices);
    }
}
