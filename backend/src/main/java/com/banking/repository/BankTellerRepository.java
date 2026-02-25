package com.banking.repository;

import com.banking.entity.BankTeller;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.Optional;

public interface BankTellerRepository extends JpaRepository<BankTeller, Long> {
    Optional<BankTeller> findByUserId(Long userId);
}
