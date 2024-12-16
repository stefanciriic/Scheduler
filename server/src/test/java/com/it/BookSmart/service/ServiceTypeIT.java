package com.it.BookSmart.service;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.it.BookSmart.dtos.ServiceTypeDto;
import com.it.BookSmart.entities.Business;
import com.it.BookSmart.entities.ServiceType;
import com.it.BookSmart.repositories.BusinessRepository;
import com.it.BookSmart.repositories.ServiceTypeRepository;
import org.junit.jupiter.api.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.web.servlet.MockMvc;

import static org.hamcrest.Matchers.hasSize;

import static org.junit.jupiter.api.Assertions.*;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultHandlers.print;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@AutoConfigureMockMvc
@ActiveProfiles("test")
@TestMethodOrder(MethodOrderer.OrderAnnotation.class)
@SpringBootTest(webEnvironment = SpringBootTest.WebEnvironment.RANDOM_PORT)
public class ServiceTypeIT {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @Autowired
    private BusinessRepository businessRepository;

    @Autowired
    private ServiceTypeRepository serviceTypeRepository;

    private static Business business;
    private static ServiceTypeDto serviceTypeDto;
    private static long createdServiceTypeId;

    @BeforeAll
    public static void setup(@Autowired BusinessRepository businessRepository) {
        business = businessRepository.save(
                new Business(null, "Test Business", "123 Main Street", "A test business", "9 AM - 5 PM",null)
        );

        assertNotNull(business.getId(), "Business ID should not be null after save");

        serviceTypeDto = ServiceTypeDto.builder()
                .name("Oil Change")
                .description("Basic oil change service")
                .price(29.99)
                .businessId(business.getId())
                .build();
    }

    @Test
    @Order(1)
    public void testCreateServiceType() throws Exception {
        String response = mockMvc.perform(post("/api/service-types")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(serviceTypeDto)))
                .andDo(print())
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.id").isNumber())
                .andExpect(jsonPath("$.name").value(serviceTypeDto.getName()))
                .andExpect(jsonPath("$.description").value(serviceTypeDto.getDescription()))
                .andExpect(jsonPath("$.price").value(serviceTypeDto.getPrice()))
                .andReturn().getResponse().getContentAsString();

        ServiceTypeDto createdServiceType = objectMapper.readValue(response, ServiceTypeDto.class);
        createdServiceTypeId = createdServiceType.getId();

        ServiceType savedServiceType = serviceTypeRepository.findById(createdServiceTypeId).orElseThrow();
        assertEquals(serviceTypeDto.getName(), savedServiceType.getName());
        assertEquals(serviceTypeDto.getDescription(), savedServiceType.getDescription());
        assertEquals(serviceTypeDto.getPrice(), savedServiceType.getPrice());
        assertEquals(serviceTypeDto.getBusinessId(), savedServiceType.getBusiness().getId());
    }

    @Test
    @Order(2)
    public void testUpdateServiceType() throws Exception {
        ServiceTypeDto updatedServiceTypeDto = ServiceTypeDto.builder()
                .id(createdServiceTypeId)
                .name("Premium Oil Change")
                .description("Premium oil change service with high-quality oil")
                .price(49.99)
                .businessId(business.getId())
                .build();

        mockMvc.perform(put("/api/service-types/" + createdServiceTypeId)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(updatedServiceTypeDto)))
                .andDo(print())
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.name").value(updatedServiceTypeDto.getName()))
                .andExpect(jsonPath("$.description").value(updatedServiceTypeDto.getDescription()))
                .andExpect(jsonPath("$.price").value(updatedServiceTypeDto.getPrice()));

        ServiceType updatedServiceType = serviceTypeRepository.findById(createdServiceTypeId).orElseThrow();
        assertEquals(updatedServiceTypeDto.getName(), updatedServiceType.getName());
        assertEquals(updatedServiceTypeDto.getDescription(), updatedServiceType.getDescription());
        assertEquals(updatedServiceTypeDto.getPrice(), updatedServiceType.getPrice());
    }
    @Test
    @Order(3)
    public void testGetAllServiceTypes() throws Exception {
        mockMvc.perform(get("/api/service-types")
                        .contentType(MediaType.APPLICATION_JSON))
                .andDo(print())
                .andExpect(status().isOk())
                .andExpect(jsonPath("$", hasSize(1)))
                .andExpect(jsonPath("$[0].name").value("Premium Oil Change"));
    }

    @Test
    @Order(4)
    public void testDeleteServiceType() throws Exception {
        mockMvc.perform(delete("/api/service-types/" + createdServiceTypeId)
                        .contentType(MediaType.APPLICATION_JSON))
                .andDo(print())
                .andExpect(status().isNoContent());

        assertFalse(serviceTypeRepository.findById(createdServiceTypeId).isPresent());
    }
}
