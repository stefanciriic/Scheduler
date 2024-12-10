package com.it.BookSmart.services;

import com.it.BookSmart.dtos.BusinessDto;
import com.it.BookSmart.entities.Business;
import com.it.BookSmart.mappers.BusinessMapper;
import com.it.BookSmart.repositories.BusinessRepository;
import com.it.BookSmart.repositories.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class BusinessService {

    private final BusinessRepository businessRepository;
    private final UserRepository userRepository;
    private final BusinessMapper businessMapper;

    public BusinessDto createBusiness(BusinessDto businessDto) {
        Business business = businessMapper.toEntity(businessDto);

        // Validate owner exists
        if (businessDto.getOwnerId() != null) {
            userRepository.findById(businessDto.getOwnerId())
                    .orElseThrow(() -> new IllegalArgumentException("User not found with id: " + businessDto.getOwnerId()));
        }

        return businessMapper.toDto(businessRepository.save(business));
    }

    public BusinessDto updateBusiness(Long id, BusinessDto businessDto) {
        Business business = businessRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Business not found with id: " + id));

        business.setName(businessDto.getName());
        business.setAddress(businessDto.getAddress());
        business.setDescription(businessDto.getDescription());
        business.setWorkingHours(businessDto.getWorkingHours());

        if (businessDto.getOwnerId() != null) {
            business.setOwner(userRepository.findById(businessDto.getOwnerId())
                    .orElseThrow(() -> new IllegalArgumentException("User not found with id: " + businessDto.getOwnerId())));
        }

        return businessMapper.toDto(businessRepository.save(business));
    }

    public void deleteBusiness(Long id) {
        businessRepository.deleteById(id);
    }

    public List<BusinessDto> getAllBusinesses() {
        return businessRepository.findAll()
                .stream()
                .map(businessMapper::toDto)
                .toList();
    }

    public BusinessDto getBusinessById(Long id) {
        return businessRepository.findById(id)
                .map(businessMapper::toDto)
                .orElseThrow(() -> new IllegalArgumentException("Business not found with id: " + id));
    }
}

