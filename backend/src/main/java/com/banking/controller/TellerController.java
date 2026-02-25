package com.banking.controller;

import com.banking.dto.AccountDTO;
import com.banking.security.JwtUtil;
import com.banking.service.AccountService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import jakarta.servlet.http.HttpServletRequest;
import java.util.List;

@RestController
@RequestMapping("/api/teller")
@RequiredArgsConstructor
@PreAuthorize("hasAnyRole('ADMIN', 'BANK_TELLER')")
public class TellerController {

    private final AccountService accountService;
    private final JwtUtil jwtUtil;

    @PostMapping("/accounts")
    public ResponseEntity<AccountDTO.AccountResponse> createAccount(
            @RequestBody AccountDTO.CreateAccountRequest request,
            HttpServletRequest httpRequest) {
        return ResponseEntity.ok(accountService.createAccount(request));
    }

    @PostMapping("/deposit")
    public ResponseEntity<AccountDTO.TransactionResponse> deposit(
            @RequestBody AccountDTO.TransactionRequest request,
            HttpServletRequest httpRequest) {
        Long userId = getUserId(httpRequest);
        return ResponseEntity.ok(accountService.deposit(request, userId));
    }

    @PostMapping("/withdraw")
    public ResponseEntity<AccountDTO.TransactionResponse> withdraw(
            @RequestBody AccountDTO.TransactionRequest request,
            HttpServletRequest httpRequest) {
        Long userId = getUserId(httpRequest);
        return ResponseEntity.ok(accountService.withdraw(request, userId));
    }

    @GetMapping("/accounts")
    public ResponseEntity<List<AccountDTO.AccountResponse>> getAllAccounts() {
        return ResponseEntity.ok(accountService.getAllAccounts());
    }

    @GetMapping("/accounts/{accountNumber}/transactions")
    public ResponseEntity<List<AccountDTO.TransactionResponse>> getTransactions(
            @PathVariable String accountNumber) {
        return ResponseEntity.ok(accountService.getTransactions(accountNumber));
    }

    @GetMapping("/accounts/{accountNumber}/balance")
    public ResponseEntity<AccountDTO.BalanceResponse> getBalance(@PathVariable String accountNumber) {
        return ResponseEntity.ok(accountService.getBalance(accountNumber));
    }

    private Long getUserId(HttpServletRequest request) {
        String token = request.getHeader("Authorization").substring(7);
        return jwtUtil.extractUserId(token);
    }
}
