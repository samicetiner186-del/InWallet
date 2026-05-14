package com.wallet.ai.service;

import com.fasterxml.jackson.databind.ObjectMapper;
import org.springframework.beans.factory.annotation.Qualifier;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.io.Resource;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestClient;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.OffsetDateTime;
import java.util.*;
import java.util.concurrent.CompletableFuture;

@Service
public class AIAssistantService {

    private final RestClient portfolioRestClient;
    private final ObjectMapper objectMapper = new ObjectMapper();

    @Value("${GEMINI_API_KEY}")
    private String geminiApiKey;

    @Value("${PORTFOLIO_SERVICE_URL:http://portfolio-service:8080}")
    private String portfolioServiceUrl;

    private static final String GEMINI_BASE =
            "https://generativelanguage.googleapis.com/v1beta/models/";

    private static final String[] MODEL_CHAIN = {
            "gemini-2.0-flash",
            "gemini-2.5-flash",
            "gemini-3.1-flash-lite",
            "gemini-3-flash-preview",
    };
    private static final long[] MODEL_COOLDOWN_MS = {
            60_000L,
            60_000L,
            30_000L,
            120_000L,
    };
    private final int[]  modelFailCount  = new int[MODEL_CHAIN.length];
    private final long[] modelFailedAt   = new long[MODEL_CHAIN.length];

    private static final int MAX_FAILURES   = 3;

    public AIAssistantService(
            @Qualifier("portfolioRestClient") RestClient portfolioRestClient
    ) {
        this.portfolioRestClient = portfolioRestClient;
    }

    public String chatWithAgent(String userMessage, Long userId) {
        try {
            CompletableFuture<String> contextFuture  = CompletableFuture.supplyAsync(() ->
                    fetchData("/api/financial-health/" + userId + "/ai-context"));
            CompletableFuture<String> goalsFuture    = CompletableFuture.supplyAsync(() ->
                    fetchData("/api/goals/user/" + userId));
            CompletableFuture<String> marketFuture   = CompletableFuture.supplyAsync(() ->
                    fetchData("/api/market/prices"));
            
            CompletableFuture.allOf(contextFuture, goalsFuture, marketFuture).join();

            String aiContext = contextFuture.join();
            String goals     = goalsFuture.join();
            String market    = marketFuture.join();

            String systemInstruction = buildSystemPrompt(userId, aiContext, goals, market);
            List<Map<String, Object>> tools = buildToolDefinitions();

            Map<String, Object> requestBody = buildRequest(systemInstruction, userMessage, tools, null);
            Map<String, Object> response    = callGeminiWithCircuitBreaker(requestBody);

            String finalText = processFunctionCalls(response, tools, systemInstruction, userMessage, userId, 0);

            return finalText != null ? finalText : "Üzgünüm, şu an yanıt oluşturamıyorum.";

        } catch (Exception e) {
            return "⚠️ AI Servis Hatası: " + e.getMessage();
        }
    }

    private String buildSystemPrompt(Long userId, String aiContext, String goals, String market) {
        return """
                Sen InWallet'in uzman finansal asistanısın. Görevin, kullanıcının verilerini analiz ederek \
                ona özel tasarruf ve yatırım stratejileri sunmaktır.
                
                ═══════════════════════════════════════
                AKTÜEL PİYASA DURUMU (REFERANS)
                ═══════════════════════════════════════
                %s
                
                ═══════════════════════════════════════
                KULLANICI PROFİLİ VE VERİLERİ (ID: %d)
                ═══════════════════════════════════════
                Bağlam: %s
                Hedefler: %s
                
                ═══════════════════════════════════════
                KOMUTLAR VE DAVRANIŞ KURALLARI
                ═══════════════════════════════════════
                1. KİŞİSELLEŞTİRİLMİŞ ANALİZ: Sadece genel tavsiyeler verme. Kullanıcının tasarruf oranını, \
                   harcamalarını ve varlık dağılımını kullanarak "Senin durumunda en mantıklı adım..." \
                   şeklinde kişiye özel konuş.
                2. TASARRUF PLANI: Eğer kullanıcı tasarruf etmek isterse, harcama kategorilerine bakarak \
                   somut kısıntı önerileri ve hedefleri belirle.
                3. PİYASA ENTEGRASYONU: Önerilerini mevcut USD/TRY, Altın veya BIST verileriyle \
                   destekle (Örn: "Doların şu anki seviyesi göz önüne alındığında...").
                4. PARA FORMATI: Tüm tutarları ₺ sembolü ile yaz (Örn: ₺15.000,00).
                5. FONKSİYON KULLANIMI: İşlem kaydı veya veri sorgulama için araçlarını (tools) etkin kullan. \
                   İşlem kaydederken kullanıcıdan onay bekleme, direkt kaydet ve bilgi ver.
                6. YASAL UYARI (KRİTİK): Her yanıtın en başında veya en sonunda belirgin bir şekilde \
                   "NOT: Bu bilgiler yatırım tavsiyesi değildir." uyarısını ekle.
                7. TONLAMA: Profesyonel ama cana yakın, motive edici bir finansal koç gibi davran.
                8. DİL: Tamamen Türkçe konuş.
                """.formatted(market, userId, aiContext, goals);
    }

