package com.it.BookSmart.services;

import com.cloudinary.Cloudinary;
import com.cloudinary.utils.ObjectUtils;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.HashMap;
import java.util.Map;

@Service
@RequiredArgsConstructor
public class CloudinaryService {

    private final Cloudinary cloudinary;


    public String uploadImage(MultipartFile file, String folder) {
        try {
            Map<String, Object> options = new HashMap<>();
            options.put("folder", folder);
            options.put("resource_type", "image");

            @SuppressWarnings("unchecked")
            Map<String, Object> result = (Map<String, Object>) cloudinary.uploader().upload(file.getBytes(), options);

            return (String) result.get("secure_url");
        } catch (IOException e) {
            throw new RuntimeException("Failed to upload image to Cloudinary", e);
        }
    }
}
