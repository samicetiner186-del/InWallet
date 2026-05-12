package com.wallet.portfolio.controller;

import com.wallet.portfolio.entity.Goal;
import com.wallet.portfolio.service.GoalService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/goals")
@RequiredArgsConstructor
@CrossOrigin(origins = "*", allowedHeaders = "*")
public class GoalController {

    private final GoalService goalService;

    @GetMapping("/user/{userId}")
    public ResponseEntity<List<Goal>> getGoalsByUserId(@PathVariable Long userId) {
        return ResponseEntity.ok(goalService.getGoalsByUserId(userId));
    }

    @PostMapping
    public ResponseEntity<?> createGoal(@RequestBody Goal goal) {
        try {
            if (goal.getUser() == null || goal.getUser().getId() == null) {
                return ResponseEntity.badRequest().body("Kullanıcı bilgisi eksiktir.");
            }
            Goal created = goalService.createGoal(goal);
            return ResponseEntity.ok(created);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        } catch (Exception e) {
            return ResponseEntity.internalServerError().body("Hata: " + e.getMessage());
        }
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteGoal(@PathVariable Long id) {
        goalService.deleteGoal(id);
        return ResponseEntity.ok().build();
    }

    @PutMapping("/{id}")
    public ResponseEntity<?> updateGoal(@PathVariable Long id, @RequestBody Goal goal) {
        try {
            return ResponseEntity.ok(goalService.updateGoal(id, goal));
        } catch (Exception e) {
            return ResponseEntity.internalServerError().body("Hata: " + e.getMessage());
        }
    }

    @PostMapping("/{id}/add-progress")
    public ResponseEntity<?> addProgress(@PathVariable Long id, @RequestParam java.math.BigDecimal amount) {
        try {
            return ResponseEntity.ok(goalService.updateGoalAmount(id, amount));
        } catch (Exception e) {
            return ResponseEntity.internalServerError().body("Hata: " + e.getMessage());
        }
    }
}
