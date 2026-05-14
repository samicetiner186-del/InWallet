package com.wallet.portfolio.dto;

import lombok.*;
import java.math.BigDecimal;
import java.time.Instant;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AssetEvent {
    private Long userId;
    private String symbol;
    private String type;          // STOCK, GOLD, CRYPTO, FOREX vb.
    private BigDecimal quantity;
    private BigDecimal price;
    private String action;        // "ADDED" | "UPDATED" | "REMOVED"
    private Instant timestamp;
}
