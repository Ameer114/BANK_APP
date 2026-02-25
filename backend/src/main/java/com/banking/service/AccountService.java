package com.banking.service;

import com.banking.dto.AccountDTO;
import com.banking.entity.BankAccount;
import com.banking.entity.Transaction;
import com.banking.entity.User;
import com.banking.repository.BankAccountRepository;
import com.banking.repository.BankRepository;
import com.banking.repository.TransactionRepository;
import com.banking.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.format.DateTimeFormatter;
import java.util.List;
import java.util.Random;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class AccountService {

    private final BankAccountRepository accountRepository;
    private final TransactionRepository transactionRepository;
    private final UserRepository userRepository;
    private final BankRepository bankRepository;
    private final PasswordEncoder passwordEncoder;

    @Transactional
    public AccountDTO.AccountResponse createAccount(AccountDTO.CreateAccountRequest request) {
        User user = userRepository.findById(request.getUserId())
                .orElseThrow(() -> new RuntimeException("User not found"));

        BankAccount account = BankAccount.builder()
                .accountNumber(generateAccountNumber())
                .user(user)
                .bank(request.getBankId() != null ? bankRepository.findById(request.getBankId()).orElse(null) : null)
                .name(request.getName())
                .address(request.getAddress())
                .phoneNumber(request.getPhoneNumber())
                .pinHash(request.getPin() != null ? passwordEncoder.encode(request.getPin()) : null)
                .accountType(request.getAccountType() != null ? request.getAccountType() : BankAccount.AccountType.SAVINGS)
                .balance(BigDecimal.ZERO)
                .isActive(true)
                .build();

        BankAccount saved = accountRepository.save(account);

        // Initial deposit if provided
        if (request.getInitialDeposit() != null && request.getInitialDeposit().compareTo(BigDecimal.ZERO) > 0) {
            saved.setBalance(request.getInitialDeposit());
            accountRepository.save(saved);
            Transaction txn = Transaction.builder()
                    .account(saved)
                    .transactionType(Transaction.TransactionType.DEPOSIT)
                    .amount(request.getInitialDeposit())
                    .balanceAfter(request.getInitialDeposit())
                    .description("Initial deposit")
                    .build();
            transactionRepository.save(txn);
        }

        return toResponse(saved);
    }

    @Transactional
    public AccountDTO.TransactionResponse deposit(AccountDTO.TransactionRequest request, Long performedBy) {
        BankAccount account = accountRepository.findByAccountNumber(request.getAccountNumber())
                .orElseThrow(() -> new RuntimeException("Account not found"));

        if (!account.getIsActive()) throw new RuntimeException("Account is not active");
        if (request.getAmount().compareTo(BigDecimal.ZERO) <= 0) throw new RuntimeException("Amount must be positive");

        account.setBalance(account.getBalance().add(request.getAmount()));
        accountRepository.save(account);

        Transaction txn = Transaction.builder()
                .account(account)
                .transactionType(Transaction.TransactionType.DEPOSIT)
                .amount(request.getAmount())
                .balanceAfter(account.getBalance())
                .description(request.getDescription())
                .performedBy(performedBy)
                .build();
        transactionRepository.save(txn);

        return toTransactionResponse(txn);
    }

    @Transactional
    public AccountDTO.TransactionResponse withdraw(AccountDTO.TransactionRequest request, Long performedBy) {
        BankAccount account = accountRepository.findByAccountNumber(request.getAccountNumber())
                .orElseThrow(() -> new RuntimeException("Account not found"));

        if (!account.getIsActive()) throw new RuntimeException("Account is not active");
        if (request.getAmount().compareTo(BigDecimal.ZERO) <= 0) throw new RuntimeException("Amount must be positive");

        // Verify PIN for client withdrawals
        if (request.getPin() != null && !passwordEncoder.matches(request.getPin(), account.getPinHash())) {
            throw new RuntimeException("Invalid PIN");
        }

        if (account.getBalance().compareTo(request.getAmount()) < 0) {
            throw new RuntimeException("Insufficient balance");
        }

        account.setBalance(account.getBalance().subtract(request.getAmount()));
        accountRepository.save(account);

        Transaction txn = Transaction.builder()
                .account(account)
                .transactionType(Transaction.TransactionType.WITHDRAW)
                .amount(request.getAmount())
                .balanceAfter(account.getBalance())
                .description(request.getDescription())
                .performedBy(performedBy)
                .build();
        transactionRepository.save(txn);

        return toTransactionResponse(txn);
    }

    public AccountDTO.BalanceResponse getBalance(String accountNumber) {
        BankAccount account = accountRepository.findByAccountNumber(accountNumber)
                .orElseThrow(() -> new RuntimeException("Account not found"));
        AccountDTO.BalanceResponse response = new AccountDTO.BalanceResponse();
        response.setAccountNumber(account.getAccountNumber());
        response.setBalance(account.getBalance());
        response.setName(account.getName());
        return response;
    }

    public List<AccountDTO.TransactionResponse> getTransactions(String accountNumber) {
        BankAccount account = accountRepository.findByAccountNumber(accountNumber)
                .orElseThrow(() -> new RuntimeException("Account not found"));
        return transactionRepository.findByAccountIdOrderByCreatedAtDesc(account.getId())
                .stream().map(this::toTransactionResponse).collect(Collectors.toList());
    }

    public List<AccountDTO.AccountResponse> getAllAccounts() {
        return accountRepository.findAll().stream().map(this::toResponse).collect(Collectors.toList());
    }

    public List<AccountDTO.AccountResponse> getAccountsByUser(Long userId) {
        return accountRepository.findByUserId(userId).stream().map(this::toResponse).collect(Collectors.toList());
    }

    @Transactional
    public void deleteAccount(Long accountId) {
        BankAccount account = accountRepository.findById(accountId)
                .orElseThrow(() -> new RuntimeException("Account not found"));
        account.setIsActive(false);
        accountRepository.save(account);
    }

    @Transactional
    public AccountDTO.AccountResponse updateAccount(Long accountId, AccountDTO.CreateAccountRequest request) {
        BankAccount account = accountRepository.findById(accountId)
                .orElseThrow(() -> new RuntimeException("Account not found"));
        if (request.getName() != null) account.setName(request.getName());
        if (request.getAddress() != null) account.setAddress(request.getAddress());
        if (request.getPhoneNumber() != null) account.setPhoneNumber(request.getPhoneNumber());
        return toResponse(accountRepository.save(account));
    }

    @Transactional
    public void setPin(AccountDTO.SetPinRequest request) {
        BankAccount account = accountRepository.findByAccountNumber(request.getAccountNumber())
                .orElseThrow(() -> new RuntimeException("Account not found"));
        account.setPinHash(passwordEncoder.encode(request.getNewPin()));
        accountRepository.save(account);
    }

    public List<AccountDTO.TransactionResponse> getAllTransactions() {
        return transactionRepository.findAllByOrderByCreatedAtDesc()
                .stream().map(this::toTransactionResponse).collect(Collectors.toList());
    }

    public BigDecimal getTotalBalance() {
        BigDecimal total = accountRepository.getTotalBalance();
        return total != null ? total : BigDecimal.ZERO;
    }

    private String generateAccountNumber() {
        Random random = new Random();
        String number;
        do {
            number = String.format("%010d", (long)(random.nextDouble() * 9_999_999_999L));
        } while (accountRepository.existsByAccountNumber(number));
        return number;
    }

    private AccountDTO.AccountResponse toResponse(BankAccount account) {
        AccountDTO.AccountResponse r = new AccountDTO.AccountResponse();
        r.setId(account.getId());
        r.setAccountNumber(account.getAccountNumber());
        r.setName(account.getName());
        r.setBalance(account.getBalance());
        r.setAccountType(account.getAccountType());
        r.setIsActive(account.getIsActive());
        r.setBankName(account.getBank() != null ? account.getBank().getBankName() : null);
        r.setUserId(account.getUser().getId());
        return r;
    }

    private AccountDTO.TransactionResponse toTransactionResponse(Transaction txn) {
        AccountDTO.TransactionResponse r = new AccountDTO.TransactionResponse();
        r.setId(txn.getId());
        r.setTransactionType(txn.getTransactionType().name());
        r.setAmount(txn.getAmount());
        r.setBalanceAfter(txn.getBalanceAfter());
        r.setDescription(txn.getDescription());
        r.setCreatedAt(txn.getCreatedAt().format(DateTimeFormatter.ISO_LOCAL_DATE_TIME));
        r.setAccountNumber(txn.getAccount().getAccountNumber());
        return r;
    }
}
