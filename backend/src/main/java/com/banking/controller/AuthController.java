package com.banking.controller;

import com.banking.dto.AuthDTO;
import com.banking.service.AuthService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
public class AuthController {

    private final AuthService authService;

    @PostMapping("/login")
    public ResponseEntity<AuthDTO.LoginResponse> login(@RequestBody AuthDTO.LoginRequest request) {
        return ResponseEntity.ok(authService.login(request));
    }

    @PostMapping("/register")
    public ResponseEntity<?> register(@RequestBody AuthDTO.RegisterRequest request) {
        authService.register(request);
        return ResponseEntity.ok("User registered successfully");
    }
}
