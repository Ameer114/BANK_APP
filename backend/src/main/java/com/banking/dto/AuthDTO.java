package com.banking.dto;

import lombok.Data;

public class AuthDTO {

    @Data
    public static class LoginRequest {
        private String username;
        private String password;
    }

    @Data
    public static class LoginResponse {
        private String token;
        private String role;
        private Long userId;
        private String name;

        public LoginResponse(String token, String role, Long userId, String name) {
            this.token = token;
            this.role = role;
            this.userId = userId;
            this.name = name;
        }
    }

    @Data
    public static class RegisterRequest {
        private String username;
        private String password;
        private String name;
        private String email;
        private String phoneNumber;
        private String role; // ADMIN, BANK_TELLER, CLIENT
    }
}
