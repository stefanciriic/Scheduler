package com.it.BookSmart.entities;

import jakarta.persistence.*;
import lombok.*;

import java.util.List;

@Getter
@Setter
@Entity
@AllArgsConstructor
@NoArgsConstructor
public class Business {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String name;
    private String address;
    private String description;

    @OneToOne
    private User owner;

    @OneToMany(mappedBy = "business")
    private List<Employee> employees;

    @OneToMany(mappedBy = "business")
    private List<ServiceType> serviceTypes;

    private String workingHours;

    public Business(Long id, String name, String address, String description, String workingHours) {
        this.id = id;
        this.name = name;
        this.address = address;
        this.description = description;
        this.workingHours = workingHours;
    }

    public Business(Long businessId) {
        this.id = businessId;
    }
}

