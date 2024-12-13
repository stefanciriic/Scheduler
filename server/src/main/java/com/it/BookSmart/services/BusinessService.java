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

    public BusinessDto createBusiness(BusinessDto businessDto, MultipartFile imageFile) {
        User owner = userRepository.findById(businessDto.getOwnerId())
                .orElseThrow(() -> new ResourceNotFoundException("User not found with id: " + businessDto.getOwnerId()));

        // Kreiraj biznis iz DTO-a
        Business business = businessMapper.toEntity(businessDto);
        business.setOwner(owner);

        // Prvo sačuvaj biznis u bazi
        Business savedBusiness = businessRepository.save(business);

        // Upload slike na Cloudinary ako postoji fajl
        if (imageFile != null && !imageFile.isEmpty()) {
            String imageUrl = cloudinaryService.uploadImage(imageFile, "business-logos");
            Image image = Image.builder()
                    .url(imageUrl)
                    .business(savedBusiness) // Poveži sliku sa kreiranim biznisom
                    .build();

            savedBusiness.setImage(image);
            businessRepository.save(savedBusiness); // Sačuvaj ažurirani biznis
        }

        return businessMapper.toDto(savedBusiness);
    }

    @Transactional
    public BusinessDto updateBusiness(Long id, BusinessDto businessDto, MultipartFile newImageFile) {
        Business existingBusiness = businessRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Business not found with id: " + id));

        // Ažuriraj podatke o biznisu
        Business updatedBusiness = businessMapper.toEntity(businessDto);
        updatedBusiness.setId(existingBusiness.getId());
        updatedBusiness.setOwner(existingBusiness.getOwner());

        // Ažuriraj sliku ako je nova slika prosleđena
        if (newImageFile != null && !newImageFile.isEmpty()) {
            if (existingBusiness.getImage() != null) {
                // Obriši staru sliku sa Cloudinary-ja
                cloudinaryService.deleteImage(existingBusiness.getImage().getPublicId());
            }

            // Upload nove slike
            String newImageUrl = cloudinaryService.uploadImage(newImageFile, "business-logos");
            Image newImage = Image.builder()
                    .url(newImageUrl)
                    .build();
            updatedBusiness.setImage(newImage); // Postavljamo novu sliku
        } else {
            // Zadrži postojeću sliku ako nova nije prosleđena
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

    public BusinessDto getBusinessById(Long id) {
        return businessRepository.findById(id)
                .map(businessMapper::toDto)
                .orElseThrow(() -> new ResourceNotFoundException("Business not found with id: " + id));
    }


}

