package com.it.BookSmart.controllers;

import com.it.BookSmart.services.CloudinaryService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

@RestController
@RequestMapping("/api/images")
public class ImageController {

    @Autowired
    private CloudinaryService cloudinaryService;

    @PostMapping("/upload")
    public ResponseEntity<String> uploadImage(@RequestParam("file") MultipartFile file) {
        String imageUrl = cloudinaryService.uploadImage(file, "business-logos");
        return ResponseEntity.ok(imageUrl);
    }
}
