package com.it.BookSmart.employee;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.it.BookSmart.entities.Business;
import com.it.BookSmart.entities.Employee;
import com.it.BookSmart.repositories.BusinessRepository;
import com.it.BookSmart.repositories.EmployeeRepository;
import com.it.BookSmart.dtos.EmployeeDto;
import org.aspectj.lang.annotation.Before;
import org.junit.jupiter.api.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.web.servlet.MockMvc;

import java.util.List;

import static org.hamcrest.Matchers.hasSize;
import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.put;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.delete;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultHandlers.print;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@AutoConfigureMockMvc
@ActiveProfiles("test")
@TestMethodOrder(MethodOrderer.OrderAnnotation.class)
@SpringBootTest(webEnvironment = SpringBootTest.WebEnvironment.RANDOM_PORT)
public class EmployeeControllerIntegrationTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @Autowired
    private BusinessRepository businessRepository;

    @Autowired
    private EmployeeRepository employeeRepository;

    private static Business business;

    private static EmployeeDto employeeDto;

    private static long createdId;

    @BeforeAll
    public static void setup(@Autowired BusinessRepository businessRepository) {
        business = businessRepository.save(
                new Business(null, "Test Business", "123 Test Street", "A test business", "9 AM - 5 PM")
        );

        employeeDto = EmployeeDto.builder()
                .name("John Doe")
                .position("Manager")
                .businessId(business.getId())
                .build();
    }

    @Test
    @Order(1)
    public void testCreateEmployee() throws Exception {
        String response = mockMvc.perform(post("/api/employees")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(employeeDto)))
                .andDo(print())
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.id").isNumber())
                .andExpect(jsonPath("$.name").value(employeeDto.getName()))
                .andExpect(jsonPath("$.position").value(employeeDto.getPosition()))
                .andExpect(jsonPath("$.businessId").value(business.getId()))
                .andReturn().getResponse().getContentAsString();


        // Verifikacija u bazi
        List<Employee> employees = employeeRepository.findAll();
        assertEquals(1, employees.size());
        Employee savedEmployee = employees.get(0);

        createdId =savedEmployee.getId();

        assertEquals(employeeDto.getName(), savedEmployee.getName());
        assertEquals(employeeDto.getPosition(), savedEmployee.getPosition());
        assertEquals(employeeDto.getBusinessId(), savedEmployee.getBusiness().getId());
    }

    @Test
    @Order(2)
    public void testUpdateEmployee() throws Exception {
        EmployeeDto updatedEmployeeDto = EmployeeDto.builder()
                .id(createdId)
                .name("John Doe Updated")
                .position("Senior Manager")
                .businessId(business.getId())
                .build();

        mockMvc.perform(put("/api/employees/" + createdId)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(updatedEmployeeDto)))
                .andDo(print())
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.name").value(updatedEmployeeDto.getName()))
                .andExpect(jsonPath("$.position").value(updatedEmployeeDto.getPosition()));

        Employee updatedEmployee = employeeRepository.findById(createdId).orElseThrow();
        assertEquals("John Doe Updated", updatedEmployee.getName());
        assertEquals("Senior Manager", updatedEmployee.getPosition());
    }

    @Test
    @Order(3)
    public void testGetAllEmployees() throws Exception {
        mockMvc.perform(get("/api/employees")
                        .contentType(MediaType.APPLICATION_JSON))
                .andDo(print())
                .andExpect(status().isOk())
                .andExpect(jsonPath("$", hasSize(1)))
                .andExpect(jsonPath("$[0].name").value("John Doe Updated"));
    }

    @Test
    @Order(4)
    public void testDeleteEmployee() throws Exception {
        mockMvc.perform(delete("/api/employees/" + createdId)
                        .contentType(MediaType.APPLICATION_JSON))
                .andDo(print())
                .andExpect(status().isNoContent());

        assertFalse(employeeRepository.findById(createdId).isPresent());
    }

    @Test
    @Order(5)
    public void testUpdateEmployeeWithInvalidData() throws Exception {
        EmployeeDto invalidEmployeeDto = EmployeeDto.builder()
                .name(null)
                .position("")
                .businessId(null)
                .build();

        mockMvc.perform(put("/api/employees/1")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(invalidEmployeeDto)))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.errors.name").value("Name cannot be blank"))
                .andExpect(jsonPath("$.errors.position").value("Position cannot be blank"))
                .andExpect(jsonPath("$.errors.businessId").value("Business ID cannot be null"));
    }

    @Test
    @Order(6)
    public void testUpdateEmployeeWithNullBody() throws Exception {
        mockMvc.perform(put("/api/employees/1")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(""))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.error").value("Request body is missing or malformed."));
    }

    @Test
    @Order(7)
    public void testGetEmployeesByBusiness() throws Exception {
        Employee employee = new Employee(null, "Test Employee", "Role", business);
        employeeRepository.save(employee);

        mockMvc.perform(get("/api/employees/business/" + business.getId())
                        .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$", hasSize(1)))
                .andExpect(jsonPath("$[0].name").value(employee.getName()));
        List<Employee> employees = employeeRepository.findAllByBusinessId(business.getId());
        System.out.println("Employees found: " + employees.size());
    }

    @Test
    @Order(8)
    public void testUpdateEmployeeWithNonExistingId() throws Exception {
        EmployeeDto updatedEmployeeDto = EmployeeDto.builder()
                .name("Non Existing")
                .position("Unknown Position")
                .businessId(business.getId())
                .build();

        mockMvc.perform(put("/api/employees/99999")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(updatedEmployeeDto)))
                .andExpect(status().isNotFound())
                .andExpect(jsonPath("$.error").value("Employee not found with id: 99999"));
    }

    @Test
    @Order(9)
    public void testDeleteEmployeeWithNonExistingId() throws Exception {
        mockMvc.perform(delete("/api/employees/99999")
                        .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isNotFound())
                .andExpect(jsonPath("$.error").value("Employee not found with id: 99999"));
    }

    @Test
    @Order(10)
    public void testCreateEmployeeWithNullBody() throws Exception {
        mockMvc.perform(post("/api/employees")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(""))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.error").value("Request body is missing or malformed."));
    }







}

