package com.it.BookSmart.services;

import com.it.BookSmart.dtos.AppointmentDto;
import com.it.BookSmart.entities.*;
import com.it.BookSmart.exceptions.ResourceNotFoundException;
import com.it.BookSmart.mappers.AppointmentMapper;
import com.it.BookSmart.repositories.AppointmentRepository;
import com.it.BookSmart.repositories.EmployeeRepository;
import com.it.BookSmart.repositories.ServiceTypeRepository;
import com.it.BookSmart.repositories.UserRepository;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class AppointmentService {

    private final AppointmentRepository appointmentRepository;
    private final AppointmentMapper appointmentMapper;
    private final ServiceTypeRepository serviceTypeRepository;
    private final UserRepository userRepository;
    private final EmployeeRepository employeeRepository;

    public List<AppointmentDto> getAllAppointments() {
        return appointmentRepository.findAll()
                .stream()
                .map(appointmentMapper::toDto)
                .collect(Collectors.toList());
    }

    public AppointmentDto getAppointmentById(Long id) {
        return appointmentRepository.findById(id)
                .map(appointmentMapper::toDto)
                .orElseThrow(() -> new ResourceNotFoundException("Appointment not found with id: " + id));
    }

    public List<AppointmentDto> getAppointmentsByUserId(Long userId) {
        if (!userRepository.existsById(userId)) {
            throw new ResourceNotFoundException("User not found with id: " + userId);
        }
        
        // Users see only NON-CANCELED appointments
        return appointmentRepository.findByUserIdOrderByAppointmentTimeDesc(userId)
                .stream()
                .filter(appointment -> appointment.getStatus() != AppointmentStatus.CANCELED)
                .map(appointmentMapper::toDto)
                .collect(Collectors.toList());
    }

    public List<AppointmentDto> getAppointmentsByBusinessId(Long businessId) {
        // Get all appointments where the service belongs to the specified business
        return appointmentRepository.findAll()
                .stream()
                .filter(appointment -> appointment.getServiceType() != null 
                        && appointment.getServiceType().getBusiness() != null
                        && appointment.getServiceType().getBusiness().getId().equals(businessId))
                .map(appointmentMapper::toDto)
                .collect(Collectors.toList());
    }

    @Transactional
    public AppointmentDto createAppointment(AppointmentDto appointmentDto) {
        Appointment appointment = appointmentMapper.toEntity(appointmentDto);

        if (appointment.getAppointmentTime() == null) {
            appointment.setAppointmentTime(LocalDateTime.now());
        }

        Long serviceId = appointmentDto.getServiceId();
        ServiceType serviceType = serviceTypeRepository.findById(serviceId)
                .orElseThrow(() -> new ResourceNotFoundException("Service not found with id: " + serviceId));
        appointment.setServiceType(serviceType);

        Long userId = appointmentDto.getUserId();
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found with id: " + userId));
        appointment.setUser(user);

        Long employeeId = appointmentDto.getEmployeeId();
        Employee employee = employeeRepository.findById(employeeId)
                .orElseThrow(() -> new ResourceNotFoundException("Employee not found with id: " + employeeId));
        appointment.setEmployee(employee);

        Appointment savedAppointment = appointmentRepository.save(appointment);

        return appointmentMapper.toDto(savedAppointment);
    }

    @Transactional
    public AppointmentDto updateAppointment(Long id, AppointmentDto appointmentDto) {
        Appointment appointment = appointmentRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Appointment not found with id: " + id));

        if (appointmentDto.getAppointmentTime() != null) {
            appointment.setAppointmentTime(appointmentDto.getAppointmentTime());
        }

        Long serviceId = appointmentDto.getServiceId();
        if (serviceId != null) {
            ServiceType serviceType = serviceTypeRepository.findById(serviceId)
                    .orElseThrow(() -> new ResourceNotFoundException("Service not found with id: " + serviceId));
            appointment.setServiceType(serviceType);
        }

        Long userId = appointmentDto.getUserId();
        if (userId != null) {
            User user = userRepository.findById(userId)
                    .orElseThrow(() -> new ResourceNotFoundException("User not found with id: " + userId));
            appointment.setUser(user);
        }

        Long employeeId = appointmentDto.getEmployeeId();
        if (employeeId != null) {
            Employee employee = employeeRepository.findById(employeeId)
                    .orElseThrow(() -> new ResourceNotFoundException("Employee not found with id: " + employeeId));
            appointment.setEmployee(employee);
        }

        return appointmentMapper.toDto(appointmentRepository.save(appointment));
    }

    @Transactional
    public void deleteAppointment(Long id) {
        Appointment appointment = appointmentRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Appointment not found with id: " + id));
        
        // Soft delete: mark as CANCELED instead of deleting
        appointment.setStatus(AppointmentStatus.CANCELED);
        appointment.setCanceledAt(LocalDateTime.now());
        appointmentRepository.save(appointment);
    }

    @Transactional
    public void permanentlyDeleteAppointment(Long id) {
        Appointment appointment = appointmentRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Appointment not found with id: " + id));
        
        // Hard delete: permanently remove from database
        appointmentRepository.delete(appointment);
    }
}
