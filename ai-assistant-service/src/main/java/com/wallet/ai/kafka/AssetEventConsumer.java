package com.wallet.ai.kafka;

import com.wallet.ai.dto.AssetEventDto;
import com.wallet.ai.service.AIAssistantService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.kafka.annotation.KafkaListener;
import org.springframework.kafka.support.KafkaHeaders;
import org.springframework.messaging.handler.annotation.Header;
import org.springframework.messaging.handler.annotation.Payload;
import org.springframework.stereotype.Component;

import java.math.BigDecimal;
import java.math.RoundingMode;

/**
 * Portföyde yeni varlık eklendiğinde/güncellendiğinde Kafka'dan event alır
 * ve AI aracılığıyla kişiselleştirilmiş bir analiz mesajı üretir.
 *
 * Bu mesaj gerçek bir projede WebSocket/SSE üzerinden frontend'e push edilir.
 * Şimdilik log'a yazılıp bir "pending_notifications" yapısına koyulabilir.
 */
@Component
public class AssetEventConsumer {

    private static final Logger LOGGER = LoggerFactory.getLogger(AssetEventConsumer.class);

    private final AIAssistantService aiAssistantService;

    public AssetEventConsumer(AIAssistantService aiAssistantService) {
        this.aiAssistantService = aiAssistantService;
    }

    @KafkaListener(
        topics = "asset-events",
        groupId = "ai-assistant-group",
        containerFactory = "kafkaListenerContainerFactory"
    )
    public void handleAssetEvent(
            @Payload AssetEventDto event,
            @Header(KafkaHeaders.RECEIVED_TOPIC) String topic,
            @Header(KafkaHeaders.OFFSET) long offset
    ) {
        LOGGER.info("[Kafka] Asset event alındı → User: {}, Symbol: {}, Action: {} (offset: {})",
                event.getUserId(), event.getSymbol(), event.getAction(), offset);

        try {
            if (event.getUserId() == null || event.getSymbol() == null) {
                LOGGER.warn("Geçersiz event payload, atlanıyor.");
                return;
            }

            // ─── Proaktif AI Analizi ───────────────────────────────────────────
            String proactivePrompt = buildProactivePrompt(event);
            LOGGER.info("[AI Proaktif] Analiz tetikleniyor → Kullanıcı {}: {}", event.getUserId(), proactivePrompt);

            // AI'ya portföy değişikliğini bağlamıyla birlikte anlat
            String aiInsight = aiAssistantService.chatWithAgent(proactivePrompt, event.getUserId());

            // Gerçek projede WebSocket/SSE ile frontend'e gönderi yapılır:
            // notificationService.push(event.getUserId(), aiInsight);
            LOGGER.info("[AI Proaktif] Kullanıcı {} için analiz üretildi:\n{}", event.getUserId(), aiInsight);

        } catch (Exception e) {
            // Consumer hataları topic'i bloke etmemeli
            LOGGER.error("[Kafka] Asset event işlenemedi: {}", e.getMessage());
        }
    }

    // ─── Proaktif Prompt Builder ──────────────────────────────────────────────

    private String buildProactivePrompt(AssetEventDto event) {
        String action = switch (event.getAction() != null ? event.getAction() : "ADDED") {
            case "UPDATED" -> "güncelledi";
            case "REMOVED" -> "portföyünden çıkardı";
            default        -> "ekledi";
        };

        BigDecimal totalValue = event.getQuantity() != null && event.getPrice() != null
                ? event.getQuantity().multiply(event.getPrice()).setScale(2, RoundingMode.HALF_UP)
                : BigDecimal.ZERO;

        String assetType = switch (event.getType() != null ? event.getType().toUpperCase() : "ASSET") {
            case "STOCK"  -> "hisse senedi";
            case "GOLD"   -> "altın";
            case "CRYPTO" -> "kripto para";
            case "FOREX"  -> "döviz";
            default       -> "varlık";
        };

        return """
                [SİSTEM: Bu otomatik bir portföy değişikliği bildirimidir.]
                Kullanıcı az önce portföyüne %s %s %s. \
                Miktar: %s adet, birim fiyat: %s TL, toplam değer: %s TL.
                
                Lütfen bu değişikliğin portföy çeşitliliğine ve finansal sağlık skoruna etkisini \
                kısaca (2-3 cümle) değerlendir. Olumlu bir ton kullan ve bu varlık sınıfı (%s) \
                hakkında güncel piyasa bağlamına göre kısa bir yorum ekle.
                """.formatted(
                event.getSymbol(), assetType, action,
                event.getQuantity(), event.getPrice(), totalValue,
                assetType
        );
    }
}
