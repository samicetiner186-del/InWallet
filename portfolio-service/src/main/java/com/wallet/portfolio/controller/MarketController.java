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

    @GetMapping("/historical/{symbol}")
    public ResponseEntity<Map<Long, BigDecimal>> getHistoricalPrices(
            @PathVariable String symbol,
            @RequestParam(defaultValue = "1y") String range) {
        return ResponseEntity.ok(marketDataService.getHistoricalPrices(symbol, range));
    }
}

