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

    private final BudgetRepository budgetRepository;

    public List<Budget> getBudgetsByUserId(Long userId) {
        return budgetRepository.findByUserId(userId);
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
