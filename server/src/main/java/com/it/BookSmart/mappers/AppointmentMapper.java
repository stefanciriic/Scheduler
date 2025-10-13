package com.it.BookSmart.mappers;

import com.it.BookSmart.dtos.AppointmentDto;
import com.it.BookSmart.entities.Appointment;
import com.it.BookSmart.entities.Employee;
import com.it.BookSmart.entities.ServiceType;
import com.it.BookSmart.entities.User;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.mapstruct.Named;

@Mapper(componentModel = "spring")
public interface AppointmentMapper {

    @Mapping(target = "user", source = "userId", qualifiedByName = "mapUserIdToUser")
    @Mapping(target = "serviceType", source = "serviceId", qualifiedByName = "mapServiceIdToServiceType")
    @Mapping(target = "employee", source = "employeeId", qualifiedByName = "mapEmployeeIdToEmployee")
    Appointment toEntity(AppointmentDto appointmentDto);

    @Mapping(target = "userId", source = "user.id")
    @Mapping(target = "serviceId", source = "serviceType.id")
    @Mapping(target = "employeeId", source = "employee.id")
    @Mapping(target = "serviceName", source = "serviceType.name")
    AppointmentDto toDto(Appointment appointment);

    @Named("mapUserIdToUser")
    default User mapUserIdToUser(Long userId) {
        return userId != null ? new User(userId) : null;
    }

    @Named("mapServiceIdToServiceType")
    default ServiceType mapServiceIdToServiceType(Long serviceId) {
        return serviceId != null ? new ServiceType(serviceId) : null;
    }

    @Named("mapEmployeeIdToEmployee")
    default Employee mapEmployeeIdToEmployee(Long employeeId) {
        return employeeId != null ? new Employee(employeeId) : null;
    }
}
