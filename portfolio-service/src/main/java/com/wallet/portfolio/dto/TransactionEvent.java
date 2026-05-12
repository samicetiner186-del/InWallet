package com.wallet.portfolio.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.math.BigDecimal;
import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class TransactionEvent {
    private Long transactionId;
    private Long userId;
    private Long assetId;
    private String type;
    private BigDecimal amount;
    private BigDecimal pricePerUnit;
    private LocalDateTime transactionDate;
}
