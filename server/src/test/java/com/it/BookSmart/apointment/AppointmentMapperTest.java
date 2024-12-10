package com.it.BookSmart.apointment;

import com.it.BookSmart.dtos.AppointmentDto;
import com.it.BookSmart.entities.Appointment;
import com.it.BookSmart.entities.Employee;
import com.it.BookSmart.entities.ServiceType;
import com.it.BookSmart.entities.User;
import com.it.BookSmart.mappers.AppointmentMapper;
import org.junit.jupiter.api.Test;
import org.mapstruct.factory.Mappers;

import java.time.LocalDateTime;

import static org.junit.jupiter.api.Assertions.*;

class AppointmentMapperTest {

    private final AppointmentMapper mapper = Mappers.getMapper(AppointmentMapper.class);

    @Test
    void testToEntity() {
        // Prepare DTO
        AppointmentDto appointmentDto = new AppointmentDto();
        appointmentDto.setId(1L);
        appointmentDto.setUserId(2L);
        appointmentDto.setServiceId(3L);
        appointmentDto.setEmployeeId(4L);
        appointmentDto.setAppointmentTime(LocalDateTime.now());

        // Map to entity
        Appointment appointment = mapper.toEntity(appointmentDto);

        // Assertions
        assertNotNull(appointment);
        assertEquals(appointmentDto.getId(), appointment.getId());
        assertEquals(appointmentDto.getUserId(), appointment.getUser().getId());
        assertEquals(appointmentDto.getServiceId(), appointment.getServiceType().getId());
        assertEquals(appointmentDto.getEmployeeId(), appointment.getEmployee().getId());
        assertEquals(appointmentDto.getAppointmentTime(), appointment.getAppointmentTime());
    }

    @Test
    void testToDto() {
        // Prepare Entity
        Appointment appointment = new Appointment();
        appointment.setId(1L);
        appointment.setUser(new User(2L));
        appointment.setServiceType(new ServiceType(3L));
        appointment.setEmployee(new Employee(4L));
        appointment.setAppointmentTime(LocalDateTime.now());

        // Map to DTO
        AppointmentDto appointmentDto = mapper.toDto(appointment);

        // Assertions
        assertNotNull(appointmentDto);
        assertEquals(appointment.getId(), appointmentDto.getId());
        assertEquals(appointment.getUser().getId(), appointmentDto.getUserId());
        assertEquals(appointment.getServiceType().getId(), appointmentDto.getServiceId());
        assertEquals(appointment.getEmployee().getId(), appointmentDto.getEmployeeId());
        assertEquals(appointment.getAppointmentTime(), appointmentDto.getAppointmentTime());
    }

    @Test
    void testToEntityWithNullDto() {
        // Test null mapping
        Appointment appointment = mapper.toEntity(null);

        assertNull(appointment);
    }

    @Test
    void testToDtoWithNullEntity() {
        // Test null mapping
        AppointmentDto appointmentDto = mapper.toDto(null);

        assertNull(appointmentDto);
    }
}
