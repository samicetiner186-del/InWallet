package com.wallet.ai.service;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.context.annotation.Description;
import org.springframework.web.client.RestClient;
import java.util.List;
import java.util.function.Function;

@Configuration
public class AIAgentToolsConfig {

    public record UserPortfolioRequest(Long userId) {}
    public record UserPortfolioResponse(String portfolioSummary) {}

    @Bean
    @Description("Kullanıcının mevcut yatırım portföyünü (hangi hisseden/altından ne kadar var) Portfolio servisinden getirir.")
    public Function<UserPortfolioRequest, UserPortfolioResponse> getUserPortfolio(RestClient restClient) {
        return request -> {
            try {
                // Mikroservis haberleşmesi: portfolio-service 8080 portunda çalışıyor.
                String response = restClient.get()
                        .uri("http://localhost:8080/api/assets/user/" + request.userId())
                        .retrieve()
                        .body(String.class);
                return new UserPortfolioResponse(response);
            } catch (Exception e) {
                return new UserPortfolioResponse("Portföy bilgisi alınamadı: " + e.getMessage());
            }
        };
    }
}
