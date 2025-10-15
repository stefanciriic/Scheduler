package com.it.BookSmart.services;

import com.it.BookSmart.dtos.BusinessDto;
import com.it.BookSmart.dtos.ImageDto;
import com.it.BookSmart.entities.Appointment;
import com.it.BookSmart.entities.Business;
import com.it.BookSmart.entities.Employee;
import com.it.BookSmart.entities.Image;
import com.it.BookSmart.entities.ServiceType;
import com.it.BookSmart.entities.User;
import com.it.BookSmart.exceptions.ResourceNotFoundException;
import com.it.BookSmart.mappers.BusinessMapper;
import com.it.BookSmart.mappers.ImageMapper;
import com.it.BookSmart.repositories.AppointmentRepository;
import com.it.BookSmart.repositories.BusinessRepository;
import com.it.BookSmart.repositories.EmployeeRepository;
import com.it.BookSmart.repositories.ServiceTypeRepository;
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
    private final EmployeeRepository employeeRepository;
    private final ServiceTypeRepository serviceTypeRepository;
    private final AppointmentRepository appointmentRepository;
    private final BusinessMapper businessMapper;
    private final ImageMapper imageMapper;
    private final CloudinaryService cloudinaryService;

    @Transactional
    public BusinessDto createBusiness(BusinessDto businessDto, MultipartFile imageFile) {
        User owner = userRepository.findById(businessDto.getOwnerId())
                .orElseThrow(() -> new ResourceNotFoundException("User not found with id: " + businessDto.getOwnerId()));

        Business business = businessMapper.toEntity(businessDto);
        business.setOwner(owner);
        
        // Initialize empty lists to avoid null pointer exceptions
        if (business.getEmployees() == null) {
            business.setEmployees(new java.util.ArrayList<>());
        }
        if (business.getServiceTypes() == null) {
            business.setServiceTypes(new java.util.ArrayList<>());
        }

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
        
        // Initialize empty lists to avoid null pointer exceptions
        if (updatedBusiness.getEmployees() == null) {
            updatedBusiness.setEmployees(existingBusiness.getEmployees() != null ? 
                existingBusiness.getEmployees() : new java.util.ArrayList<>());
        }
        if (updatedBusiness.getServiceTypes() == null) {
            updatedBusiness.setServiceTypes(existingBusiness.getServiceTypes() != null ? 
                existingBusiness.getServiceTypes() : new java.util.ArrayList<>());
        }

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
        // Check if business exists
        Business business = businessRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Business not found with id: " + id));
        
        // Step 1: Get all employees of this business
        List<Employee> employees = employeeRepository.findAllByBusinessId(id);
        
        // Step 2: Delete all appointments for employees of this business
        // This must be done first because appointments reference employees
        for (Employee employee : employees) {
            List<Appointment> employeeAppointments = appointmentRepository.findByEmployee_Id(employee.getId());
            if (!employeeAppointments.isEmpty()) {
                appointmentRepository.deleteAll(employeeAppointments);
            }
        }
        
        // Step 3: Get all services of this business and delete their appointments
        List<ServiceType> services = serviceTypeRepository.findByBusinessId(id);
        for (ServiceType service : services) {
            List<Appointment> serviceAppointments = appointmentRepository.findByServiceType_Id(service.getId());
            if (!serviceAppointments.isEmpty()) {
                appointmentRepository.deleteAll(serviceAppointments);
            }
        }
        
        // Step 4: Delete business image from Cloudinary if exists
        if (business.getImage() != null && business.getImage().getPublicId() != null) {
            try {
                cloudinaryService.deleteImage(business.getImage().getPublicId());
            } catch (Exception e) {
                // Log error but don't stop deletion
                System.err.println("Failed to delete business image from Cloudinary: " + e.getMessage());
            }
        }
        
        // Step 5: Delete the business
        // This will cascade delete:
        // - Employees (via cascade = CascadeType.ALL)
        // - ServiceTypes (via cascade = CascadeType.ALL)
        // - Image (via cascade = CascadeType.ALL)
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

    public List<BusinessDto> getBusinessesByOwnerId(Long ownerId) {
        return businessRepository.findByOwnerId(ownerId)
                .stream()
                .map(businessMapper::toDto)
                .toList();
    }

}

