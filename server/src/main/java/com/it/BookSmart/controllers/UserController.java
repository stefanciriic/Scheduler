package com.it.BookSmart.controllers;

import com.it.BookSmart.dtos.UserDto;
import com.it.BookSmart.services.UserService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

@RestController
@RequestMapping("/api/users")
@RequiredArgsConstructor
public class UserController {

    private final UserService userService;

    @GetMapping("/{id}")
    public ResponseEntity<UserDto> getUserById(@PathVariable Long id) {
        UserDto userDto = userService.getUserById(id);
        return ResponseEntity.ok(userDto);
    }

    @PutMapping("/{id}")
    public ResponseEntity<UserDto> updateUser(
            @PathVariable Long id,
            @RequestBody @Valid UserDto userDto) {
        UserDto updatedUser = userService.updateUser(id, userDto);
        return ResponseEntity.ok(updatedUser);
    }

    @PutMapping("/{id}/profile-image")
    public ResponseEntity<UserDto> updateUserImage(
            @PathVariable Long id,
            @RequestParam("file") MultipartFile file) {
        UserDto updatedUser = userService.updateUserImage(id, file);
        return ResponseEntity.ok(updatedUser);
    }
}