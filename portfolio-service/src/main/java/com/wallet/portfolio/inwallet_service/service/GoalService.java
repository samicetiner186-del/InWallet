package com.wallet.portfolio.inwallet_service.service;

import com.wallet.portfolio.inwallet_service.entity.Goal;
import com.wallet.portfolio.inwallet_service.repository.GoalRepository;
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
