package com.banking.entity;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "banks")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Bank {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "bank_name", nullable = false)
    private String bankName;

    @Column(nullable = false)
    private String address;

    @Column(name = "pincode")
    private String pincode;

    @Column(name = "ifsc_code", unique = true)
    private String ifscCode;
}
