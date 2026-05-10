package com.wallet.portfolio.entity;

import jakarta.persistence.*;
import lombok.*;
import java.math.BigDecimal;
import java.time.LocalDateTime;

@Entity
@Table(name = "goals")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Goal {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id")
    private User user;

    // Hedef Adı (Ev, Araba, Telefon vb.)
    private String name;

    // Hedefin başlangıç (bugünkü) fiyatı
    private BigDecimal initialPrice;

    // Enflasyona göre güncellenmiş güncel fiyat
    private BigDecimal currentTargetPrice;

    // Aylık/Yıllık uygulanacak beklenen enflasyon oranı (Örn. %50 için 50.0)
    private BigDecimal expectedInflationRate;

    // Hedefin ne zamana kadar gerçekleşmesinin planlandığı
    private LocalDateTime targetDate;

    // Şu ana kadar hedefe ne kadar yaklaşıldı (%)
    private BigDecimal completionPercentage;

    // Hedef tutar ve mevcut birikim
    private BigDecimal targetAmount;
    private BigDecimal currentAmount;
}
