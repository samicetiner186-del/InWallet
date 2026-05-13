package com.wallet.ai.service;

import org.springframework.core.io.Resource;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestClient;
import java.util.List;
import java.util.Map;
import java.util.concurrent.CompletableFuture;

@Service
public class AIAssistantService {

    private final RestClient restClient;

    @org.springframework.beans.factory.annotation.Value("${PORTFOLIO_SERVICE_URL:http://portfolio-service:8080}")
    private String portfolioServiceUrl;

    @org.springframework.beans.factory.annotation.Value("${GEMINI_API_KEY}")
    private String geminiApiKey;

    public AIAssistantService(RestClient.Builder restClientBuilder) {
        this.restClient = restClientBuilder.build();
    }

    public String chatWithAgent(String userMessage, Long userId) {
        try {
            // Fetch all context data in parallel
            CompletableFuture<String> portfolioFuture = CompletableFuture.supplyAsync(() -> fetchData(portfolioServiceUrl + "/api/assets/user/" + userId));
            CompletableFuture<String> goalsFuture = CompletableFuture.supplyAsync(() -> fetchData(portfolioServiceUrl + "/api/goals/user/" + userId));
            CompletableFuture<String> transactionsFuture = CompletableFuture.supplyAsync(() -> fetchData(portfolioServiceUrl + "/api/transactions/user/" + userId));

            CompletableFuture.allOf(portfolioFuture, goalsFuture, transactionsFuture).join();

            String portfolio = portfolioFuture.join();
            String goals = goalsFuture.join();
            String transactions = transactionsFuture.join();

            String systemPromptText = """
                Sen InWallet finansal asistanısın. Kullanıcının cüzdan verileri aşağıdadır:
                
                PORTFÖY: %s
                HEDEFLER: %s
                İŞLEMLER: %s
                
                Bu verilere dayanarak kullanıcının sorularını yanıtla. Portföy analizi yap, tasarruf önerileri ver veya enflasyon riskini hesapla.
                Yanıtların profesyonel, motive edici ve finansal açıdan tutarlı olsun.
                Yasal Uyarı: Burada yer alan yatırım bilgi, yorum ve tavsiyeleri yatırım danışmanlığı kapsamında değildir.
                """.formatted(portfolio, goals, transactions);

            // Direct Call to Google Gemini API (REST)
            String url = "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=" + geminiApiKey;

            Map<String, Object> requestBody = Map.of(
                "contents", List.of(
                    Map.of(
                        "role", "user",
                        "parts", List.of(
                            Map.of("text", systemPromptText + "\n\nKullanıcı Mesajı: " + userMessage)
                        )
                    )
                ),
                "generationConfig", Map.of(
                    "temperature", 0.7,
                    "topP", 0.95,
                    "maxOutputTokens", 2048
                )
            );

            Map<String, Object> response = restClient.post()
                    .uri(url)
                    .body(requestBody)
                    .retrieve()
                    .body(Map.class);

            if (response != null && response.containsKey("candidates")) {
                List<Map<String, Object>> candidates = (List<Map<String, Object>>) response.get("candidates");
                if (!candidates.isEmpty()) {
                    Map<String, Object> content = (Map<String, Object>) candidates.get(0).get("content");
                    List<Map<String, Object>> parts = (List<Map<String, Object>>) content.get("parts");
                    return (String) parts.get(0).get("text");
                }
            }
            
            return "Üzgünüm, şu an yanıt oluşturamıyorum. Lütfen daha sonra tekrar deneyin.";

        } catch (Exception e) {
            return "AI Servis Hatası: " + e.getMessage();
        }
    }

    private String fetchData(String url) {
        try {
            return restClient.get()
                    .uri(url)
                    .retrieve()
                    .body(String.class);
        } catch (Exception e) {
            return "Veri alınamadı: " + e.getMessage();
        }
    }

    public String chatWithVoice(Resource audioResource, Long userId) {
        return chatWithAgent("Sesli mesaj gönderildi.", userId);
    }
}
