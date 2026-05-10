package com.wallet.portfolio.controller;

import com.wallet.portfolio.service.MarketDataMockService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.util.Map;

@RestController
@RequestMapping("/api/market")
@CrossOrigin(origins = "*", allowedHeaders = "*")
public class MarketController {

    private final MarketDataMockService marketDataService;

    public MarketController(MarketDataMockService marketDataService) {
        this.marketDataService = marketDataService;
    }

    @GetMapping("/prices")
    public ResponseEntity<Map<String, BigDecimal>> getAllPrices() {
        // Mock service'den tüm fiyatları dönüyoruz
        return ResponseEntity.ok(Map.of(
            "XAU", marketDataService.getPriceForSymbol("XAU"),
            "AAPL", marketDataService.getPriceForSymbol("AAPL"),
            "BTC", marketDataService.getPriceForSymbol("BTC")
        ));
    }
}
