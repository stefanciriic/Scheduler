package com.it.BookSmart.dtos;

import jakarta.persistence.Column;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class BusinessDto {
    private Long id;
    @NotBlank(message = "Name cannot be blank")
    @Size(max = 100, message = "Name cannot exceed 100 characters")
    private String name;

    @NotBlank(message = "Address cannot be blank")
    @Size(max = 200, message = "Address cannot exceed 200 characters")
    private String address;

    @NotBlank(message = "Description cannot be blank")
    @Size(max = 500, message = "Description cannot exceed 500 characters")
    private String description;

    @NotBlank(message = "Working hours cannot be blank")
    private String workingHours;

    @Size(max = 100, message = "City cannot exceed 100 characters")
    private String city;

    @Size(max = 15, message = "Contact phone cannot exceed 15 characters")
    @Column(length = 15)
    private String contactPhone;

    @NotNull(message = "Owner ID cannot be null")
    private Long ownerId;

    private String imageUrl;

    private List<Long> employeeIds;
    private List<Long> serviceTypeIds;

}

