package com.wallet.portfolio.inwallet_service.entity;

import jakarta.persistence.*;
import lombok.*;
import java.math.BigDecimal;
import java.time.LocalDateTime;

@Entity
@Table(name = "transactions")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Transaction {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id")
    private User user;

    // İşlem Türü: BUY, SELL, INCOME, EXPENSE
    private String type;

    // Varsa ilgili varlık (örn. Altın alındıysa o Asset'in referansı, nakit ise null)
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "asset_id")
    private Asset asset;

    // İşlem miktarı
    private BigDecimal amount;

    // Alım veya satım ise birim fiyat
    private BigDecimal pricePerUnit;

    @Column(name = "transaction_date")
    private LocalDateTime transactionDate;

    @PrePersist
    protected void onCreate() {
        if (transactionDate == null) {
            transactionDate = LocalDateTime.now();
        }
    }
}