    @SuppressWarnings("unchecked")
    private Map<String, Object> callGeminiWithCircuitBreaker(Map<String, Object> requestBody) {
        for (int i = 0; i < MODEL_CHAIN.length; i++) {
            if (modelFailCount[i] >= MAX_FAILURES) {
                long elapsed = System.currentTimeMillis() - modelFailedAt[i];
                if (elapsed < MODEL_COOLDOWN_MS[i]) {
                    continue;
                }
                modelFailCount[i] = 0;
            }

            try {
                Map<String, Object> result = callGeminiModel(MODEL_CHAIN[i], requestBody);
                if (modelFailCount[i] > 0) {
                    modelFailCount[i] = 0;
                }
                return result;
            } catch (Exception e) {
                String msg = e.getMessage() != null ? e.getMessage() : "";
                boolean isQuota = msg.contains("429") || msg.contains("QUOTA") ||
                                  msg.contains("quota") || msg.contains("RESOURCE_EXHAUSTED");

                modelFailCount[i]++;
                modelFailedAt[i] = System.currentTimeMillis();

                if (!isQuota && modelFailCount[i] >= MAX_FAILURES) {
                    break;
                }
            }
        }
        return buildOfflineResponse();
    }

    private Map<String, Object> buildOfflineResponse() {
        Map<String, Object> part = new LinkedHashMap<>();
        part.put("text", "🔌 AI asistan şu an geçici olarak devre dışı. Birkaç saniye sonra tekrar deneyin.");
        Map<String, Object> content = new LinkedHashMap<>();
        content.put("parts", List.of(part));
        Map<String, Object> candidate = Map.of("content", content);
        return Map.of("candidates", List.of(candidate));
    }

    @SuppressWarnings("unchecked")
    private String processFunctionCalls(
            Map<String, Object> response,
            List<Map<String, Object>> tools,
            String systemInstruction,
            String userMessage,
            Long userId,
            int depth
    ) throws Exception {
        if (depth > 5 || response == null) return null;

        List<Map<String, Object>> candidates = (List<Map<String, Object>>) response.get("candidates");
        if (candidates == null || candidates.isEmpty()) return null;

        Map<String, Object> content = (Map<String, Object>) candidates.get(0).get("content");
        if (content == null) return null;

        List<Map<String, Object>> parts = (List<Map<String, Object>>) content.get("parts");
        if (parts == null || parts.isEmpty()) return null;

        StringBuilder textResult = new StringBuilder();
        List<Map<String, Object>> functionCallParts = new ArrayList<>();

        for (Map<String, Object> part : parts) {
            if (part.containsKey("text")) textResult.append(part.get("text"));
            if (part.containsKey("functionCall")) functionCallParts.add(part);
        }

        if (functionCallParts.isEmpty()) {
            return textResult.length() > 0 ? textResult.toString() : null;
        }

        List<Map<String, Object>> functionResponses = new ArrayList<>();
        for (Map<String, Object> part : functionCallParts) {
            Map<String, Object> fc       = (Map<String, Object>) part.get("functionCall");
            String funcName              = (String) fc.get("name");
            Map<String, Object> args     = (Map<String, Object>) fc.get("args");
            String funcResult            = executeFunction(funcName, args, userId);
            functionResponses.add(Map.of(
                    "functionResponse", Map.of(
                            "name", funcName,
                            "response", Map.of("result", funcResult)
                    )
            ));
        }

        Map<String, Object> nextRequest  = buildRequestWithHistory(systemInstruction, userMessage, content, functionResponses, tools);
        Map<String, Object> nextResponse = callGeminiWithCircuitBreaker(nextRequest);
        return processFunctionCalls(nextResponse, tools, systemInstruction, userMessage, userId, depth + 1);
    }

