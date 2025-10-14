package com.it.BookSmart.controllers;

import com.it.BookSmart.dtos.AppointmentDto;
import com.it.BookSmart.services.AppointmentService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api/appointments")
public class AppointmentController {

    private final AppointmentService appointmentService;

    @GetMapping
    public ResponseEntity<List<AppointmentDto>> getAllAppointments() {
        return ResponseEntity.ok(appointmentService.getAllAppointments());
    }

    @GetMapping("/{id}")
    public ResponseEntity<AppointmentDto> getAppointmentById(@PathVariable Long id) {
        return ResponseEntity.ok(appointmentService.getAppointmentById(id));
    }

    @GetMapping("/user/{userId}")
    public ResponseEntity<List<AppointmentDto>> getAppointmentsByUserId(@PathVariable Long userId) {
        return ResponseEntity.ok(appointmentService.getAppointmentsByUserId(userId));
    }

    @GetMapping("/business/{businessId}")
    public ResponseEntity<List<AppointmentDto>> getAppointmentsByBusinessId(@PathVariable Long businessId) {
        return ResponseEntity.ok(appointmentService.getAppointmentsByBusinessId(businessId));
    }

    @PostMapping
    public ResponseEntity<AppointmentDto> createAppointment(@RequestBody @Valid AppointmentDto appointmentDto) {
        return ResponseEntity.ok(appointmentService.createAppointment(appointmentDto));
    }

    @PutMapping("/{id}")
    public ResponseEntity<AppointmentDto> updateAppointment(@PathVariable Long id, @RequestBody @Valid AppointmentDto appointmentDto) {
        return ResponseEntity.ok(appointmentService.updateAppointment(id, appointmentDto));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteAppointment(@PathVariable Long id) {
        appointmentService.deleteAppointment(id);
        return ResponseEntity.noContent().build();
    }

    @DeleteMapping("/{id}/permanent")
    public ResponseEntity<Void> permanentlyDeleteAppointment(@PathVariable Long id) {
        appointmentService.permanentlyDeleteAppointment(id);
        return ResponseEntity.noContent().build();
    }
}
