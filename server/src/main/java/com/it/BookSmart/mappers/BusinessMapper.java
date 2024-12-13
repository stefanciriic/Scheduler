package com.it.BookSmart.mappers;

import com.it.BookSmart.dtos.BusinessDto;
import com.it.BookSmart.entities.Business;
import com.it.BookSmart.entities.User;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.mapstruct.Named;

@Mapper(componentModel = "spring")
public interface BusinessMapper {

    @Mapping(target = "owner", source = "ownerId", qualifiedByName = "mapOwnerIdToUser")
    @Mapping(target = "image", ignore = true)
    Business toEntity(BusinessDto businessDto);

    @Mapping(target = "ownerId", source = "owner.id")
    @Mapping(target = "imageUrl", source = "image.url")
    BusinessDto toDto(Business business);

    @Named("mapOwnerIdToUser")
    default User mapOwnerIdToUser(Long ownerId) {
        return ownerId != null ? new User(ownerId) : null;
    }
}