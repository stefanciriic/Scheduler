package com.it.BookSmart.services;

import com.it.BookSmart.dtos.ServiceTypeDto;
import com.it.BookSmart.entities.Business;
import com.it.BookSmart.entities.ServiceType;
import com.it.BookSmart.exceptions.ConflictException;
import com.it.BookSmart.exceptions.ResourceNotFoundException;
import com.it.BookSmart.exceptions.ValidationException;
import com.it.BookSmart.mappers.ServiceTypeMapper;
import com.it.BookSmart.repositories.BusinessRepository;
import com.it.BookSmart.repositories.ServiceTypeRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class ServiceTypeManager {

    private final ServiceTypeRepository repository;

    private final ServiceTypeMapper mapper;

    private final BusinessRepository businessRepository;

    public List<ServiceTypeDto> getServicesByBusinessId(Long businessId) {
        return repository.findByBusinessId(businessId).stream()
                .map(mapper::toDto)
                .toList();
    }

    public ServiceTypeDto createServiceType(ServiceTypeDto serviceTypeDto) {
        if (repository.existsByNameAndBusinessId(serviceTypeDto.getName(), serviceTypeDto.getBusinessId())) {
            throw new ConflictException("Service type with the same name already exists in the business");
        }
        Business business = businessRepository.findById(serviceTypeDto.getBusinessId())
                .orElseThrow(() -> new ResourceNotFoundException("Business not found"));

        ServiceType serviceType = mapper.toEntity(serviceTypeDto);
        serviceType.setBusiness(business);

        return mapper.toDto(repository.save(serviceType));
    }

    public ServiceTypeDto updateServiceType(Long id, ServiceTypeDto serviceTypeDto) {
        ServiceType serviceType = repository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("ServiceType not found with id: " + id));

        if (!serviceType.getName().equals(serviceTypeDto.getName()) &&
                repository.existsByNameAndBusinessId(serviceTypeDto.getName(), serviceType.getBusiness().getId())) {
            throw new ConflictException("Another service type with the same name already exists in the business");
        }

        if (serviceTypeDto.getName() != null) {
            serviceType.setName(serviceTypeDto.getName());
        }
        if (serviceTypeDto.getDescription() != null) {
            serviceType.setDescription(serviceTypeDto.getDescription());
        }

        serviceType.setPrice(serviceTypeDto.getPrice());

        return mapper.toDto(repository.save(serviceType));
    }

    public void deleteServiceType(Long id) {
        if (!repository.existsById(id)) {
            throw new ResourceNotFoundException("ServiceType not found with id: " + id);
        }
        repository.deleteById(id);
    }

    public List<ServiceTypeDto> getAllServiceTypes() {
        List<ServiceType> serviceTypes = repository.findAll();
        return serviceTypes.stream()
                .map(mapper::toDto)
                .toList();
    }

    public ServiceTypeDto getServiceTypeById(Long id) {
        ServiceType serviceType = repository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("ServiceType not found with id: " + id));
        return mapper.toDto(serviceType);
    }
}
