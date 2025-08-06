package com.it.BookSmart.mappers;

import com.it.BookSmart.dtos.SignUpDto;
import com.it.BookSmart.dtos.UserDto;
import com.it.BookSmart.entities.User;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;

@Mapper(componentModel = "spring")
public interface UserMapper {

    @Mapping(target = "imageUrl", source = "profileImage.url")
    UserDto toUserDto(User user);

    @Mapping(target = "profileImage", ignore = true)
    @Mapping(target = "password", ignore = true)
    User signUpToUser(SignUpDto signUpDto);

}

