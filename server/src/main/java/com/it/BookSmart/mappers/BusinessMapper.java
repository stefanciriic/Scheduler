package com.it.BookSmart.mappers;

import com.it.BookSmart.dtos.BusinessDto;
import com.it.BookSmart.entities.Business;
import com.it.BookSmart.entities.Employee;
import com.it.BookSmart.entities.ServiceType;
import com.it.BookSmart.entities.User;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.mapstruct.Named;

import java.util.List;
import java.util.stream.Collectors;

@Mapper(componentModel = "spring")
public interface BusinessMapper {

    @Mapping(target = "owner", source = "ownerId", qualifiedByName = "mapOwnerIdToUser")
    @Mapping(target = "image", ignore = true)
    @Mapping(target = "employees", ignore = true)
    @Mapping(target = "serviceTypes", ignore = true)
    Business toEntity(BusinessDto businessDto);

    @Mapping(target = "ownerId", source = "owner.id")
    @Mapping(target = "imageUrl", source = "image.url")
    @Mapping(target = "employeeIds", source = "employees", qualifiedByName = "mapEmployeesToIds")
    @Mapping(target = "serviceTypeIds", source = "serviceTypes", qualifiedByName = "mapServiceTypesToIds")
    BusinessDto toDto(Business business);

    @Named("mapOwnerIdToUser")
    default User mapOwnerIdToUser(Long ownerId) {
        return ownerId != null ? new User(ownerId) : null;
    }

    @Named("mapEmployeesToIds")
    default List<Long> mapEmployeesToIds(List<Employee> employees) {
        return employees.stream().map(Employee::getId).collect(Collectors.toList());
    }

    @Named("mapServiceTypesToIds")
    default List<Long> mapServiceTypesToIds(List<ServiceType> serviceTypes) {
        return serviceTypes.stream().map(ServiceType::getId).collect(Collectors.toList());
    }
}