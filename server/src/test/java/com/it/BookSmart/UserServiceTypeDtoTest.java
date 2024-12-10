package com.it.BookSmart;

import com.it.BookSmart.dtos.SignUpDto;
import com.it.BookSmart.dtos.UserDto;
import com.it.BookSmart.entities.User;
import com.it.BookSmart.exceptions.AppException;
import com.it.BookSmart.mappers.UserMapper;
import com.it.BookSmart.repositories.UserRepository;
import com.it.BookSmart.services.UserService;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.crypto.password.PasswordEncoder;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.mockito.Mockito.when;

import java.nio.CharBuffer;
import java.util.Optional;

@ExtendWith(MockitoExtension.class)
class UserServiceTypeDtoTest {

    @Mock
    private UserRepository userRepository;

    @Mock
    private UserMapper userMapper;

    @Mock
    private PasswordEncoder passwordEncoder;

    @InjectMocks
    private UserService userService;

    @Test
    void testRegister_Success() {
        SignUpDto signUpDto = new SignUpDto("newUser", "password123", "John", "Doe".toCharArray());
        User user = new User(null, "John", "Doe", "newUser", null,null);
        User savedUser = new User(1L, "John", "Doe", "newUser", "encodedPassword",null);
        UserDto expectedDto = new UserDto(1L, "John", "Doe", "newUser", null);

        when(userRepository.findByUsername(signUpDto.username())).thenReturn(Optional.empty());
        when(userMapper.signUpToUser(signUpDto)).thenReturn(user);
        when(passwordEncoder.encode(CharBuffer.wrap(signUpDto.password()))).thenReturn("encodedPassword");
        when(userRepository.save(user)).thenReturn(savedUser);
        when(userMapper.toUserDto(savedUser)).thenReturn(expectedDto);

        UserDto actualDto = userService.register(signUpDto);

        assertEquals(expectedDto, actualDto);
    }

    @Test
    void testRegister_UsernameAlreadyExists() {
        SignUpDto signUpDto = new SignUpDto("existingUser", "password123", "Jane", "Doe".toCharArray());

        when(userRepository.findByUsername(signUpDto.username())).thenReturn(Optional.of(new User()));

        AppException exception = assertThrows(AppException.class, () -> userService.register(signUpDto));

        assertEquals("Username already exists", exception.getMessage());
    }
}
