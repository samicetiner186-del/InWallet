package com.wallet.portfolio.kafka;

import com.wallet.portfolio.dto.AssetEvent;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.kafka.core.KafkaTemplate;
import org.springframework.stereotype.Service;

@Service
public class AssetEventProducer {

    private static final Logger LOGGER = LoggerFactory.getLogger(AssetEventProducer.class);
    private static final String TOPIC = "asset-events";

    private final KafkaTemplate<String, Object> kafkaTemplate;

    public AssetEventProducer(KafkaTemplate<String, Object> kafkaTemplate) {
        this.kafkaTemplate = kafkaTemplate;
    }

    public void sendAssetEvent(AssetEvent event) {
        try {
            String key = event.getUserId() + "-" + event.getSymbol();
            LOGGER.info("Kafka'ya asset eventi gönderiliyor -> User: {}, Symbol: {}, Action: {}",
                    event.getUserId(), event.getSymbol(), event.getAction());

            kafkaTemplate.send(TOPIC, key, event).whenComplete((result, ex) -> {
                if (ex != null) {
                    LOGGER.error("Asset event gönderimi başarısız: {}", ex.getMessage());
                } else {
                    LOGGER.info("Asset event başarıyla gönderildi: {} - {}", event.getSymbol(), event.getAction());
                }
            });
        } catch (Exception e) {
            // Asset işlemi başarısız olmasın, sadece logla
            LOGGER.warn("Kafka asset event gönderilemedi (non-critical): {}", e.getMessage());
        }
    }
}
