package com.wallet.ai.service;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.datatype.jsr310.JavaTimeModule;
import com.wallet.ai.dto.AssetEventDto;
import org.apache.kafka.clients.consumer.ConsumerConfig;
import org.apache.kafka.common.serialization.StringDeserializer;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.kafka.config.ConcurrentKafkaListenerContainerFactory;
import org.springframework.kafka.core.ConsumerFactory;
import org.springframework.kafka.core.DefaultKafkaConsumerFactory;
import org.springframework.kafka.support.serializer.ErrorHandlingDeserializer;
import org.springframework.kafka.support.serializer.JsonDeserializer;

import java.util.HashMap;
import java.util.Map;

@Configuration
public class KafkaConsumerConfig {

    @Value("${spring.kafka.bootstrap-servers:kafka:29092}")
    private String bootstrapServers;

    @Bean
    public ConsumerFactory<String, AssetEventDto> assetEventConsumerFactory() {
        ObjectMapper mapper = new ObjectMapper()
                .registerModule(new JavaTimeModule());

        JsonDeserializer<AssetEventDto> jsonDeserializer =
                new JsonDeserializer<>(AssetEventDto.class, mapper, false);
        jsonDeserializer.addTrustedPackages("*");

        Map<String, Object> props = new HashMap<>();
        props.put(ConsumerConfig.BOOTSTRAP_SERVERS_CONFIG, bootstrapServers);
        props.put(ConsumerConfig.GROUP_ID_CONFIG, "ai-assistant-group");
        props.put(ConsumerConfig.AUTO_OFFSET_RESET_CONFIG, "latest");
        props.put(ConsumerConfig.KEY_DESERIALIZER_CLASS_CONFIG, StringDeserializer.class);
        props.put(ConsumerConfig.VALUE_DESERIALIZER_CLASS_CONFIG, ErrorHandlingDeserializer.class);
        props.put(ErrorHandlingDeserializer.VALUE_DESERIALIZER_CLASS, JsonDeserializer.class);
        // Kafka bağlantı timeout — Kafka çalışmıyorsa servisi bloke etme
        props.put(ConsumerConfig.SESSION_TIMEOUT_MS_CONFIG, 15000);
        props.put(ConsumerConfig.HEARTBEAT_INTERVAL_MS_CONFIG, 3000);
        props.put(ConsumerConfig.REQUEST_TIMEOUT_MS_CONFIG, 10000);

        return new DefaultKafkaConsumerFactory<>(props, new StringDeserializer(), jsonDeserializer);
    }

    @Bean
    public ConcurrentKafkaListenerContainerFactory<String, AssetEventDto> kafkaListenerContainerFactory(
            ConsumerFactory<String, AssetEventDto> assetEventConsumerFactory
    ) {
        ConcurrentKafkaListenerContainerFactory<String, AssetEventDto> factory =
                new ConcurrentKafkaListenerContainerFactory<>();
        factory.setConsumerFactory(assetEventConsumerFactory);
        // Kafka kapalıysa consumer otomatik retry yapar, uygulamayı durdurmaz
        factory.getContainerProperties().setMissingTopicsFatal(false);
        return factory;
    }
}
