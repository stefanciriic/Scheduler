package com.it.BookSmart.services;

import com.it.BookSmart.dtos.CredentialsDto;
import com.it.BookSmart.dtos.SignUpDto;
import com.it.BookSmart.dtos.UserDto;
import com.it.BookSmart.entities.Role;
import com.it.BookSmart.entities.User;
import com.it.BookSmart.exceptions.ConflictException;
import com.it.BookSmart.exceptions.ResourceNotFoundException;
import com.it.BookSmart.exceptions.ValidationException;
import com.it.BookSmart.mappers.UserMapper;
import com.it.BookSmart.repositories.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.nio.CharBuffer;

@Service
@RequiredArgsConstructor
public class AuthService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final UserMapper userMapper;

    public UserDto login(CredentialsDto credentialsDto) {
        User user = userRepository.findByUsername(credentialsDto.getUsername())
                .orElseThrow(() -> new ResourceNotFoundException("Unknown user with username: " + credentialsDto.getUsername()));

        if (!passwordEncoder.matches(CharBuffer.wrap(credentialsDto.getPassword()), user.getPassword())) {
            throw new ValidationException("Invalid password");
        }

        return userMapper.toUserDto(user);
    }

    public UserDto register(SignUpDto userDto) {
        if (userRepository.findByUsername(userDto.getUsername()).isPresent()) {
            throw new ConflictException("Username already exists");
        }

        User user = userMapper.signUpToUser(userDto);
        if (userDto.getRole() != null && !userDto.getRole().isEmpty()) {
            user.setRole(Role.valueOf(userDto.getRole()));
        } else {
            user.setRole(Role.USER);
        }

        user.setPassword(passwordEncoder.encode(CharBuffer.wrap(userDto.getPassword())));

        User savedUser = userRepository.save(user);
        return userMapper.toUserDto(savedUser);
    }

    public boolean isUsernameAvailable(String username) {
        if (username == null || username.isBlank()) {
            throw new ValidationException("Username cannot be null or blank");
        }
        return !userRepository.existsByUsername(username);
    }



}
