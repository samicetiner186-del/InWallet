package com.wallet.portfolio.entity;

import jakarta.persistence.*;
import lombok.*;
import java.math.BigDecimal;
import java.time.OffsetDateTime;

@Entity
@Table(name = "recurring_transactions")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class RecurringTransaction {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id")
    @com.fasterxml.jackson.annotation.JsonProperty(access = com.fasterxml.jackson.annotation.JsonProperty.Access.WRITE_ONLY)
    private User user;

    private String description;
    private String category;
    private String type; // INCOME, EXPENSE
    private BigDecimal amount;

    // Frekans: DAILY, WEEKLY, MONTHLY, YEARLY
    private String frequency;

    @Column(name = "next_run_date")
    private OffsetDateTime nextRunDate;

    @Column(name = "last_run_date")
    private OffsetDateTime lastRunDate;

    private boolean active = true;

    @PrePersist
    protected void onCreate() {
        if (nextRunDate == null) {
            nextRunDate = OffsetDateTime.now();
        }
    }
}
