package com.banking.repository;

import com.banking.entity.Transaction;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface TransactionRepository extends JpaRepository<Transaction, Long> {
    List<Transaction> findByAccountIdOrderByCreatedAtDesc(Long accountId);
    List<Transaction> findAllByOrderByCreatedAtDesc();
}
