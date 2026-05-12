package com.wallet.portfolio.service;

import com.wallet.portfolio.dto.TransactionEvent;
import com.wallet.portfolio.entity.Asset;
import com.wallet.portfolio.entity.Transaction;
import com.wallet.portfolio.repository.TransactionRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import java.util.List;

@Service
@RequiredArgsConstructor
public class TransactionService {

    private static final Logger LOGGER = LoggerFactory.getLogger(TransactionService.class);
    private final TransactionRepository transactionRepository;
    private final AssetService assetService;
    private final com.wallet.portfolio.kafka.TransactionProducer transactionProducer;

    public List<Transaction> getTransactionsByUserId(Long userId) {
        return transactionRepository.findByUserId(userId);
    }

    @Transactional
    public Transaction createTransaction(Transaction transaction) {
        try {
            // 1. İşlemi kaydet
            Transaction saved = transactionRepository.save(transaction);
            LOGGER.info("Transaction saved to database: {}", saved.getId());

            // 2. Eğer bir varlık (Asset) ile ilgiliyse, Asset bakiyesini güncelle
            if (saved.getAsset() != null) {
                updateAssetBalance(saved);
            }

            // 3. Kafka üzerinden asenkron event gönder
            notifyKafka(saved);

            return saved;
        } catch (Exception e) {
            LOGGER.error("Transaction save failed: {}", e.getMessage());
            throw e;
        }
    }

    private void updateAssetBalance(Transaction t) {
        try {
            Asset assetToUpdate = Asset.builder()
                    .user(t.getUser())
                    .symbol(t.getAsset().getSymbol())
                    .type(t.getAsset().getType())
                    .quantity(t.getAmount()) // İşlem miktarı
                    .averageBuyPrice(t.getPricePerUnit()) // İşlem fiyatı
                    .build();
            
            // Eğer satışsa miktarı negatif gönder (AssetService toplama yapıyor)
            if ("SELL".equalsIgnoreCase(t.getType())) {
                assetToUpdate.setQuantity(t.getAmount().negate());
            }

            assetService.createOrUpdateAsset(assetToUpdate);
            LOGGER.info("Asset balance updated for symbol: {}", t.getAsset().getSymbol());
        } catch (Exception e) {
            LOGGER.error("Asset update failed during transaction: {}", e.getMessage());
            // Transaction rollback olması için hata fırlatılabilir veya sadece loglanabilir.
            // Genelde finansal tutarlılık için fırlatmak daha güvenlidir.
            throw new RuntimeException("Asset update failed: " + e.getMessage());
        }
    }

    private void notifyKafka(Transaction t) {
        try {
            TransactionEvent event = TransactionEvent.builder()
                    .transactionId(t.getId())
                    .userId(t.getUser() != null ? t.getUser().getId() : null)
                    .assetId(t.getAsset() != null ? t.getAsset().getId() : null)
                    .type(t.getType())
                    .amount(t.getAmount())
                    .pricePerUnit(t.getPricePerUnit())
                    .transactionDate(t.getTransactionDate())
                    .build();
            
            transactionProducer.sendTransactionEvent(event);
        } catch (Exception kafkaError) {
            LOGGER.warn("Kafka event sending failed but transaction saved: {}", kafkaError.getMessage());
        }
    }

    @Transactional
    public void deleteTransaction(Long id) {
        transactionRepository.deleteById(id);
    }
}
