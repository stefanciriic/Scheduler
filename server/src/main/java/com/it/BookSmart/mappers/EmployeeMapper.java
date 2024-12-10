package com.it.BookSmart.mappers;

import com.it.BookSmart.dtos.EmployeeDto;
import com.it.BookSmart.entities.Business;
import com.it.BookSmart.entities.Employee;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.mapstruct.Named;

@Mapper(componentModel = "spring")
public interface EmployeeMapper {

    @Mapping(target = "businessId", source = "business.id")
    EmployeeDto toDto(Employee employee);

    @Mapping(target = "business", source = "businessId", qualifiedByName = "mapBusinessIdToBusiness")
    Employee toEntity(EmployeeDto employeeDto);

    @Named("mapBusinessIdToBusiness")
    default Business mapBusinessIdToBusiness(Long businessId) {
        return businessId != null ? new Business(businessId) : null;
    }}