package com.banking.dto;

import com.banking.entity.BankAccount;
import lombok.Data;
import java.math.BigDecimal;

public class AccountDTO {

    @Data
    public static class CreateAccountRequest {
        private Long userId;
        private Long bankId;
        private String name;
        private String address;
        private String phoneNumber;
        private String pin;
        private BankAccount.AccountType accountType;
        private BigDecimal initialDeposit;
    }

    @Data
    public static class AccountResponse {
        private Long id;
        private String accountNumber;
        private String name;
        private BigDecimal balance;
        private BankAccount.AccountType accountType;
        private Boolean isActive;
        private String bankName;
        private Long userId;
    }

    @Data
    public static class TransactionRequest {
        private String accountNumber;
        private BigDecimal amount;
        private String pin;
        private String description;
    }

    @Data
    public static class TransactionResponse {
        private Long id;
        private String transactionType;
        private BigDecimal amount;
        private BigDecimal balanceAfter;
        private String description;
        private String createdAt;
        private String accountNumber;
    }

    @Data
    public static class BalanceResponse {
        private String accountNumber;
        private BigDecimal balance;
        private String name;
    }

    @Data
    public static class SetPinRequest {
        private String accountNumber;
        private String newPin;
    }
}
