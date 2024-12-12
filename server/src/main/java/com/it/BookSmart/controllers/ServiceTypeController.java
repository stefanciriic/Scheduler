package com.it.BookSmart.controllers;

import com.it.BookSmart.dtos.AppointmentDto;
import com.it.BookSmart.dtos.ServiceTypeDto;
import com.it.BookSmart.entities.ServiceType;
import com.it.BookSmart.services.ServiceTypeManager;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api/service-types")
public class ServiceTypeController {

    private final ServiceTypeManager serviceTypeManager;

    @GetMapping
    public ResponseEntity<List<ServiceTypeDto>> getAllServiceTypes() {
        return ResponseEntity.ok(serviceTypeManager.getAllServiceTypes());
    }

    @GetMapping("/{id}")
    public ResponseEntity<ServiceTypeDto> getServiceTypeById(@PathVariable Long id) {
        return ResponseEntity.ok(serviceTypeManager.getServiceTypeById(id));
    }

    @PostMapping
    public ResponseEntity<ServiceTypeDto> createServiceType(@RequestBody @Valid ServiceTypeDto serviceTypeDto) {
        return ResponseEntity.ok(serviceTypeManager.createServiceType(serviceTypeDto));
    }

    @PutMapping("/{id}")
    public ResponseEntity<ServiceTypeDto> updateServiceType(@PathVariable Long id, @RequestBody @Valid ServiceTypeDto serviceTypeDto) {
        return ResponseEntity.ok(serviceTypeManager.updateServiceType(id, serviceTypeDto));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteServiceType(@PathVariable Long id) {
        serviceTypeManager.deleteServiceType(id);
        return ResponseEntity.noContent().build();
    }

}
