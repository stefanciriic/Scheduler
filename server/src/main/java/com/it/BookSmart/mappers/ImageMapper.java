package com.it.BookSmart.mappers;

import com.it.BookSmart.dtos.ImageDto;
import com.it.BookSmart.entities.Image;
import org.mapstruct.Mapper;

@Mapper(componentModel = "spring")
public interface ImageMapper {
    ImageDto toDto(Image image);

    Image toEntity(ImageDto dto);
}