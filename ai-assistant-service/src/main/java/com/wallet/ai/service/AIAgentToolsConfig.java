package com.wallet.ai.service;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.context.annotation.Description;
import org.springframework.web.client.RestClient;

import java.math.BigDecimal;
import java.time.OffsetDateTime;
import java.util.Map;
import java.util.function.Function;

@Configuration
public class AIAgentToolsConfig {

    @Value("${PORTFOLIO_SERVICE_URL:http://portfolio-service:8080}")
    private String portfolioServiceUrl;

    // ─── Records ───────────────────────────────────────────────────────────────
    public record UserPortfolioRequest(Long userId) {}
    public record UserPortfolioResponse(String portfolioSummary) {}

    public record UserGoalsRequest(Long userId) {}
    public record UserGoalsResponse(String goalsSummary) {}

    public record UserTransactionsRequest(Long userId) {}
    public record UserTransactionsResponse(String transactionsSummary) {}

    public record AddTransactionRequest(Long userId, BigDecimal amount, String type, String category, String description) {}
    public record AddTransactionResponse(String message) {}

    public record CreateGoalRequest(Long userId, String name, BigDecimal targetAmount, String deadline) {}
    public record CreateGoalResponse(String message) {}

    // ─── Shared RestClient bean ────────────────────────────────────────────────
    @Bean
    public RestClient portfolioRestClient(RestClient.Builder builder) {
        return builder
                .baseUrl(portfolioServiceUrl)
                .defaultHeader("X-Internal-Api-Key", "inwallet-ai-internal")
                .defaultHeader("Content-Type", "application/json")
                .build();
    }

    // ─── Tool Beans ───────────────────────────────────────────────────────────
    @Bean
    @Description("Kullanıcının mevcut yatırım portföyünü getirir (hisseler, kripto, altın vb.).")
    public Function<UserPortfolioRequest, UserPortfolioResponse> getUserPortfolio(RestClient portfolioRestClient) {
        return request -> {
            try {
                String body = portfolioRestClient.get()
                        .uri("/api/assets/user/" + request.userId())
                        .retrieve()
                        .body(String.class);
                return new UserPortfolioResponse(body != null ? body : "[]");
            } catch (Exception e) {
                return new UserPortfolioResponse("Portföy bilgisi alınamadı: " + e.getMessage());
            }
        };
    }

    @Bean
    @Description("Kullanıcının finansal hedeflerini (ev, araba, tatil vb.) ve hedef tutarlarını getirir.")
    public Function<UserGoalsRequest, UserGoalsResponse> getUserGoals(RestClient portfolioRestClient) {
        return request -> {
            try {
                String body = portfolioRestClient.get()
                        .uri("/api/goals/user/" + request.userId())
                        .retrieve()
                        .body(String.class);
                return new UserGoalsResponse(body != null ? body : "[]");
            } catch (Exception e) {
                return new UserGoalsResponse("Hedef bilgileri alınamadı: " + e.getMessage());
            }
        };
    }

    @Bean
    @Description("Kullanıcının gelir ve gider işlemlerini getirir.")
    public Function<UserTransactionsRequest, UserTransactionsResponse> getUserTransactions(RestClient portfolioRestClient) {
        return request -> {
            try {
                String body = portfolioRestClient.get()
                        .uri("/api/transactions/user/" + request.userId())
                        .retrieve()
                        .body(String.class);
                return new UserTransactionsResponse(body != null ? body : "[]");
            } catch (Exception e) {
                return new UserTransactionsResponse("İşlem bilgileri alınamadı: " + e.getMessage());
            }
        };
    }

    @Bean
    @Description("Kullanıcı için yeni bir harcama (EXPENSE) veya gelir (INCOME) işlemi kaydeder. " +
                 "'Markete 200 TL harcadım' gibi cümlelerde kullan. " +
                 "type değeri sadece 'EXPENSE' veya 'INCOME' olabilir.")
    public Function<AddTransactionRequest, AddTransactionResponse> addTransaction(RestClient portfolioRestClient) {
        return request -> {
            try {
                Map<String, Object> body = Map.of(
                        "user",        Map.of("id", request.userId()),
                        "amount",      request.amount(),
                        "type",        request.type(),
                        "category",    request.category(),
                        "description", request.description(),
                        "date",        OffsetDateTime.now().toString()
                );

                portfolioRestClient.post()
                        .uri("/api/transactions")
                        .body(body)
                        .retrieve()
                        .toBodilessEntity();

                return new AddTransactionResponse(
                        "✅ İşlem başarıyla kaydedildi: " + request.description() +
                        " (" + request.amount() + " TL " + (request.type().equals("EXPENSE") ? "gider" : "gelir") + ")"
                );
            } catch (Exception e) {
                return new AddTransactionResponse("❌ İşlem kaydedilirken hata: " + e.getMessage());
            }
        };
    }

    @Bean
    @Description("Kullanıcı için yeni bir finansal hedef oluşturur. Hedef adı, hedef tutar (TL) ve bitiş tarihi (YYYY-MM-DD) gerekir.")
    public Function<CreateGoalRequest, CreateGoalResponse> createGoal(RestClient portfolioRestClient) {
        return request -> {
            try {
                Map<String, Object> body = Map.of(
                        "user",          Map.of("id", request.userId()),
                        "name",          request.name(),
                        "targetAmount",  request.targetAmount(),
                        "currentAmount", BigDecimal.ZERO,
                        "deadline",      request.deadline()
                );

                portfolioRestClient.post()
                        .uri("/api/goals")
                        .body(body)
                        .retrieve()
                        .toBodilessEntity();

                return new CreateGoalResponse("✅ Hedef başarıyla oluşturuldu: " + request.name());
            } catch (Exception e) {
                return new CreateGoalResponse("❌ Hedef oluşturulurken hata: " + e.getMessage());
            }
        };
    }
}
