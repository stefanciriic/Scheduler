package com.it.BookSmart.mappers;

import com.it.BookSmart.dtos.ImageDto;
import com.it.BookSmart.entities.Image;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;

@Mapper(componentModel = "spring")
public interface ImageMapper {
    ImageDto toDto(Image image);

    @Mapping(target = "business", ignore = true)
    Image toEntity(ImageDto dto);
}