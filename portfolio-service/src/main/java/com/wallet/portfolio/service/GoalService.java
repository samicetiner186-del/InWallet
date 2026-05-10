package com.wallet.portfolio.service;

import com.wallet.portfolio.entity.Goal;
import com.wallet.portfolio.repository.GoalRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDateTime;
import java.time.temporal.ChronoUnit;
import java.util.List;

@Service
@RequiredArgsConstructor
public class GoalService {

    private final GoalRepository goalRepository;

    public List<Goal> getGoalsByUserId(Long userId) {
        List<Goal> goals = goalRepository.findByUserId(userId);
        goals.forEach(this::calculateInflationAdjustment);
        return goals;
    }

    private void calculateInflationAdjustment(Goal goal) {
        if (goal.getTargetAmount() == null || goal.getExpectedInflationRate() == null || goal.getTargetDate() == null) {
            return;
        }

        // Bugün ile hedef tarih arasındaki ay sayısını bul
        long monthsToGoal = ChronoUnit.MONTHS.between(LocalDateTime.now(), goal.getTargetDate());
        if (monthsToGoal <= 0) {
            goal.setCurrentTargetPrice(goal.getTargetAmount());
            return;
        }

        // Yıllık enflasyonu aylık faiz gibi işleten basit model
        // Gelecek Değer = Mevcut Değer * (1 + Enflasyon/100)^(Aylar/12)
        double inflationRate = goal.getExpectedInflationRate().doubleValue() / 100.0;
        double years = monthsToGoal / 12.0;
        
        double adjustedPrice = goal.getTargetAmount().doubleValue() * Math.pow(1 + inflationRate, years);
        goal.setCurrentTargetPrice(new BigDecimal(adjustedPrice).setScale(2, RoundingMode.HALF_UP));

        // Tamamlanma yüzdesini de güncelle
        if (goal.getCurrentAmount() != null && goal.getCurrentTargetPrice().compareTo(BigDecimal.ZERO) > 0) {
            BigDecimal percentage = goal.getCurrentAmount()
                    .multiply(new BigDecimal(100))
                    .divide(goal.getCurrentTargetPrice(), 2, RoundingMode.HALF_UP);
            goal.setCompletionPercentage(percentage);
        }
    }

    public Goal createGoal(Goal goal) {
        return goalRepository.save(goal);
    }
}
