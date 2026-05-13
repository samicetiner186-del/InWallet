package com.wallet.portfolio.service;

import com.wallet.portfolio.entity.RecurringTransaction;
import com.wallet.portfolio.entity.Transaction;
import com.wallet.portfolio.repository.RecurringTransactionRepository;
import com.wallet.portfolio.repository.TransactionRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.OffsetDateTime;
import java.util.List;

@Service
@RequiredArgsConstructor
@Slf4j
public class RecurringTransactionService {

    private final RecurringTransactionRepository recurringRepository;
    private final TransactionRepository transactionRepository;

    public List<RecurringTransaction> getByUserId(Long userId) {
        return recurringRepository.findByUserId(userId);
    }

    public RecurringTransaction save(RecurringTransaction recurring) {
        return recurringRepository.save(recurring);
    }

    public void delete(Long id) {
        recurringRepository.deleteById(id);
    }

    @Transactional
    public void processPendingTransactions() {
        OffsetDateTime now = OffsetDateTime.now();
        List<RecurringTransaction> pending = recurringRepository.findPendingTransactions(now);
        
        log.info("Found {} pending recurring transactions", pending.size());

        for (RecurringTransaction r : pending) {
            try {
                // 1. Create a real transaction from the template
                Transaction t = Transaction.builder()
                        .user(r.getUser())
                        .type(r.getType())
                        .category(r.getCategory())
                        .description(r.getDescription() + " (Otomatik)")
                        .amount(r.getAmount())
                        .transactionDate(now)
                        .build();
                
                transactionRepository.save(t);

                // 2. Update next run date based on frequency
                r.setLastRunDate(now);
                r.setNextRunDate(calculateNextRunDate(r.getNextRunDate(), r.getFrequency()));
                
                recurringRepository.save(r);
                log.info("Processed recurring transaction: {}", r.getDescription());
            } catch (Exception e) {
                log.error("Error processing recurring transaction {}: {}", r.getId(), e.getMessage());
            }
        }
    }

    private OffsetDateTime calculateNextRunDate(OffsetDateTime current, String frequency) {
        if (current == null) current = OffsetDateTime.now();
        return switch (frequency.toUpperCase()) {
            case "DAILY" -> current.plusDays(1);
            case "WEEKLY" -> current.plusWeeks(1);
            case "MONTHLY" -> current.plusMonths(1);
            case "YEARLY" -> current.plusYears(1);
            default -> current.plusMonths(1);
        };
    }
}
