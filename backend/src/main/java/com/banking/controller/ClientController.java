package com.banking.controller;

import com.banking.dto.AccountDTO;
import com.banking.security.JwtUtil;
import com.banking.service.AccountService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import jakarta.servlet.http.HttpServletRequest;
import java.util.List;

@RestController
@RequestMapping("/api/client")
@RequiredArgsConstructor
public class ClientController {

    private final AccountService accountService;
    private final JwtUtil jwtUtil;

    @GetMapping("/accounts")
    public ResponseEntity<List<AccountDTO.AccountResponse>> getMyAccounts(HttpServletRequest request) {
        Long userId = getUserId(request);
        return ResponseEntity.ok(accountService.getAccountsByUser(userId));
    }

    @GetMapping("/accounts/{accountNumber}/balance")
    public ResponseEntity<AccountDTO.BalanceResponse> getBalance(
            @PathVariable String accountNumber) {
        return ResponseEntity.ok(accountService.getBalance(accountNumber));
    }

    @GetMapping("/accounts/{accountNumber}/transactions")
    public ResponseEntity<List<AccountDTO.TransactionResponse>> getTransactions(
            @PathVariable String accountNumber) {
        return ResponseEntity.ok(accountService.getTransactions(accountNumber));
    }

    @PostMapping("/accounts/pin")
    public ResponseEntity<?> setPin(@RequestBody AccountDTO.SetPinRequest request) {
        accountService.setPin(request);
        return ResponseEntity.ok("PIN set successfully");
    }

    @PostMapping("/withdraw")
    public ResponseEntity<AccountDTO.TransactionResponse> withdraw(
            @RequestBody AccountDTO.TransactionRequest request,
            HttpServletRequest httpRequest) {
        Long userId = getUserId(httpRequest);
        return ResponseEntity.ok(accountService.withdraw(request, userId));
    }

    private Long getUserId(HttpServletRequest request) {
        String token = request.getHeader("Authorization").substring(7);
        return jwtUtil.extractUserId(token);
    }
}
