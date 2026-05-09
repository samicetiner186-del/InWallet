package com.wallet.portfolio.service;

import com.wallet.portfolio.entity.Transaction;
import com.wallet.portfolio.repository.TransactionRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class TransactionService {

    private final TransactionRepository transactionRepository;
    private final com.wallet.portfolio.kafka.TransactionProducer transactionProducer;

    public List<Transaction> getTransactionsByUserId(Long userId) {
        return transactionRepository.findByUserId(userId);
    }

    public Transaction createTransaction(Transaction transaction) {
        Transaction saved = transactionRepository.save(transaction);
        transactionProducer.sendTransactionEvent(saved);
        return saved;
    }
}
