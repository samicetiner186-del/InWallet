package com.wallet.portfolio.kafka;

import com.wallet.portfolio.entity.Transaction;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.kafka.core.KafkaTemplate;
import org.springframework.stereotype.Service;

@Service
public class TransactionProducer {

    private static final Logger LOGGER = LoggerFactory.getLogger(TransactionProducer.class);
    private static final String TOPIC = "transaction-events";

    private final KafkaTemplate<String, Transaction> kafkaTemplate;

    public TransactionProducer(KafkaTemplate<String, Transaction> kafkaTemplate) {
        this.kafkaTemplate = kafkaTemplate;
    }

    public void sendTransactionEvent(Transaction transaction) {
        LOGGER.info(String.format("Kafka'ya islem gonderiliyor -> %s", transaction.toString()));
        kafkaTemplate.send(TOPIC, transaction);
    }
}
