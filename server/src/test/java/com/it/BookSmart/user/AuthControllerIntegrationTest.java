package com.it.BookSmart.user;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.it.BookSmart.dtos.CredentialsDto;
import com.it.BookSmart.dtos.SignUpDto;
import com.it.BookSmart.entities.User;
import com.it.BookSmart.repositories.UserRepository;
import org.junit.jupiter.api.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.web.servlet.MockMvc;

import static org.junit.jupiter.api.Assertions.assertTrue;
import static org.springframework.test.web.servlet.result.MockMvcResultHandlers.print;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@AutoConfigureMockMvc
@ActiveProfiles("test")
@TestMethodOrder(MethodOrderer.OrderAnnotation.class)
@SpringBootTest(webEnvironment = SpringBootTest.WebEnvironment.RANDOM_PORT)
public class AuthControllerIntegrationTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @Autowired
    private ObjectMapper objectMapper;

    private static final String REGISTER_URL = "/api/register";
    private static final String LOGIN_URL = "/api/login";

    private static final String TEST_USERNAME = "testUser";
    private static final String TEST_PASSWORD = "password";

    @BeforeAll
    static void setup(@Autowired UserRepository userRepository) {
        userRepository.deleteAll();
    }

    @Test
    @Order(1)
    void testRegisterUser() throws Exception {
        SignUpDto signUpDto = new SignUpDto("Test", "User", TEST_USERNAME, TEST_PASSWORD);

        mockMvc.perform(post(REGISTER_URL)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(signUpDto)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.username").value(TEST_USERNAME))
                .andExpect(jsonPath("$.token").isNotEmpty());

        // Verify user exists in the database
        assertTrue(userRepository.existsByUsername(TEST_USERNAME));
    }

    @Test
    @Order(2)
    void testLoginWithValidCredentials() throws Exception {
        CredentialsDto credentials = new CredentialsDto(TEST_USERNAME, TEST_PASSWORD);

        mockMvc.perform(post(LOGIN_URL)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(credentials)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.username").value(TEST_USERNAME))
                .andExpect(jsonPath("$.token").isNotEmpty());
    }

    @Test
    @Order(3)
    void testLoginWithInvalidPassword() throws Exception {
        CredentialsDto credentials = new CredentialsDto(TEST_USERNAME, "wrongPassword");

        mockMvc.perform(post(LOGIN_URL)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(credentials)))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.error").value("Invalid password"));
    }

    @Test
    @Order(4)
    void testLoginWithUnknownUser() throws Exception {
        CredentialsDto credentials = new CredentialsDto("unknownUser", "password");

        mockMvc.perform(post(LOGIN_URL)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(credentials)))
                .andExpect(status().isNotFound())
                .andExpect(jsonPath("$.error").value("Unknown user with username: unknownUser"));
    }

    @Test
    @Order(5)
    void testRegisterUserWithDuplicateUsername() throws Exception {
        SignUpDto signUpDto = new SignUpDto("Test", "User Duplicate", TEST_USERNAME, TEST_PASSWORD);

        mockMvc.perform(post(REGISTER_URL)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(signUpDto)))
                .andExpect(status().isConflict())
                .andExpect(jsonPath("$.error").value("Username already exists"));
    }
}

