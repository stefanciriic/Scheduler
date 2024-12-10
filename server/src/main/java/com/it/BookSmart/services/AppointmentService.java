package com.it.BookSmart.services;

import com.it.BookSmart.dtos.AppointmentDto;
import com.it.BookSmart.entities.Appointment;
import com.it.BookSmart.entities.Employee;
import com.it.BookSmart.entities.ServiceType;
import com.it.BookSmart.entities.User;
import com.it.BookSmart.exceptions.ResourceNotFoundException;
import com.it.BookSmart.exceptions.ValidationException;
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

    @Transactional
    public AppointmentDto createAppointment(AppointmentDto appointmentDto) {
        validateAppointmentDto(appointmentDto);

        Appointment appointment = appointmentMapper.toEntity(appointmentDto);

        if (appointment == null) {
            throw new ValidationException("Failed to map appointment DTO to entity.");
        }

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

    public void deleteAppointment(Long id) {
        if (!appointmentRepository.existsById(id)) {
            throw new ResourceNotFoundException("Appointment not found with id: " + id);
        }
        appointmentRepository.deleteById(id);
    }

    // Helper method to validate input DTO
    private void validateAppointmentDto(AppointmentDto appointmentDto) {
        if (appointmentDto.getUserId() == null || appointmentDto.getServiceId() == null || appointmentDto.getEmployeeId() == null) {
            throw new ValidationException("User, Service, and Employee IDs must be provided.");
        }
    }
}
