package com.it.BookSmart.services;

import com.it.BookSmart.dtos.UserDto;
import com.it.BookSmart.entities.Role;
import com.it.BookSmart.entities.User;
import com.it.BookSmart.exceptions.ConflictException;
import com.it.BookSmart.exceptions.ResourceNotFoundException;
import com.it.BookSmart.mappers.UserMapper;
import com.it.BookSmart.repositories.AppointmentRepository;
import com.it.BookSmart.repositories.BusinessRepository;
import com.it.BookSmart.repositories.EmployeeRepository;
import com.it.BookSmart.repositories.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class AdminService {

    private final UserRepository userRepository;
    private final BusinessRepository businessRepository;
    private final AppointmentRepository appointmentRepository;
    private final EmployeeRepository employeeRepository;
    private final CloudinaryService cloudinaryService;
    private final UserMapper userMapper;

    public List<UserDto> getAllUsers() {
        return userRepository.findAll()
                .stream()
                .map(userMapper::toUserDto)
                .collect(Collectors.toList());
    }

    public UserDto updateUserRole(Long userId, String roleString) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found with id: " + userId));

        try {
            Role role = Role.valueOf(roleString.toUpperCase());
            user.setRole(role);
            User savedUser = userRepository.save(user);
            return userMapper.toUserDto(savedUser);
        } catch (IllegalArgumentException e) {
            throw new IllegalArgumentException("Invalid role: " + roleString);
        }
    }

    @Transactional
    public void deleteUser(Long userId) {
        // Check if user exists
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found with id: " + userId));

        // Check if user is a business owner
        List<com.it.BookSmart.entities.Business> ownedBusinesses = businessRepository.findByOwnerId(userId);
        if (!ownedBusinesses.isEmpty()) {
            throw new ConflictException(
                    "Cannot delete user who owns " + ownedBusinesses.size() +
                            " business(es). Please transfer or delete the businesses first."
            );
        }

        // Check if user has any appointments
        long appointmentCount = appointmentRepository.countByUserId(userId);
        if (appointmentCount > 0) {
            throw new ConflictException(
                "Cannot delete user with existing appointments. User has " + appointmentCount + 
                " appointment(s). Please cancel all appointments before deleting the user."
            );
        }
        

        
        // Check if user is linked to an employee record
        if (employeeRepository.existsByUserId(userId)) {
            throw new ConflictException(
                "Cannot delete user who is linked to an employee record. " +
                "Please delete the employee record first or unlink the user from the employee."
            );
        }
        
        // Delete profile image from Cloudinary if exists
        if (user.getProfileImage() != null && user.getProfileImage().getPublicId() != null) {
            try {
                cloudinaryService.deleteImage(user.getProfileImage().getPublicId());
            } catch (Exception e) {
                // Log the error but don't stop the deletion process
                // The user record should still be deleted even if image deletion fails
                System.err.println("Failed to delete user profile image from Cloudinary: " + e.getMessage());
            }
        }
        
        // Finally, delete the user
        userRepository.deleteById(userId);
    }

    public Map<String, Object> getSystemStats() {
        Map<String, Object> stats = new HashMap<>();
        stats.put("totalUsers", userRepository.count());
        stats.put("totalBusinesses", businessRepository.count());
        stats.put("totalAppointments", appointmentRepository.count());
        return stats;
    }
}