package com.it.BookSmart.mappers;

import com.it.BookSmart.dtos.EmployeeDto;
import com.it.BookSmart.entities.Business;
import com.it.BookSmart.entities.Employee;
import com.it.BookSmart.entities.User;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.mapstruct.Named;

@Mapper(componentModel = "spring")
public interface EmployeeMapper {

    @Mapping(target = "businessId", source = "business.id")
    @Mapping(target = "userId", source = "user.id")
    EmployeeDto toDto(Employee employee);

    @Mapping(target = "business", source = "businessId", qualifiedByName = "mapBusinessIdToBusiness")
    @Mapping(target = "user", source = "userId", qualifiedByName = "mapUserIdToUser")
    Employee toEntity(EmployeeDto employeeDto);

    @Named("mapBusinessIdToBusiness")
    default Business mapBusinessIdToBusiness(Long businessId) {
        return businessId != null ? new Business(businessId) : null;
    }
    
    @Named("mapUserIdToUser")
    default User mapUserIdToUser(Long userId) {
        return userId != null ? new User(userId) : null;
    }
}