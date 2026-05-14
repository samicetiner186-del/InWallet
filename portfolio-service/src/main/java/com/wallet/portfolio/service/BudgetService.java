package com.wallet.portfolio.service;

import com.wallet.portfolio.entity.Budget;
import com.wallet.portfolio.repository.BudgetRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
public class BudgetService {

    private final com.wallet.portfolio.repository.TransactionRepository transactionRepository;
    private final BudgetRepository budgetRepository;

    public List<Budget> getBudgetsByUserId(Long userId) {
        return budgetRepository.findByUserId(userId);
    }

    public List<com.wallet.portfolio.dto.BudgetStatusDto> getBudgetStatusByUserId(Long userId) {
        List<Budget> budgets = budgetRepository.findByUserId(userId);
        List<com.wallet.portfolio.entity.Transaction> transactions = transactionRepository.findByUserId(userId);

        return budgets.stream().map(budget -> {
            java.math.BigDecimal spent = transactions.stream()
                    .filter(t -> "EXPENSE".equalsIgnoreCase(t.getType()) && budget.getCategory().equals(t.getCategory()))
                    .map(com.wallet.portfolio.entity.Transaction::getAmount)
                    .reduce(java.math.BigDecimal.ZERO, java.math.BigDecimal::add);

            double usage = 0;
            if (budget.getLimitAmount().compareTo(java.math.BigDecimal.ZERO) > 0) {
                usage = spent.doubleValue() / budget.getLimitAmount().doubleValue() * 100;
            }

            String status = "ON_TRACK";
            if (usage >= 100) status = "EXCEEDED";
            else if (usage >= 80) status = "NEAR_LIMIT";

            return com.wallet.portfolio.dto.BudgetStatusDto.builder()
                    .category(budget.getCategory())
                    .limitAmount(budget.getLimitAmount())
                    .spentAmount(spent)
                    .usagePercentage(usage)
                    .status(status)
                    .build();
        }).collect(java.util.stream.Collectors.toList());
    }

    @Transactional
    public Budget createOrUpdateBudget(Budget budget) {

        return budgetRepository.findByUserIdAndCategory(budget.getUser().getId(), budget.getCategory())
                .map(existing -> {
                    existing.setLimitAmount(budget.getLimitAmount());
                    return budgetRepository.save(existing);
                })
                .orElseGet(() -> budgetRepository.save(budget));
    }

    @Transactional
    public void deleteBudget(Long id) {
        budgetRepository.deleteById(id);
    }
}
