package com.it.BookSmart.mappers;

import com.it.BookSmart.dtos.ServiceTypeDto;
import com.it.BookSmart.entities.ServiceType;
import org.mapstruct.Mapper;

@Mapper(componentModel = "spring")
public interface ServiceTypeMapper {

    ServiceTypeDto toDto(ServiceType serviceType);

    ServiceType toEntity(ServiceTypeDto serviceTypeDto);
}