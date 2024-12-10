package com.it.BookSmart.dtos;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class BusinessDto {
    private Long id;
    private String name;
    private String address;
    private String description;
    private String workingHours;
    private Long ownerId;
}

