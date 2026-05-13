package com.wallet.portfolio.repository;

import com.wallet.portfolio.entity.RecurringTransaction;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.time.OffsetDateTime;
import java.util.List;

@Repository
public interface RecurringTransactionRepository extends JpaRepository<RecurringTransaction, Long> {
    List<RecurringTransaction> findByUserId(Long userId);

    @Query("SELECT r FROM RecurringTransaction r WHERE r.active = true AND r.nextRunDate <= :now")
    List<RecurringTransaction> findPendingTransactions(OffsetDateTime now);
}
