//package com.it.BookSmart;
//
//import com.fasterxml.jackson.databind.ObjectMapper;
//import com.it.BookSmart.dtos.AppointmentDto;
//import com.it.BookSmart.entities.*;
//import com.it.BookSmart.repositories.AppointmentRepository;
//import com.it.BookSmart.repositories.EmployeeRepository;
//import com.it.BookSmart.repositories.ServiceTypeRepository;
//import com.it.BookSmart.repositories.UserRepository;
//import jakarta.transaction.Transactional;
//import org.junit.jupiter.api.MethodOrderer;
//import org.junit.jupiter.api.Test;
//import org.junit.jupiter.api.TestMethodOrder;
//import org.springframework.beans.factory.annotation.Autowired;
//import org.springframework.boot.test.autoconfigure.jdbc.AutoConfigureTestDatabase;
//import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
//import org.springframework.boot.test.context.SpringBootTest;
//import org.springframework.http.MediaType;
//import org.springframework.test.context.ActiveProfiles;
//import org.springframework.test.context.TestPropertySource;
//import org.springframework.test.context.jdbc.Sql;
//import org.springframework.test.web.servlet.MockMvc;
//
//import java.time.LocalDateTime;
//import java.util.List;
//
//import static org.junit.jupiter.api.Assertions.assertEquals;
//import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
//import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
//import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;
//
//@AutoConfigureMockMvc
//@ActiveProfiles("test")
//@TestMethodOrder(MethodOrderer.OrderAnnotation.class)
//@SpringBootTest(webEnvironment = SpringBootTest.WebEnvironment.RANDOM_PORT)
//public class AppointmentIntegrationTest {
//
//    @Autowired
//    private MockMvc mockMvc;
//
//    @Autowired
//    private ObjectMapper objectMapper;
//    @Autowired
//    private AppointmentRepository appointmentRepository;
//    @Autowired
//    private ServiceTypeRepository serviceTypeRepository;
//    @Autowired
//    private UserRepository userRepository;
//
//    @Autowired
//    private EmployeeRepository employeeRepository;
//
//
//    @Test
//    public void testCreateAppointment() throws Exception {
//        ServiceType serviceType = new ServiceType();
//        serviceType.setName("Oil Change");
//        serviceTypeRepository.save(serviceType);
//        User user = new User();
//        user.setFirstName("Test");
//        user.setLastName("User");
//        user.setRole(Role.ADMIN);
//        user.setPassword("password");
//        user.setUsername("admin");
//
//        userRepository.save(user);
//
//        Employee employee = new Employee();
//        employee.setName("Jane Smith");
//        employee.setPosition("Mechanic");
//        employee.setBusiness(savedBusiness);
//        employeeRepository.save(employee);
//        // Step 1: Create an AppointmentRequest DTO object
//        AppointmentDto appointmentRequest = new AppointmentDto();
//        appointmentRequest.setServiceId(1L);
//        appointmentRequest.setUserId(1L);
//        //appointmentRequest.setEmployeeId(1L);
//        appointmentRequest.setAppointmentTime(LocalDateTime.of(2023, 12, 1, 10, 0));
//
//        // Step 2: Perform POST request to create the appointment
//        mockMvc.perform(post("/api/appointments")
//                        .contentType(MediaType.APPLICATION_JSON)
//                        .content(objectMapper.writeValueAsString(appointmentRequest))) // Serialize DTO to JSON
//                .andExpect(status().isOk())
//                .andExpect(jsonPath("$.id").isNotEmpty())
//                .andExpect(jsonPath("$.serviceName").value("Oil Change"))
//                .andExpect(jsonPath("$.employeeName").value("Jane Smith"));
//
//        // Step 3: Verify data in the database
//        List<Appointment> appointments = appointmentRepository.findAll();
//        assertEquals(1, appointments.size());
//        Appointment savedAppointment = appointments.get(0);
//        assertEquals(1L, savedAppointment.getUser().getId());
//        assertEquals(1L, savedAppointment.getServiceType().getId());
//        assertEquals(1L, savedAppointment.getEmployee().getId());
//    }
//}
