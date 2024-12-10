//package com.it.BookSmart;
//
//import com.it.BookSmart.entities.Appointment;
//import com.it.BookSmart.repositories.AppointmentRepository;
//import jakarta.transaction.Transactional;
//import org.junit.jupiter.api.Test;
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
//import java.util.List;
//
//import static org.junit.jupiter.api.Assertions.assertEquals;
//import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
//import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
//import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;
//
//@SpringBootTest(classes = BookSmartApplication.class)
//@Transactional
//@AutoConfigureTestDatabase
//@AutoConfigureMockMvc
//@ActiveProfiles("test")
//@Sql(scripts = {"classpath:data.sql"})
//@TestPropertySource("classpath:application-test.properties")
//public class AppointmentIntegrationTest {
//
//    @Autowired
//    private MockMvc mockMvc;
//
//    @Autowired
//    private AppointmentRepository appointmentRepository;
//
//    @Test
//    public void testCreateAppointment() throws Exception {
//        // Step 1: Prepare Appointment JSON
//        String appointmentJson = """
//            {
//                "serviceId": 1,
//                "userId": 1,
//                "employeeId": 1,
//                "appointmentTime": "2023-12-01T10:00:00"
//            }
//        """;
//
//        // Step 2: Perform POST request to create the appointment
//        mockMvc.perform(post("/appointments")
//                        .contentType(MediaType.APPLICATION_JSON)
//                        .content(appointmentJson))
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
