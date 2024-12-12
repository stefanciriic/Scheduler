package com.it.BookSmart.entities;

import jakarta.persistence.*;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.*;

@Getter
@Setter
@Entity
@AllArgsConstructor
@NoArgsConstructor
public class Employee {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @NotBlank(message = "Name cannot be blank")
    @Column(nullable = false, length = 100)
    private String name;

    @NotBlank(message = "Position cannot be blank")
    @Column(nullable = false, length = 50)
    private String position;

    @ManyToOne
    @JoinColumn(name = "business_id", nullable = false)
    private Business business;

    public Employee(Long employeeId) {
        this.id = employeeId;
    }
}