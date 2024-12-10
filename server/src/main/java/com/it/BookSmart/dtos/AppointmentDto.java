package com.it.BookSmart.dtos;

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
    @NotNull
    private Long id;
    private Long userId;
    private Long serviceId;
    private Long employeeId;
    private LocalDateTime appointmentTime;
    private Integer version;
}
