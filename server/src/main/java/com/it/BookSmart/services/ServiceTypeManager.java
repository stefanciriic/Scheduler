package com.it.BookSmart.services;

import com.it.BookSmart.dtos.ServiceTypeDto;
import com.it.BookSmart.entities.Business;
import com.it.BookSmart.entities.Employee;
import com.it.BookSmart.entities.ServiceType;
import com.it.BookSmart.exceptions.ConflictException;
import com.it.BookSmart.exceptions.ResourceNotFoundException;
import com.it.BookSmart.exceptions.ValidationException;
import com.it.BookSmart.mappers.ServiceTypeMapper;
import com.it.BookSmart.repositories.BusinessRepository;
import com.it.BookSmart.repositories.EmployeeRepository;
import com.it.BookSmart.repositories.ServiceTypeRepository;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
@Slf4j
public class ServiceTypeManager {

    private final ServiceTypeRepository repository;
    private final ServiceTypeMapper mapper;
    private final BusinessRepository businessRepository;
    private final EmployeeRepository employeeRepository;

    public List<ServiceTypeDto> getServicesByBusinessId(Long businessId) {
        Business business = businessRepository.findById(businessId)
                .orElseThrow(() -> new ResourceNotFoundException("Business not found with id: " + businessId));

        return repository.findByBusinessId(businessId).stream()
                .map(mapper::toDto)
                .toList();
    }

    public ServiceTypeDto createServiceType(ServiceTypeDto dto) {
        validateServiceTypeDto(dto);

        if (repository.existsByNameAndBusinessId(dto.getName().trim(), dto.getBusinessId())) {
            throw new ConflictException("Service type with the same name already exists in the business");
        }

        Business business = businessRepository.findById(dto.getBusinessId())
                .orElseThrow(() -> new ResourceNotFoundException("Business not found with id: " + dto.getBusinessId()));

        ServiceType serviceType = mapper.toEntity(dto);
        serviceType.setBusiness(business);

        // Handle employee if provided
        if (dto.getEmployeeId() != null) {
            Employee employee = employeeRepository.findById(dto.getEmployeeId())
                    .orElseThrow(() -> new ResourceNotFoundException("Employee not found with id: " + dto.getEmployeeId()));

            if (!employee.getBusiness().getId().equals(business.getId())) {
                throw new ConflictException("Employee does not belong to the same business as the service type");
            }
            serviceType.setEmployee(employee);
        }

        ServiceType saved = repository.save(serviceType);
        log.info("Created ServiceType with id: {}", saved.getId());
        return mapper.toDto(saved);
    }

    @Transactional
    public ServiceTypeDto updateServiceType(Long id, ServiceTypeDto dto) {
        ServiceType serviceType = repository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("ServiceType not found with id: " + id));

        // Update name
        if (dto.getName() != null) {
            String newName = dto.getName().trim();
            if (!newName.equals(serviceType.getName())) {
                Long businessId = serviceType.getBusiness().getId();
                if (repository.existsByNameAndBusinessId(newName, businessId)) {
                    throw new ConflictException("Another service type with the same name already exists in the business");
                }
                serviceType.setName(newName);
            }
        }

        // Update description
        if (dto.getDescription() != null) {
            serviceType.setDescription(dto.getDescription().trim());
        }

        // Update price
        if (dto.getPrice() != null) {
            Double price = dto.getPrice();
            if (price < 0) {
                throw new ValidationException("Price must be non-negative");
            }
            serviceType.setPrice(price);
        }

        // Update employee
        if (dto.getEmployeeId() == null) {
            serviceType.setEmployee(null); // remove employee if null
        } else {
            Employee employee = employeeRepository.findById(dto.getEmployeeId())
                    .orElseThrow(() -> new ResourceNotFoundException("Employee not found with id: " + dto.getEmployeeId()));

            if (!employee.getBusiness().getId().equals(serviceType.getBusiness().getId())) {
                throw new ConflictException("Employee does not belong to the same business as the service type");
            }
            serviceType.setEmployee(employee);
        }

        ServiceType saved = repository.save(serviceType);
        log.info("Updated ServiceType with id: {}", saved.getId());
        return mapper.toDto(saved);
    }

    public void deleteServiceType(Long id) {
        ServiceType serviceType = repository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("ServiceType not found with id: " + id));

        repository.delete(serviceType);
        log.info("Deleted ServiceType with id: {}", id);
    }

    public List<ServiceTypeDto> getAllServiceTypes() {
        return repository.findAll().stream()
                .map(mapper::toDto)
                .toList();
    }

    public ServiceTypeDto getServiceTypeById(Long id) {
        ServiceType serviceType = repository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("ServiceType not found with id: " + id));
        return mapper.toDto(serviceType);
    }

    private void validateServiceTypeDto(ServiceTypeDto dto) {
        if (dto.getName() == null || dto.getName().trim().isEmpty()) {
            throw new ValidationException("Service name cannot be blank");
        }
        if (dto.getPrice() == null || dto.getPrice() < 0) {
            throw new ValidationException("Price must be non-negative");
        }
        if (dto.getBusinessId() == null) {
            throw new ValidationException("Business ID is required");
        }
    }
}
