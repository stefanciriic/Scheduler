package com.it.BookSmart.services;

import com.it.BookSmart.dtos.ServiceTypeDto;
import com.it.BookSmart.entities.ServiceType;
import com.it.BookSmart.mappers.ServiceTypeMapper;
import com.it.BookSmart.repositories.ServiceTypeRepository;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class ServiceTypeManager {
    private final ServiceTypeRepository repository;
    private final ServiceTypeMapper mapper;

    public ServiceTypeManager(ServiceTypeRepository repository, ServiceTypeMapper mapper) {
        this.repository = repository;
        this.mapper = mapper;
    }

    public ServiceTypeDto createServiceType(ServiceTypeDto serviceTypeDto) {
        ServiceType serviceType = mapper.toEntity(serviceTypeDto);
        return mapper.toDto(repository.save(serviceType));
    }

    public ServiceTypeDto updateServiceType(Long id, ServiceTypeDto serviceTypeDto) {
        ServiceType serviceType = repository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("ServiceType not found with id: " + id));

        serviceType.setName(serviceTypeDto.getName());
        serviceType.setDescription(serviceTypeDto.getDescription());
        return mapper.toDto(repository.save(serviceType));
    }

    public void deleteServiceType(Long id) {
        repository.deleteById(id);
    }

    public List<ServiceTypeDto> getAllServiceTypes() {
        return repository.findAll().stream()
                .map(mapper::toDto)
                .toList();
    }
}

