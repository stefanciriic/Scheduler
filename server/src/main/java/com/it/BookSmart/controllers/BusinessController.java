package com.it.BookSmart.controllers;

import com.it.BookSmart.dtos.BusinessDto;
import com.it.BookSmart.services.BusinessService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api/businesses")
public class BusinessController {

    private final BusinessService businessService;

    @GetMapping
    public ResponseEntity<List<BusinessDto>> getAllBusinesses() {
        return ResponseEntity.ok(businessService.getAllBusinesses());
    }

    @GetMapping("/{id}")
    public ResponseEntity<BusinessDto> getBusinessById(@PathVariable Long id) {
        return ResponseEntity.ok(businessService.getBusinessById(id));
    }

    @PostMapping
    public ResponseEntity<BusinessDto> createBusiness(
            @RequestPart("business") @Valid BusinessDto businessDto,
            @RequestPart(value = "file", required = false) MultipartFile file) {
        return ResponseEntity.ok(businessService.createBusiness(businessDto, file));
    }

    @PutMapping("/{id}")
    public ResponseEntity<BusinessDto> updateBusiness(@PathVariable Long id, @RequestBody @Valid BusinessDto businessDto,  @RequestPart(value = "file", required = false) MultipartFile file) {
        return ResponseEntity.ok(businessService.updateBusiness(id, businessDto,file));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteBusiness(@PathVariable Long id) {
        businessService.deleteBusiness(id);
        return ResponseEntity.noContent().build();
    }
}
