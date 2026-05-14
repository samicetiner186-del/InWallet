package com.wallet.portfolio.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class BudgetStatusDto {
    private String category;
    private BigDecimal limitAmount;
    private BigDecimal spentAmount;
    private double usagePercentage;
    private String status; // ON_TRACK, NEAR_LIMIT, EXCEEDED
}
