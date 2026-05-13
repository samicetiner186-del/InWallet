package com.wallet.portfolio.controller;

import com.wallet.portfolio.entity.RecurringTransaction;
import com.wallet.portfolio.service.RecurringTransactionService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/recurring-transactions")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
public class RecurringTransactionController {

    private final RecurringTransactionService recurringService;

    @GetMapping("/user/{userId}")
    public ResponseEntity<List<RecurringTransaction>> getByUserId(@PathVariable Long userId) {
        return ResponseEntity.ok(recurringService.getByUserId(userId));
    }

    @PostMapping
    public ResponseEntity<RecurringTransaction> create(@RequestBody RecurringTransaction recurring) {
        return ResponseEntity.ok(recurringService.save(recurring));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        recurringService.delete(id);
        return ResponseEntity.noContent().build();
    }

    @PostMapping("/process")
    public ResponseEntity<String> manualProcess() {
        recurringService.processPendingTransactions();
        return ResponseEntity.ok("Processing triggered manually");
    }
}
