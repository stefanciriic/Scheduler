package com.it.BookSmart.apointment;

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
import com.it.BookSmart.services.AppointmentService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class AppointmentServiceTest {

    @InjectMocks
    private AppointmentService appointmentService;

    @Mock
    private AppointmentRepository appointmentRepository;

    @Mock
    private AppointmentMapper appointmentMapper;

    @Mock
    private ServiceTypeRepository serviceTypeRepository;

    @Mock
    private UserRepository userRepository;

    @Mock
    private EmployeeRepository employeeRepository;

    private Appointment appointment;
    private AppointmentDto appointmentDto;
    private User user;
    private ServiceType serviceType;
    private Employee employee;

    @BeforeEach
    void setUp() {
        // Initialize entities
        user = new User(1L, "John", "Doe", "john.doe", "password", null);
        employee = new Employee(1L, "Jane Smith", "Mechanic", null);

        serviceType = new ServiceType(1L, "Oil Change", "Car oil change service", 212.43, null, employee);

        appointment = new Appointment();
        appointment.setId(1L);
        appointment.setUser(user);
        appointment.setServiceType(serviceType);
        appointment.setEmployee(employee);
        appointment.setAppointmentTime(LocalDateTime.now());

        appointmentDto = new AppointmentDto();
        appointmentDto.setId(1L);
        appointmentDto.setUserId(1L);
        appointmentDto.setServiceId(1L);
        appointmentDto.setEmployeeId(1L);
        appointmentDto.setAppointmentTime(LocalDateTime.now());
    }

    @Test
    void testGetAllAppointments() {
        when(appointmentRepository.findAll()).thenReturn(List.of(appointment));
        when(appointmentMapper.toDto(appointment)).thenReturn(appointmentDto);

        List<AppointmentDto> result = appointmentService.getAllAppointments();

        assertNotNull(result);
        assertEquals(1, result.size());
        assertEquals(appointmentDto.getId(), result.get(0).getId());
        verify(appointmentRepository, times(1)).findAll();
    }

    @Test
    void testGetAppointmentById() {
        when(appointmentRepository.findById(1L)).thenReturn(Optional.of(appointment));
        when(appointmentMapper.toDto(appointment)).thenReturn(appointmentDto);

        AppointmentDto result = appointmentService.getAppointmentById(1L);

        assertNotNull(result);
        assertEquals(appointmentDto.getId(), result.getId());
        verify(appointmentRepository, times(1)).findById(1L);
    }

    @Test
    void testCreateAppointment() {
        when(appointmentMapper.toEntity(appointmentDto)).thenReturn(appointment);
        when(appointmentRepository.save(appointment)).thenReturn(appointment);
        when(appointmentMapper.toDto(appointment)).thenReturn(appointmentDto);

        AppointmentDto result = appointmentService.createAppointment(appointmentDto);

        assertNotNull(result);
        assertEquals(appointmentDto.getId(), result.getId());
        verify(appointmentRepository, times(1)).save(appointment);
    }

    @Test
    void testUpdateAppointment() {
        when(appointmentRepository.findById(1L)).thenReturn(Optional.of(appointment));
        when(serviceTypeRepository.findById(1L)).thenReturn(Optional.of(serviceType));
        when(userRepository.findById(1L)).thenReturn(Optional.of(user));
        when(employeeRepository.findById(1L)).thenReturn(Optional.of(employee));
        when(appointmentRepository.save(appointment)).thenReturn(appointment);
        when(appointmentMapper.toDto(appointment)).thenReturn(appointmentDto);

        AppointmentDto result = appointmentService.updateAppointment(1L, appointmentDto);

        assertNotNull(result);
        assertEquals(appointmentDto.getId(), result.getId());
        verify(appointmentRepository, times(1)).save(appointment);
    }

    @Test
    void testDeleteAppointment() {
        when(appointmentRepository.existsById(1L)).thenReturn(true);

        appointmentService.deleteAppointment(1L);

        verify(appointmentRepository, times(1)).deleteById(1L);
    }

    @Test
    void testCreateAppointmentThrowsExceptionWhenIdsMissing() {
        appointmentDto.setUserId(null);

        Exception exception = assertThrows(IllegalArgumentException.class, () -> {
            appointmentService.createAppointment(appointmentDto);
        });

        assertEquals("User, Service, and Employee IDs must be provided", exception.getMessage());
        verifyNoInteractions(appointmentRepository);
    }
}
