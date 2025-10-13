package com.it.BookSmart.services;

import com.it.BookSmart.dtos.UserDto;
import com.it.BookSmart.entities.Role;
import com.it.BookSmart.entities.User;
import com.it.BookSmart.exceptions.ResourceNotFoundException;
import com.it.BookSmart.mappers.UserMapper;
import com.it.BookSmart.repositories.AppointmentRepository;
import com.it.BookSmart.repositories.BusinessRepository;
import com.it.BookSmart.repositories.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

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

    public void deleteUser(Long userId) {
        if (!userRepository.existsById(userId)) {
            throw new ResourceNotFoundException("User not found with id: " + userId);
        }
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