package com.it.BookSmart.services;

import com.it.BookSmart.dtos.EmployeeDto;
import com.it.BookSmart.entities.Business;
import com.it.BookSmart.entities.Employee;
import com.it.BookSmart.mappers.EmployeeMapper;
import com.it.BookSmart.repositories.BusinessRepository;
import com.it.BookSmart.repositories.EmployeeRepository;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class EmployeeService {

    private final EmployeeRepository repository;

    private final EmployeeMapper employeeMapper;

    private final BusinessRepository businessRepository;

    public EmployeeService(EmployeeRepository repository, EmployeeMapper employeeMapper, BusinessRepository businessRepository) {
        this.repository = repository;
        this.employeeMapper = employeeMapper;
        this.businessRepository = businessRepository;
    }

    public EmployeeDto createEmployee(EmployeeDto employeeDto) {
        Business business = businessRepository.findById(employeeDto.getBusinessId())
                .orElseThrow(() -> new IllegalArgumentException("Business not found with id: " + employeeDto.getBusinessId()));

        Employee employee = new Employee();
        employee.setName(employeeDto.getName());
        employee.setPosition(employeeDto.getPosition());
        employee.setBusiness(business);

        return employeeMapper.toDto(repository.save(employee));
    }

    public EmployeeDto updateEmployee(Long id, EmployeeDto employeeDto) {
        Employee employee = repository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Employee not found with id: " + id));

        employee.setName(employeeDto.getName());
        employee.setPosition(employeeDto.getPosition());
        return employeeMapper.toDto(repository.save(employee));
    }

    public void deleteEmployee(Long id) {
        repository.deleteById(id);
    }

    public List<EmployeeDto> getEmployeesByBusinessId(Long businessId) {
        return repository.findAllByBusinessId(businessId)
                .stream()
                .map(employeeMapper::toDto)
                .toList();
    }
}