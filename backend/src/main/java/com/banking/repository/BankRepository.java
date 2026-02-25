package com.banking.repository;

import com.banking.entity.Bank;
import org.springframework.data.jpa.repository.JpaRepository;

public interface BankRepository extends JpaRepository<Bank, Long> {
    boolean existsByIfscCode(String ifscCode);
}
