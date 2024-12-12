package com.it.BookSmart.services;

import com.it.BookSmart.dtos.BusinessDto;
import com.it.BookSmart.entities.Business;
import com.it.BookSmart.entities.User;
import com.it.BookSmart.exceptions.ResourceNotFoundException;
import com.it.BookSmart.exceptions.ValidationException;
import com.it.BookSmart.mappers.BusinessMapper;
import com.it.BookSmart.repositories.BusinessRepository;
import com.it.BookSmart.repositories.UserRepository;
import jakarta.transaction.Transactional;
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
        User owner = userRepository.findById(businessDto.getOwnerId())
                .orElseThrow(() -> new ResourceNotFoundException("User not found with id: " + businessDto.getOwnerId()));

        Business business = businessMapper.toEntity(businessDto);

        business.setOwner(owner);
        Business savedBusiness = businessRepository.save(business);

        return businessMapper.toDto(savedBusiness);
    }

    @Transactional
    public BusinessDto updateBusiness(Long id, BusinessDto businessDto) {
        Business existingBusiness = businessRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Business not found with id: " + id));

        Business updatedBusiness = businessMapper.toEntity(businessDto);
        updatedBusiness.setId(existingBusiness.getId());
        updatedBusiness.setOwner(existingBusiness.getOwner());

        return businessMapper.toDto(businessRepository.save(updatedBusiness));
    }

    @Transactional
    public void deleteBusiness(Long id) {
        if (!businessRepository.existsById(id)) {
            throw new ResourceNotFoundException("Business not found with id: " + id);
        }
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
                .orElseThrow(() -> new ResourceNotFoundException("Business not found with id: " + id));
    }
}

