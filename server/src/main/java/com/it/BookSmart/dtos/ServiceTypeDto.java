package com.it.BookSmart.dtos;

import lombok.*;

@Getter
@Setter
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class ServiceTypeDto {
    private Long id;
    private String name;
    private String description;
    private Double price;
    private Long businessId; // ID firme kojoj usluga pripada
    private Long employeeId; // ID zaposlenog koji obavlja uslugu (opciono)
}
