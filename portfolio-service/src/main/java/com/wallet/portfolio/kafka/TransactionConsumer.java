package com.wallet.portfolio.kafka;

import com.wallet.portfolio.dto.TransactionEvent;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.kafka.annotation.KafkaListener;
import org.springframework.stereotype.Service;

@Service
public class TransactionConsumer {

    private static final Logger LOGGER = LoggerFactory.getLogger(TransactionConsumer.class);

    @KafkaListener(topics = "transaction-events", groupId = "portfolio-group")
    public void consumeTransactionEvent(TransactionEvent event) {
        LOGGER.info(String.format("Kafka'dan islem alindi (ASYNC) -> Türü: %s, Miktar: %s, Asset ID: %s", 
                event.getType(), event.getAmount(), event.getAssetId()));
        
        // Burada ileride işlem sonrası analizler veya bildirim/mail atma gibi asenkron işler yapılabilir.
    }
}
