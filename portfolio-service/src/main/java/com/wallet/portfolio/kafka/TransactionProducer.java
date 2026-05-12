package com.wallet.portfolio.kafka;

import com.wallet.portfolio.dto.TransactionEvent;
import com.wallet.portfolio.entity.Transaction;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.kafka.core.KafkaTemplate;
import org.springframework.stereotype.Service;

@Service
public class TransactionProducer {

    private static final Logger LOGGER = LoggerFactory.getLogger(TransactionProducer.class);
    private static final String TOPIC = "transaction-events";

    private final KafkaTemplate<String, Object> kafkaTemplate;

    public TransactionProducer(KafkaTemplate<String, Object> kafkaTemplate) {
        this.kafkaTemplate = kafkaTemplate;
    }

    public void sendTransactionEvent(TransactionEvent event) {
        try {
            LOGGER.info("Kafka'ya islem gonderiliyor -> ID: {}", event.getTransactionId());
            var sendResult = kafkaTemplate.send(TOPIC, event.getTransactionId().toString(), event);
            sendResult.whenComplete((result, ex) -> {
                if (ex != null) {
                    LOGGER.error("Kafka event gonderimi basarısız: {}", ex.getMessage());
                } else {
                    LOGGER.info("Kafka event başarıyla gönderildi: {}", event.getTransactionId());
                }
            });
        } catch (Exception e) {
            LOGGER.error("Kafka send hatası: {}", e.getMessage());
            throw e;
        }
    }
}
