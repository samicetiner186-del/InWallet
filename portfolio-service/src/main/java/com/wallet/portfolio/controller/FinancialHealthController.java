package com.wallet.portfolio.controller;

import com.wallet.portfolio.service.FinancialHealthService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;

@RestController
@RequestMapping("/api/financial-health")
@RequiredArgsConstructor
@CrossOrigin(origins = "*", allowedHeaders = "*")
public class FinancialHealthController {

    private final FinancialHealthService financialHealthService;

    /** Finansal Sağlık Skoru — 5 metrik, piyasa bağlamı */
    @GetMapping("/{userId}")
    public ResponseEntity<?> getHealthScore(@PathVariable Long userId) {
        try {
            return ResponseEntity.ok(financialHealthService.calculateHealthScore(userId));
        } catch (Exception e) {
            return ResponseEntity.internalServerError().body("Hata: " + e.getMessage());
        }
    }

    /** Enflasyon Savunma Analizi — 1/3/5 yıllık erime + korunma için gereken aylık yatırım */
    @GetMapping("/{userId}/inflation-defense")
    public ResponseEntity<?> getInflationDefense(
            @PathVariable Long userId,
            @RequestParam(defaultValue = "45") BigDecimal rate) {
        try {
            return ResponseEntity.ok(financialHealthService.calculateInflationDefense(userId, rate));
        } catch (Exception e) {
            return ResponseEntity.internalServerError().body("Hata: " + e.getMessage());
        }
    }

    /** Belirli bir tutar için enflasyon etkisi simülasyonu */
    @GetMapping("/inflation-impact")
    public ResponseEntity<?> getInflationImpact(
            @RequestParam BigDecimal amount,
            @RequestParam int years,
            @RequestParam BigDecimal rate) {
        try {
            return ResponseEntity.ok(financialHealthService.calculateInflationImpact(amount, years, rate));
        } catch (Exception e) {
            return ResponseEntity.internalServerError().body("Hata: " + e.getMessage());
        }
    }

    /** AI servisi için kişiselleştirilmiş finansal bağlam (iç çağrı) */
    @GetMapping("/{userId}/ai-context")
    public ResponseEntity<?> getAiContext(@PathVariable Long userId) {
        try {
            return ResponseEntity.ok(financialHealthService.buildAiContext(userId));
        } catch (Exception e) {
            return ResponseEntity.internalServerError().body("Hata: " + e.getMessage());
        }
    }
}

