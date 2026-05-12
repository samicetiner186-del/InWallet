package com.wallet.portfolio.controller;

import com.wallet.portfolio.service.MarketDataService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.util.Map;

@RestController
@RequestMapping("/api/market")
@CrossOrigin(origins = "*", allowedHeaders = "*")
public class MarketController {

    private final MarketDataService marketDataService;

    public MarketController(MarketDataService marketDataService) {
        this.marketDataService = marketDataService;
    }

    @GetMapping("/prices")
    public ResponseEntity<Map<String, BigDecimal>> getAllPrices() {
        return ResponseEntity.ok(marketDataService.getAllPrices());
    }
}
