package com.it.BookSmart.services;

import com.it.BookSmart.dtos.BusinessDto;
import com.it.BookSmart.dtos.ImageDto;
import com.it.BookSmart.entities.Business;
import com.it.BookSmart.entities.Image;
import com.it.BookSmart.entities.User;
import com.it.BookSmart.exceptions.ResourceNotFoundException;
import com.it.BookSmart.mappers.BusinessMapper;
import com.it.BookSmart.mappers.ImageMapper;
import com.it.BookSmart.repositories.BusinessRepository;
import com.it.BookSmart.repositories.UserRepository;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;

@Service
@RequiredArgsConstructor
public class BusinessService {

    private final BusinessRepository businessRepository;
    private final UserRepository userRepository;
    private final BusinessMapper businessMapper;
    private final ImageMapper imageMapper;
    private final CloudinaryService cloudinaryService;

    @Transactional
    public BusinessDto createBusiness(BusinessDto businessDto, MultipartFile imageFile) {
        User owner = userRepository.findById(businessDto.getOwnerId())
                .orElseThrow(() -> new ResourceNotFoundException("User not found with id: " + businessDto.getOwnerId()));

        Business business = businessMapper.toEntity(businessDto);
        business.setOwner(owner);

        Business savedBusiness = businessRepository.save(business);

        if (imageFile != null && !imageFile.isEmpty()) {
            String imageUrl = cloudinaryService.uploadImage(imageFile, "business-logos");
            Image image = Image.builder()
                    .url(imageUrl)
                    .business(savedBusiness)
                    .build();

            savedBusiness.setImage(image);
            businessRepository.save(savedBusiness);
        }

        return businessMapper.toDto(savedBusiness);
    }

    @Transactional
    public BusinessDto updateBusiness(Long id, BusinessDto businessDto, MultipartFile newImageFile) {
        Business existingBusiness = businessRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Business not found with id: " + id));

        Business updatedBusiness = businessMapper.toEntity(businessDto);
        updatedBusiness.setId(existingBusiness.getId());
        updatedBusiness.setOwner(existingBusiness.getOwner());

        if (newImageFile != null && !newImageFile.isEmpty()) {
            if (existingBusiness.getImage() != null) {
                cloudinaryService.deleteImage(existingBusiness.getImage().getPublicId());
            }

            String newImageUrl = cloudinaryService.uploadImage(newImageFile, "business-logos");
            Image newImage = Image.builder()
                    .url(newImageUrl)
                    .build();
            updatedBusiness.setImage(newImage);
        } else {
            updatedBusiness.setImage(existingBusiness.getImage());
        }

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

    public Page<BusinessDto> searchBusinesses(String search, int page, int size) {
        Specification<Business> spec = Specification.where(null);

        if (search != null && !search.isEmpty()) {
            spec = spec.and((root, query, criteriaBuilder) ->
                    criteriaBuilder.or(
                            criteriaBuilder.like(root.get("name"), "%" + search + "%"),
                            criteriaBuilder.like(root.get("description"), "%" + search + "%"),
                            criteriaBuilder.like(root.get("city"), "%" + search + "%"),
                            criteriaBuilder.like(root.get("address"), "%" + search + "%")
                    )
            );
        }
        Pageable pageable = PageRequest.of(page, size);

        return businessRepository.findAll(spec, pageable)
                .map(businessMapper::toDto);
    }


    public BusinessDto getBusinessById(Long id) {
        return businessRepository.findById(id)
                .map(businessMapper::toDto)
                .orElseThrow(() -> new ResourceNotFoundException("Business not found with id: " + id));
    }

    public List<BusinessDto> getBusinessesByOwner(Long ownerId) {
        return businessRepository.findByOwnerId(ownerId)
                .stream()
                .map(businessMapper::toDto)
                .toList();
    }

}