    private String executeFunction(String name, Map<String, Object> args, Long userId) {
        try {
            return switch (name) {
                case "get_portfolio"    -> fetchData("/api/assets/user/" + userId);
                case "get_goals"        -> fetchData("/api/goals/user/" + userId);
                case "get_transactions" -> fetchData("/api/transactions/user/" + userId);
                case "get_health_score" -> fetchData("/api/financial-health/" + userId);
                case "get_market_prices"-> fetchData("/api/market/prices");
                case "add_transaction"  -> {
                    Object amtObj = args.get("amount");
                    BigDecimal amount = amtObj instanceof Number
                            ? new BigDecimal(amtObj.toString()) : BigDecimal.ZERO;
                    String type        = (String) args.getOrDefault("type", "EXPENSE");
                    String category    = (String) args.getOrDefault("category", "Diğer");
                    String description = (String) args.getOrDefault("description", "AI tarafından kaydedildi");

                    Map<String, Object> body = new LinkedHashMap<>();
                    body.put("user", Map.of("id", userId));
                    body.put("amount", amount);
                    body.put("type", type);
                    body.put("category", category);
                    body.put("description", description);
                    body.put("date", OffsetDateTime.now().toString());

                    portfolioRestClient.post().uri("/api/transactions").body(body).retrieve().toBodilessEntity();
                    yield "✅ İşlem başarıyla kaydedildi: " + description + " (" + amount + " TL)";
                }
                case "create_goal" -> {
                    Object amtObj = args.get("targetAmount");
                    BigDecimal targetAmount = amtObj instanceof Number
                            ? new BigDecimal(amtObj.toString()) : BigDecimal.ZERO;
                    String goalName = (String) args.getOrDefault("name", "Yeni Hedef");
                    String deadline = (String) args.getOrDefault("deadline",
                            LocalDate.now().plusYears(1).toString());

                    Map<String, Object> body = new LinkedHashMap<>();
                    body.put("user", Map.of("id", userId));
                    body.put("name", goalName);
                    body.put("targetAmount", targetAmount);
                    body.put("currentAmount", BigDecimal.ZERO);
                    body.put("deadline", deadline);

                    portfolioRestClient.post().uri("/api/goals").body(body).retrieve().toBodilessEntity();
                    yield "✅ Hedef başarıyla oluşturuldu: " + goalName;
                }
                default -> "Bilinmeyen fonksiyon: " + name;
            };
        } catch (Exception e) {
            return "❌ Fonksiyon hatası (" + name + "): " + e.getMessage();
        }
    }

