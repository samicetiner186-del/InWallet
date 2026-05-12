package com.wallet.portfolio.entity;

import jakarta.persistence.*;
import lombok.*;
import java.math.BigDecimal;

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
    @com.fasterxml.jackson.annotation.JsonProperty(access = com.fasterxml.jackson.annotation.JsonProperty.Access.WRITE_ONLY)
    private User user;

    // Hedef Adı (Ev, Araba, Telefon vb.)
    private String name;

    // Hedef Tipi (HOUSE, CAR, VACATION, EDUCATION, OTHER)
    @Column(nullable = false)
    private String type = "OTHER";

    // Hedef Önceliği (1 en yüksek, paranın önce akacağı yer)
    private Integer priority = 1;

    // Hedefin başlangıç (bugünkü) fiyatı
    private BigDecimal initialPrice;

    // Enflasyona göre güncellenmiş güncel fiyat
    private BigDecimal currentTargetPrice;

    // Aylık/Yıllık uygulanacak beklenen enflasyon oranı (Örn. %50 için 50.0)
    private BigDecimal expectedInflationRate;

    // Hedefin ne zamana kadar gerçekleşmesinin planlandığı
    @com.fasterxml.jackson.annotation.JsonFormat(shape = com.fasterxml.jackson.annotation.JsonFormat.Shape.STRING, pattern = "yyyy-MM-dd'T'HH:mm:ss.SSSX")
    private java.time.OffsetDateTime targetDate;

    // Şu ana kadar hedefe ne kadar yaklaşıldı (%)
    private BigDecimal completionPercentage;

    // Hedef tutar ve mevcut birikim
    private BigDecimal targetAmount;
    private BigDecimal currentAmount;
}
