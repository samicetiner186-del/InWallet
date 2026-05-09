package com.wallet.portfolio.kafka;

import com.wallet.portfolio.entity.Transaction;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.kafka.annotation.KafkaListener;
import org.springframework.stereotype.Service;

@Service
public class TransactionConsumer {

    private static final Logger LOGGER = LoggerFactory.getLogger(TransactionConsumer.class);

    @KafkaListener(topics = "transaction-events", groupId = "portfolio-group")
    public void consumeTransactionEvent(Transaction transaction) {
        LOGGER.info(String.format("Kafka'dan islem alindi (ASYNC) -> Türü: %s, Miktar: %s", 
                transaction.getType(), transaction.getAmount()));
        
        // Burada ileride işlem sonrası analizler veya bildirim/mail atma gibi asenkron işler yapılabilir.
    }
}
