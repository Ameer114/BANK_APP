package com.banking.repository;

import com.banking.entity.BankAccount;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import java.math.BigDecimal;
import java.util.List;
import java.util.Optional;

public interface BankAccountRepository extends JpaRepository<BankAccount, Long> {
    Optional<BankAccount> findByAccountNumber(String accountNumber);
    List<BankAccount> findByUserId(Long userId);
    boolean existsByAccountNumber(String accountNumber);

    @Query("SELECT SUM(a.balance) FROM BankAccount a WHERE a.isActive = true")
    BigDecimal getTotalBalance();
}
