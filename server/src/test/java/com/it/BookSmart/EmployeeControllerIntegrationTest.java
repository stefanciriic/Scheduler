package com.it.BookSmart;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.it.BookSmart.entities.Business;
import com.it.BookSmart.entities.Employee;
import com.it.BookSmart.repositories.BusinessRepository;
import com.it.BookSmart.repositories.EmployeeRepository;
import com.it.BookSmart.dtos.EmployeeDto;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.web.servlet.MockMvc;

import java.util.List;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@SpringBootTest(webEnvironment = SpringBootTest.WebEnvironment.RANDOM_PORT)
@AutoConfigureMockMvc
@ActiveProfiles("test")
public class EmployeeControllerIntegrationTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @Autowired
    private BusinessRepository businessRepository;

    @Autowired
    private EmployeeRepository employeeRepository;

    @Test
    public void testCreateEmployee() throws Exception {
        // Step 1: Create a business to associate with the employee
        Business business = businessRepository.save(
                new Business(null, "Test Business", "123 Test Street", "A test business", "9 AM - 5 PM")
        );

        // Step 2: Create EmployeeDto
        EmployeeDto employeeDto = EmployeeDto.builder()
                .name("John Doe")
                .position("Manager")
                .businessId(business.getId())
                .build();

        // Step 3: Perform POST request to create employee
        mockMvc.perform(post("/api/employees")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(employeeDto)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.id").isNumber())
                .andExpect(jsonPath("$.name").value("John Doe"))
                .andExpect(jsonPath("$.position").value("Manager"))
                .andExpect(jsonPath("$.businessId").value(business.getId()));

        // Step 4: Verify data in the database
        List<Employee> employees = employeeRepository.findAll();
        assertEquals(1, employees.size());
        Employee savedEmployee = employees.get(0);
        assertEquals("John Doe", savedEmployee.getName());
        assertEquals("Manager", savedEmployee.getPosition());
        assertEquals(business.getId(), savedEmployee.getBusiness().getId());
    }
}

