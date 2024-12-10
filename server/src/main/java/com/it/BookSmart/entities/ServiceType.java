package com.it.BookSmart.entities;

import jakarta.persistence.*;
import lombok.*;

@Getter
@Setter
@Entity
@AllArgsConstructor
@NoArgsConstructor
public class ServiceType {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String name;
    private String description;
    private Double price;

    @ManyToOne
    private Business business;

    @ManyToOne
    private Employee employee; // Opcionalno povezana sa zaposlenim

    public ServiceType(Long serviceId) {
        this.id = serviceId;
    }
}

