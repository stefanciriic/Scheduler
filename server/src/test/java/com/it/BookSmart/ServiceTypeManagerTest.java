package com.it.BookSmart;

import com.it.BookSmart.dtos.ServiceTypeDto;
import com.it.BookSmart.entities.ServiceType;
import com.it.BookSmart.mappers.ServiceTypeMapper;
import com.it.BookSmart.repositories.ServiceTypeRepository;
import com.it.BookSmart.services.ServiceTypeManager;
import org.junit.jupiter.api.Test;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.MockitoAnnotations;

import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

class ServiceTypeManagerTest {

    @InjectMocks
    private ServiceTypeManager serviceTypeManager;

    @Mock
    private ServiceTypeRepository serviceTypeRepository;

    @Mock
    private ServiceTypeMapper serviceTypeMapper;

    ServiceTypeManagerTest() {
        MockitoAnnotations.openMocks(this);
    }

    @Test
    void testCreateServiceType() {
        ServiceTypeDto dto = new ServiceTypeDto();
        dto.setName("Oil Change");
        dto.setDescription("Quick oil change service.");

        ServiceType serviceType = new ServiceType();
        when(serviceTypeMapper.toEntity(dto)).thenReturn(serviceType);
        when(serviceTypeRepository.save(serviceType)).thenReturn(serviceType);
        when(serviceTypeMapper.toDto(serviceType)).thenReturn(dto);

        ServiceTypeDto result = serviceTypeManager.createServiceType(dto);

        assertNotNull(result);
        assertEquals("Oil Change", result.getName());
        verify(serviceTypeRepository, times(1)).save(serviceType);
    }

    @Test
    void testUpdateServiceType() {
        Long serviceTypeId = 1L;
        ServiceTypeDto dto = new ServiceTypeDto();
        dto.setName("Updated Service");
        dto.setDescription("Updated Description");

        ServiceType serviceType = new ServiceType();
        when(serviceTypeRepository.findById(serviceTypeId)).thenReturn(Optional.of(serviceType));

        ServiceTypeDto result = serviceTypeManager.updateServiceType(serviceTypeId, dto);

        assertEquals("Updated Service", serviceType.getName());
        assertEquals("Updated Description", serviceType.getDescription());
        verify(serviceTypeRepository, times(1)).save(serviceType);
    }

    @Test
    void testDeleteServiceType() {
        Long serviceTypeId = 1L;

        serviceTypeManager.deleteServiceType(serviceTypeId);

        verify(serviceTypeRepository, times(1)).deleteById(serviceTypeId);
    }

    @Test
    void testGetAllServiceTypes() {
        ServiceType serviceType = new ServiceType();
        serviceType.setName("Oil Change");

        when(serviceTypeRepository.findAll()).thenReturn(List.of(serviceType));
        when(serviceTypeMapper.toDto(serviceType))
                .thenReturn(ServiceTypeDto.builder()
                        .name("Oil Change")
                        .description("Description")
                        .build());

        List<ServiceTypeDto> result = serviceTypeManager.getAllServiceTypes();

        assertEquals(1, result.size());
        assertEquals("Oil Change", result.get(0).getName());
    }
}
