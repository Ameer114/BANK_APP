package com.banking.controller;

import com.banking.dto.AccountDTO;
import com.banking.dto.AuthDTO;
import com.banking.entity.Bank;
import com.banking.entity.User;
import com.banking.repository.BankRepository;
import com.banking.repository.UserRepository;
import com.banking.service.AccountService;
import com.banking.service.AuthService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/admin")
@RequiredArgsConstructor
@PreAuthorize("hasRole('ADMIN')")
public class AdminController {

    private final AccountService accountService;
    private final AuthService authService;
    private final UserRepository userRepository;
    private final BankRepository bankRepository;

    // User Management
    @GetMapping("/users")
    public ResponseEntity<List<User>> getAllUsers() {
        return ResponseEntity.ok(userRepository.findAll());
    }

    @PostMapping("/users")
    public ResponseEntity<?> createUser(@RequestBody AuthDTO.RegisterRequest request) {
        authService.register(request);
        return ResponseEntity.ok("User created successfully");
    }

    @DeleteMapping("/users/{id}")
    public ResponseEntity<?> deleteUser(@PathVariable Long id) {
        userRepository.deleteById(id);
        return ResponseEntity.ok("User deleted");
    }

    // Bank Management
    @GetMapping("/banks")
    public ResponseEntity<List<Bank>> getAllBanks() {
        return ResponseEntity.ok(bankRepository.findAll());
    }

    @PostMapping("/banks")
    public ResponseEntity<Bank> addBank(@RequestBody Bank bank) {
        return ResponseEntity.ok(bankRepository.save(bank));
    }

    @PutMapping("/banks/{id}")
    public ResponseEntity<Bank> updateBank(@PathVariable Long id, @RequestBody Bank bank) {
        bank.setId(id);
        return ResponseEntity.ok(bankRepository.save(bank));
    }

    @DeleteMapping("/banks/{id}")
    public ResponseEntity<?> deleteBank(@PathVariable Long id) {
        bankRepository.deleteById(id);
        return ResponseEntity.ok("Bank deleted");
    }

    // Account Management
    @GetMapping("/accounts")
    public ResponseEntity<List<AccountDTO.AccountResponse>> getAllAccounts() {
        return ResponseEntity.ok(accountService.getAllAccounts());
    }

    @DeleteMapping("/accounts/{id}")
    public ResponseEntity<?> deleteAccount(@PathVariable Long id) {
        accountService.deleteAccount(id);
        return ResponseEntity.ok("Account deactivated");
    }

    @PutMapping("/accounts/{id}")
    public ResponseEntity<AccountDTO.AccountResponse> updateAccount(
            @PathVariable Long id, @RequestBody AccountDTO.CreateAccountRequest request) {
        return ResponseEntity.ok(accountService.updateAccount(id, request));
    }

    // Transactions
    @GetMapping("/transactions")
    public ResponseEntity<List<AccountDTO.TransactionResponse>> getAllTransactions() {
        return ResponseEntity.ok(accountService.getAllTransactions());
    }

    // Dashboard
    @GetMapping("/dashboard")
    public ResponseEntity<Map<String, Object>> getDashboard() {
        BigDecimal totalBalance = accountService.getTotalBalance();
        long totalUsers = userRepository.count();
        long totalAccounts = accountService.getAllAccounts().size();
        long totalTransactions = accountService.getAllTransactions().size();
        return ResponseEntity.ok(Map.of(
            "totalBalance", totalBalance,
            "totalUsers", totalUsers,
            "totalAccounts", totalAccounts,
            "totalTransactions", totalTransactions
        ));
    }
}
