package com.wallet.portfolio.service;

import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.util.HashMap;
import java.util.Map;
import java.util.Random;

@Service
public class MarketDataMockService {

    // Simüle edilmiş canlı fiyatlar (Memory Cache)
    // İleriki aşamalarda buradaki veriler Redis'e kaydedilecek.
    private final Map<String, BigDecimal> currentPrices = new HashMap<>();
    private final Random random = new Random();

    public MarketDataMockService() {
        // Başlangıç Fiyatları
        currentPrices.put("XAU", new BigDecimal("2500.00")); // Altın ONS
        currentPrices.put("AAPL", new BigDecimal("170.50")); // Apple Hisse
        currentPrices.put("BTC", new BigDecimal("65000.00")); // Bitcoin
    }

    // Her 10 saniyede bir fiyatları rastgele dalgalandırır (+-%1)
    @Scheduled(fixedRate = 10000)
    public void simulateMarketTick() {
        for (Map.Entry<String, BigDecimal> entry : currentPrices.entrySet()) {
            BigDecimal currentPrice = entry.getValue();
            // -1% ile +1% arası rastgele değişim
            double fluctuation = 1 + ((random.nextDouble() - 0.5) * 0.02);
            BigDecimal newPrice = currentPrice.multiply(BigDecimal.valueOf(fluctuation))
                    .setScale(2, RoundingMode.HALF_UP);
            
            currentPrices.put(entry.getKey(), newPrice);
            System.out.println("Piyasa Verisi Güncellendi: " + entry.getKey() + " -> " + newPrice);
            // TODO: Aşama 2 ve 3'te burada fiyat Redis'e atılacak ve WebSocket/Kafka üzerinden fırlatılacak.
        }
    }

    public BigDecimal getPriceForSymbol(String symbol) {
        return currentPrices.getOrDefault(symbol, BigDecimal.ZERO);
    }
}
