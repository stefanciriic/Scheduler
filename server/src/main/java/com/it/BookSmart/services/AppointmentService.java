package com.it.BookSmart.services;

import com.it.BookSmart.dtos.AppointmentDto;
import com.it.BookSmart.entities.Appointment;
import com.it.BookSmart.entities.Employee;
import com.it.BookSmart.entities.ServiceType;
import com.it.BookSmart.entities.User;
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
                .orElseThrow(() -> new IllegalArgumentException("Appointment not found with id: " + id));
    }
    @Transactional
    public AppointmentDto createAppointment(AppointmentDto appointmentDto) {
        // Map DTO to entity
        if (appointmentDto.getUserId() == null || appointmentDto.getServiceId() == null || appointmentDto.getEmployeeId() == null) {
            throw new IllegalArgumentException("User, Service, and Employee IDs must be provided");
        }
        Appointment appointment = appointmentMapper.toEntity(appointmentDto);

        // Proveri da li je mapper vratio validnu instancu
        if (appointment == null) {
            throw new IllegalStateException("Appointment mapping failed. Appointment is null.");
        }

        // Postavi vreme zakazivanja ako nije prisutno
        if (appointment.getAppointmentTime() == null) {
            appointment.setAppointmentTime(LocalDateTime.now());
        }

        // Snimi entitet
        Appointment savedAppointment = appointmentRepository.save(appointment);

        // Mapiraj nazad u DTO i vrati rezultat
        return appointmentMapper.toDto(savedAppointment);
    }

    public AppointmentDto updateAppointment(Long id, AppointmentDto appointmentDto) {
        // Proveri da li postoji appointment sa zadatim ID-jem
        Appointment appointment = appointmentRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Appointment not found with id: " + id));

        // Postavi vreme zakazivanja ako postoji u DTO
        if (appointmentDto.getAppointmentTime() != null) {
            appointment.setAppointmentTime(appointmentDto.getAppointmentTime());
        }

        // Fetch and set ServiceType entity
        Long serviceId = appointmentDto.getServiceId();
        if (serviceId != null) {
            ServiceType serviceType = serviceTypeRepository.findById(serviceId)
                    .orElseThrow(() -> new IllegalArgumentException("Service not found with id: " + serviceId));
            appointment.setServiceType(serviceType);
        }

        // Fetch and set User entity
        Long userId = appointmentDto.getUserId();
        if (userId != null) {
            User user = userRepository.findById(userId)
                    .orElseThrow(() -> new IllegalArgumentException("User not found with id: " + userId));
            appointment.setUser(user);
        }

        // Fetch and set Employee entity
        Long employeeId = appointmentDto.getEmployeeId();
        if (employeeId != null) {
            Employee employee = employeeRepository.findById(employeeId)
                    .orElseThrow(() -> new IllegalArgumentException("Employee not found with id: " + employeeId));
            appointment.setEmployee(employee);
        }

        // Snimi promene i vrati DTO
        return appointmentMapper.toDto(appointmentRepository.save(appointment));
    }



    public void deleteAppointment(Long id) {
        if (!appointmentRepository.existsById(id)) {
            throw new IllegalArgumentException("Appointment not found with id: " + id);
        }
        appointmentRepository.deleteById(id);
    }
}
