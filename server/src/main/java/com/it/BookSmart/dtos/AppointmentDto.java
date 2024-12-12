package com.it.BookSmart.dtos;

import jakarta.validation.constraints.Future;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class AppointmentDto {

    private Long id;
    @NotNull(message = "User ID cannot be null")
    private Long userId;

    @NotNull(message = "Service ID cannot be null")
    private Long serviceId;

    @NotNull(message = "Employee ID cannot be null")
    private Long employeeId;

    @NotNull(message = "Appointment time cannot be null")
    @Future(message = "Appointment time must be in the future")
    private LocalDateTime appointmentTime;

    @NotBlank(message = "Service name cannot be blank")
    private String serviceName;

    private Integer version;
}
