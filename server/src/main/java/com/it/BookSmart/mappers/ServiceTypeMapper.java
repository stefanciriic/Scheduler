package com.it.BookSmart.mappers;

import com.it.BookSmart.dtos.ServiceTypeDto;
import com.it.BookSmart.entities.Business;
import com.it.BookSmart.entities.Employee;
import com.it.BookSmart.entities.ServiceType;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.mapstruct.Named;

@Mapper(componentModel = "spring")
public interface ServiceTypeMapper {

    @Mapping(target = "businessId", source = "business.id")
    @Mapping(target = "employeeId", source = "employee.id")
    ServiceTypeDto toDto(ServiceType serviceType);

    @Mapping(target = "business", ignore = true)
    @Mapping(target = "employee", ignore = true)
    @Mapping(target = "id", ignore = true)
    ServiceType toEntity(ServiceTypeDto serviceTypeDto);
}