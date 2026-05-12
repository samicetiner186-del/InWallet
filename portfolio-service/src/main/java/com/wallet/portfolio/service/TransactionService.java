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
    private final com.wallet.portfolio.repository.BudgetRepository budgetRepository;
    private final com.wallet.portfolio.service.EmailService emailService;
    private final com.wallet.portfolio.kafka.TransactionProducer transactionProducer;

    public List<Transaction> getTransactionsByUserId(Long userId) {
        return transactionRepository.findByUserId(userId);
    }

    @Transactional
    public Transaction createTransaction(Transaction transaction) {
        try {
            // 0. Kullanıcı Kontrolü
            if (transaction.getUser() == null || transaction.getUser().getId() == null) {
                throw new IllegalArgumentException("İşlem için kullanıcı bilgisi zorunludur.");
            }

            // 1. Bütçe Kontrolü (Gider ise)
            if ("EXPENSE".equalsIgnoreCase(transaction.getType())) {
                checkBudgetLimit(transaction);
            }

            // 2. İşlemi kaydet
            Transaction saved = transactionRepository.save(transaction);
            LOGGER.info("Transaction saved to database: {}", saved.getId());

            // 3. Eğer bir varlık (Asset) ile ilgiliyse, Asset bakiyesini güncelle
            if (saved.getAsset() != null) {
                updateAssetBalance(saved);
            }

            // 4. Kafka üzerinden asenkron event gönder
            notifyKafka(saved);

            return saved;
        } catch (Exception e) {
            LOGGER.error("Transaction save failed: {}", e.getMessage());
            throw e;
        }
    }

    private void updateAssetBalance(Transaction t) {
        try {
            if (t.getAsset() == null) return;
            
            // Eğer symbol veya type eksikse (frontend genelde sadece ID gönderir), veritabanından çek
            String symbol = t.getAsset().getSymbol();
            String type = t.getAsset().getType();
            
            if (symbol == null || type == null) {
                com.wallet.portfolio.entity.Asset dbAsset = assetService.getAssetById(t.getAsset().getId());
                if (dbAsset != null) {
                    symbol = dbAsset.getSymbol();
                    type = dbAsset.getType();
                }
            }

            Asset assetToUpdate = Asset.builder()
                    .user(t.getUser())
                    .symbol(symbol)
                    .type(type)
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

    private void checkBudgetLimit(Transaction t) {
        if (t.getUser() == null || t.getCategory() == null) return;
        
        budgetRepository.findByUserIdAndCategory(t.getUser().getId(), t.getCategory())
            .ifPresent(budget -> {
                java.math.BigDecimal currentMonthExpense = transactionRepository.findByUserId(t.getUser().getId()).stream()
                    .filter(tx -> "EXPENSE".equalsIgnoreCase(tx.getType()) && t.getCategory().equals(tx.getCategory()))
                    .map(Transaction::getAmount)
                    .reduce(java.math.BigDecimal.ZERO, java.math.BigDecimal::add);
                
                java.math.BigDecimal totalAfterThis = currentMonthExpense.add(t.getAmount());
                
                if (totalAfterThis.compareTo(budget.getLimitAmount()) > 0) {
                    LOGGER.warn("BÜTÇE AŞIMI! Kategori: {}, Limit: {}, Tahmini Toplam: {}", 
                        t.getCategory(), budget.getLimitAmount(), totalAfterThis);
                    
                    emailService.sendBudgetWarning(
                        t.getUser().getEmail(), 
                        t.getCategory(), 
                        budget.getLimitAmount().toString()
                    );
                }
            });
    }
}
