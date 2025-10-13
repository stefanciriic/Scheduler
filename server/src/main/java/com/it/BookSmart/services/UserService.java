package com.it.BookSmart.services;

import com.it.BookSmart.dtos.UserDto;
import com.it.BookSmart.entities.Image;
import com.it.BookSmart.entities.User;
import com.it.BookSmart.exceptions.ResourceNotFoundException;
import com.it.BookSmart.exceptions.ValidationException;
import com.it.BookSmart.mappers.UserMapper;
import com.it.BookSmart.repositories.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.nio.CharBuffer;

@Service
@RequiredArgsConstructor
public class UserService {

    private final UserRepository userRepository;
    private final UserMapper userMapper;
    private final CloudinaryService cloudinaryService;

    public UserDto getUserById(Long id) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));
        return userMapper.toUserDto(user);
    }

    public UserDto updateUser(Long id, UserDto userDto) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));

        user.setFirstName(userDto.getFirstName());
        user.setLastName(userDto.getLastName());
        user.setUsername(userDto.getUsername());

        userRepository.save(user);
        return userMapper.toUserDto(user);
    }

    public UserDto updateUserImage(Long id, MultipartFile file) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));

        if (user.getProfileImage() != null) {
            cloudinaryService.deleteImage(user.getProfileImage().getPublicId());
        }

        String imageUrl = cloudinaryService.uploadImage(file, "user-profiles");
        Image newImage = Image.builder().url(imageUrl).build();
        user.setProfileImage(newImage);

        userRepository.save(user);
        return userMapper.toUserDto(user);
    }

    public UserDto findByUsername(String username) {
        if (username == null || username.isBlank()) {
            throw new ValidationException("Username cannot be null or blank");
        }

        return userRepository.findByUsername(username)
                .map(userMapper::toUserDto)
                .orElseThrow(() -> new ResourceNotFoundException("User with username " + username + " not found"));
    }


}

