package com.it.BookSmart;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.it.BookSmart.dtos.AppointmentDto;
import com.it.BookSmart.entities.*;
import com.it.BookSmart.repositories.*;
import jakarta.transaction.Transactional;
import org.junit.jupiter.api.MethodOrderer;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.TestMethodOrder;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.jdbc.AutoConfigureTestDatabase;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.context.TestPropertySource;
import org.springframework.test.context.jdbc.Sql;
import org.springframework.test.web.servlet.MockMvc;

import java.time.LocalDateTime;
import java.util.List;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@AutoConfigureMockMvc
@ActiveProfiles("test")
@TestMethodOrder(MethodOrderer.OrderAnnotation.class)
@SpringBootTest(webEnvironment = SpringBootTest.WebEnvironment.RANDOM_PORT)
public class AppointmentIntegrationTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;
    @Autowired
    private AppointmentRepository appointmentRepository;
    @Autowired
    private ServiceTypeRepository serviceTypeRepository;
    @Autowired
    private UserRepository userRepository;

    @Autowired
    private EmployeeRepository employeeRepository;

    @Autowired
    private BusinessRepository businessRepository;


    @Test
    public void testCreateAppointment() throws Exception {
        // Kreiraj User kao vlasnika
        User owner = new User();
        owner.setFirstName("Owner");
        owner.setLastName("Test");
        owner.setRole(Role.ADMIN);
        owner.setPassword("ownerpassword");
        owner.setUsername("owneruser");
        User savedOwner = userRepository.save(owner);

        // Kreiraj Business sa vlasnikom
        Business business = new Business();
        business.setName("Test Business");
        business.setAddress("123 Main Street");
        business.setDescription("Automotive Services");
        business.setWorkingHours("9 AM - 5 PM");
        business.setOwner(savedOwner);
        Business savedBusiness = businessRepository.save(business);

        // Kreiraj ServiceType
        ServiceType serviceType = new ServiceType();
        serviceType.setName("Oil Change");
        serviceType.setBusiness(savedBusiness);
        serviceTypeRepository.save(serviceType);


        Employee employee = new Employee();
        employee.setName("Jane Smith");
        employee.setPosition("Mechanic");
        employee.setBusiness(savedBusiness);
        employeeRepository.save(employee);


        User user = new User();
        user.setFirstName("Test");
        user.setLastName("User");
        user.setRole(Role.ADMIN);
        user.setPassword("password");
        user.setUsername("clientuser");
        User savedUser = userRepository.save(user);


        AppointmentDto appointmentRequest = new AppointmentDto();
        appointmentRequest.setServiceId(serviceType.getId());
        appointmentRequest.setUserId(savedUser.getId());
        appointmentRequest.setEmployeeId(employee.getId());
        appointmentRequest.setServiceName(serviceType.getName());
        appointmentRequest.setAppointmentTime(LocalDateTime.now().plusDays(1));


        mockMvc.perform(post("/api/appointments")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(appointmentRequest)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.id").isNotEmpty());


        List<Appointment> appointments = appointmentRepository.findAll();
        assertEquals(1, appointments.size());
        Appointment savedAppointment = appointments.get(0);
        assertEquals(savedUser.getId(), savedAppointment.getUser().getId());
        assertEquals(serviceType.getId(), savedAppointment.getServiceType().getId());
        assertEquals(employee.getId(), savedAppointment.getEmployee().getId());
    }
}