    private List<Map<String, Object>> buildToolDefinitions() {
        return List.of(Map.of("functionDeclarations", List.of(
                Map.of("name", "get_portfolio",
                        "description", "Kullanıcının mevcut yatırım portföyünü getirir.",
                        "parameters", Map.of("type", "OBJECT", "properties", Map.of())),
                Map.of("name", "get_goals",
                        "description", "Kullanıcının finansal hedeflerini getirir.",
                        "parameters", Map.of("type", "OBJECT", "properties", Map.of())),
                Map.of("name", "get_transactions",
                        "description", "Kullanıcının geçmiş işlemlerini getirir.",
                        "parameters", Map.of("type", "OBJECT", "properties", Map.of())),
                Map.of("name", "get_health_score",
                        "description", "Kullanıcının 0-100 arası finansal sağlık skorunu ve 5 alt metriği getirir.",
                        "parameters", Map.of("type", "OBJECT", "properties", Map.of())),
                Map.of("name", "get_market_prices",
                        "description", "Anlık piyasa verilerini getirir: USD/TRY, altın, BIST hisseleri, kripto.",
                        "parameters", Map.of("type", "OBJECT", "properties", Map.of())),
                Map.of("name", "add_transaction",
                        "description", "Yeni bir harcama (EXPENSE) veya gelir (INCOME) işlemi kaydeder.",
                        "parameters", Map.of(
                                "type", "OBJECT",
                                "properties", Map.of(
                                        "amount",      Map.of("type", "NUMBER", "description", "İşlem tutarı (TL)"),
                                        "type",        Map.of("type", "STRING", "description", "EXPENSE veya INCOME"),
                                        "category",    Map.of("type", "STRING", "description", "Kategori (Market, Fatura, Maaş vb.)"),
                                        "description", Map.of("type", "STRING", "description", "İşlem açıklaması")
                                ),
                                "required", List.of("amount", "type", "category", "description")
                        )),
                Map.of("name", "create_goal",
                        "description", "Yeni bir finansal hedef oluşturur.",
                        "parameters", Map.of(
                                "type", "OBJECT",
                                "properties", Map.of(
                                        "name",         Map.of("type", "STRING", "description", "Hedef adı"),
                                        "targetAmount", Map.of("type", "NUMBER", "description", "Hedef tutar (TL)"),
                                        "deadline",     Map.of("type", "STRING", "description", "Bitiş tarihi YYYY-MM-DD")
                                ),
                                "required", List.of("name", "targetAmount", "deadline")
                        ))
        )));
    }

    private Map<String, Object> buildRequest(String systemInstruction, String userMessage,
                                               List<Map<String, Object>> tools,
                                               List<Map<String, Object>> history) {
        Map<String, Object> body = new LinkedHashMap<>();
        body.put("system_instruction", Map.of("parts", List.of(Map.of("text", systemInstruction))));
        List<Map<String, Object>> contents = new ArrayList<>();
        if (history != null) contents.addAll(history);
        contents.add(Map.of("role", "user", "parts", List.of(Map.of("text", userMessage))));
        body.put("contents", contents);
        body.put("tools", tools);
        body.put("generationConfig", Map.of("temperature", 0.7, "maxOutputTokens", 2048));
        return body;
    }

    private Map<String, Object> buildRequestWithHistory(
            String systemInstruction, String userMessage,
            Map<String, Object> assistantContent,
            List<Map<String, Object>> functionResponses,
            List<Map<String, Object>> tools
    ) {
        List<Map<String, Object>> history = new ArrayList<>();
        history.add(Map.of("role", "user", "parts", List.of(Map.of("text", userMessage))));
        history.add(assistantContent);
        history.add(Map.of("role", "user", "parts", functionResponses));

        Map<String, Object> body = new LinkedHashMap<>();
        body.put("system_instruction", Map.of("parts", List.of(Map.of("text", systemInstruction))));
        body.put("contents", history);
        body.put("tools", tools);
        body.put("generationConfig", Map.of("temperature", 0.7, "maxOutputTokens", 2048));
        return body;
    }

    @SuppressWarnings("unchecked")
    private Map<String, Object> callGeminiModel(String modelName, Map<String, Object> requestBody) {
        String fullUrl = GEMINI_BASE + modelName + ":generateContent?key=" + geminiApiKey;
        try {
            return RestClient.create().post()
                    .uri(fullUrl)
                    .body(requestBody)
                    .retrieve()
                    .body(Map.class);
        } catch (org.springframework.web.client.HttpClientErrorException e) {
            String body = e.getResponseBodyAsString();
            if (e.getStatusCode().value() == 429 || body.contains("RESOURCE_EXHAUSTED")) {
                throw new RuntimeException("429 QUOTA_EXHAUSTED model=" + modelName);
            }
            throw new RuntimeException(e.getStatusCode() + " " + body.substring(0, Math.min(200, body.length())));
        }
    }

    private String fetchData(String path) {
        try {
            String result = portfolioRestClient.get().uri(path).retrieve().body(String.class);
            return result != null ? result : "{}";
        } catch (Exception e) {
            return "{}";
        }
    }

    public byte[] chatWithVoice(Resource audioFile, Long userId) {
        String response = chatWithAgent("Sesli mesaj gönderildi.", userId);
        return response.getBytes();
    }
}
