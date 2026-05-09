package com.wallet.portfolio.inwallet_service.controller;

import com.wallet.portfolio.inwallet_service.entity.Goal;
import com.wallet.portfolio.inwallet_service.service.GoalService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/goals")
@RequiredArgsConstructor
public class GoalController {

    private final GoalService goalService;

    @GetMapping("/user/{userId}")
    public ResponseEntity<List<Goal>> getGoalsByUserId(@PathVariable Long userId) {
        return ResponseEntity.ok(goalService.getGoalsByUserId(userId));
    }

    @PostMapping
    public ResponseEntity<Goal> createGoal(@RequestBody Goal goal) {
        return ResponseEntity.ok(goalService.createGoal(goal));
    }
}
