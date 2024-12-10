package com.it.BookSmart.services;

import com.it.BookSmart.dtos.CredentialsDto;
import com.it.BookSmart.dtos.SignUpDto;
import com.it.BookSmart.dtos.UserDto;
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
import java.util.Optional;

@Service
@RequiredArgsConstructor
public class UserService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final UserMapper userMapper;

    public UserDto login(CredentialsDto credentialsDto) {
        validateCredentials(credentialsDto);

        User user = userRepository.findByUsername(credentialsDto.getUsername())
                .orElseThrow(() -> new ResourceNotFoundException("Unknown user with username: " + credentialsDto.getUsername()));

        if (!passwordEncoder.matches(CharBuffer.wrap(credentialsDto.getPassword()), user.getPassword())) {
            throw new ValidationException("Invalid password");
        }

        return userMapper.toUserDto(user);
    }

    public UserDto register(SignUpDto userDto) {
        validateSignUp(userDto);

        if (userRepository.findByUsername(userDto.getUsername()).isPresent()) {
            throw new ConflictException("Username already exists");
        }

        User user = userMapper.signUpToUser(userDto);
        user.setPassword(passwordEncoder.encode(CharBuffer.wrap(userDto.getPassword())));

        User savedUser = userRepository.save(user);
        return userMapper.toUserDto(savedUser);
    }

    public UserDto findByUsername(String username) {
        if (username == null || username.isBlank()) {
            throw new ValidationException("Username cannot be null or blank");
        }

        return userRepository.findByUsername(username)
                .map(userMapper::toUserDto)
                .orElseThrow(() -> new ResourceNotFoundException("User with username " + username + " not found"));
    }

    public boolean isUsernameAvailable(String username) {
        if (username == null || username.isBlank()) {
            throw new ValidationException("Username cannot be null or blank");
        }
        return !userRepository.existsByUsername(username);
    }

    private void validateCredentials(CredentialsDto credentialsDto) {
        if (credentialsDto.getUsername() == null || credentialsDto.getUsername().isBlank()) {
            throw new ValidationException("Username cannot be null or blank");
        }
        if (credentialsDto.getPassword() == null || credentialsDto.getPassword().isEmpty()) {
            throw new ValidationException("Password cannot be null or blank");
        }
    }

    private void validateSignUp(SignUpDto userDto) {
        if (userDto.getUsername() == null || userDto.getUsername().isBlank()) {
            throw new ValidationException("Username cannot be null or blank");
        }
        if (userDto.getPassword() == null || userDto.getPassword().isEmpty()) {
            throw new ValidationException("Password cannot be null or blank");
        }
        if (userDto.getFirstName() == null || userDto.getFirstName().isBlank()) {
            throw new ValidationException("First name cannot be null or blank");
        }
        if (userDto.getLastName() == null || userDto.getLastName().isBlank()) {
            throw new ValidationException("Last name cannot be null or blank");
        }
    }
}

