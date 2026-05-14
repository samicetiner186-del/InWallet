package com.wallet.portfolio.controller;

import com.wallet.portfolio.entity.Budget;
import com.wallet.portfolio.service.BudgetService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/budgets")
@RequiredArgsConstructor
@CrossOrigin(origins = "*", allowedHeaders = "*")
public class BudgetController {

    private final BudgetService budgetService;

    @GetMapping("/user/{userId}")
    public ResponseEntity<List<Budget>> getBudgets(@PathVariable Long userId) {
        return ResponseEntity.ok(budgetService.getBudgetsByUserId(userId));
    }

    @GetMapping("/user/{userId}/status")
    public ResponseEntity<List<com.wallet.portfolio.dto.BudgetStatusDto>> getBudgetStatus(@PathVariable Long userId) {
        return ResponseEntity.ok(budgetService.getBudgetStatusByUserId(userId));
    }


    @PostMapping
    public ResponseEntity<Budget> createBudget(@RequestBody Budget budget) {
        return ResponseEntity.ok(budgetService.createOrUpdateBudget(budget));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteBudget(@PathVariable Long id) {
        budgetService.deleteBudget(id);
        return ResponseEntity.ok().build();
    }
}
