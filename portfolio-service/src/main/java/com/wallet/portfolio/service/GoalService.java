package com.wallet.portfolio.service;

import com.wallet.portfolio.entity.Goal;
import com.wallet.portfolio.repository.GoalRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDateTime;
import java.time.temporal.ChronoUnit;
import java.util.List;

@Service
@RequiredArgsConstructor
public class GoalService {

    private final GoalRepository goalRepository;
    private final EmailService emailService;

    public List<Goal> getGoalsByUserId(Long userId) {
        List<Goal> goals = goalRepository.findByUserId(userId);
        goals.forEach(this::calculateInflationAdjustment);
        return goals;
    }

    private void calculateInflationAdjustment(Goal goal) {
        if (goal.getTargetAmount() == null || goal.getExpectedInflationRate() == null || goal.getTargetDate() == null) {
            return;
        }

        long monthsToGoal = ChronoUnit.MONTHS.between(LocalDateTime.now(), goal.getTargetDate());
        if (monthsToGoal <= 0) {
            goal.setCurrentTargetPrice(goal.getTargetAmount());
            return;
        }

        double inflationRate = goal.getExpectedInflationRate().doubleValue() / 100.0;
        double years = monthsToGoal / 12.0;
        
        double adjustedPrice = goal.getTargetAmount().doubleValue() * Math.pow(1 + inflationRate, years);
        goal.setCurrentTargetPrice(new BigDecimal(adjustedPrice).setScale(2, RoundingMode.HALF_UP));

        if (goal.getCurrentAmount() != null && goal.getCurrentTargetPrice().compareTo(BigDecimal.ZERO) > 0) {
            BigDecimal percentage = goal.getCurrentAmount()
                    .multiply(new BigDecimal(100))
                    .divide(goal.getCurrentTargetPrice(), 2, RoundingMode.HALF_UP);
            goal.setCompletionPercentage(percentage);
        }
    }

    @Transactional
    public Goal createGoal(Goal goal) {
        if (goal.getTargetAmount() == null || goal.getTargetAmount().compareTo(BigDecimal.ZERO) <= 0) {
            throw new IllegalArgumentException("Hedef tutarı 0'dan büyük olmalıdır.");
        }
        if (goal.getName() == null || goal.getName().trim().isEmpty()) {
            throw new IllegalArgumentException("Hedef adı boş olamaz.");
        }
        if (goal.getTargetDate() == null) {
            throw new IllegalArgumentException("Hedef tarihi belirtilmelidir.");
        }
        
        Goal saved = goalRepository.save(goal);
        calculateInflationAdjustment(saved);
        return saved;
    }

    @Transactional
    public Goal updateGoalAmount(Long goalId, BigDecimal amountToAdd) {
        Goal goal = goalRepository.findById(goalId)
                .orElseThrow(() -> new RuntimeException("Hedef bulunamadı"));
        
        BigDecimal oldAmount = goal.getCurrentAmount() != null ? goal.getCurrentAmount() : BigDecimal.ZERO;
        BigDecimal newAmount = oldAmount.add(amountToAdd);
        
        goal.setCurrentAmount(newAmount);
        Goal saved = goalRepository.save(goal);
        calculateInflationAdjustment(saved);

        // Eğer yeni ulaşıldıysa mail at
        if (oldAmount.compareTo(goal.getTargetAmount()) < 0 && newAmount.compareTo(goal.getTargetAmount()) >= 0) {
            emailService.sendGoalReachedEmail(goal.getUser().getEmail(), goal.getName());
        }

        return saved;
    }

    @Transactional
    public void deleteGoal(Long id) {
        goalRepository.deleteById(id);
    }
}
