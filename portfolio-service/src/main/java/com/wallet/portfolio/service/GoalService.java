package com.wallet.portfolio.service;

import com.wallet.portfolio.entity.Goal;
import com.wallet.portfolio.repository.GoalRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class GoalService {

    private final GoalRepository goalRepository;

    public List<Goal> getGoalsByUserId(Long userId) {
        return goalRepository.findByUserId(userId);
    }

    public Goal createGoal(Goal goal) {
        return goalRepository.save(goal);
    }
}
