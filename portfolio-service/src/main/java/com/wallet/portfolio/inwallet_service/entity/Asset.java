package com.wallet.portfolio.inwallet_service.entity;

import jakarta.persistence.*;
import lombok.*;
import java.math.BigDecimal;
import java.time.LocalDateTime;

@Entity
@Table(name = "assets")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Asset {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id")
    private User user;
    
    // Altın, Borsa (Hisse), Döviz vb.
    private String type;
    
    // Varlığın adı veya sembolü (örn. AAPL, XAU, THYAO)
    private String symbol;
    
    // Toplam adet veya gram
    private BigDecimal quantity;
    
    // Ortalama alış fiyatı
    private BigDecimal averageBuyPrice;
    
    // Hedef satış fiyatı
    private BigDecimal targetSellPrice;
    
    // Anlık fiyat (Bu değer Redis/Kafka'dan geldikçe güncellenecek)
    private BigDecimal currentPrice;
    
    @Column(name = "updated_at")
    private LocalDateTime updatedAt;
    
    @PreUpdate
    protected void onUpdate() {
        updatedAt = LocalDateTime.now();
    }
}
