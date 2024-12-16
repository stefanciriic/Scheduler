package com.it.BookSmart.services;

import com.it.BookSmart.dtos.EmployeeDto;
import com.it.BookSmart.entities.Business;
import com.it.BookSmart.entities.Employee;
import com.it.BookSmart.mappers.EmployeeMapper;
import com.it.BookSmart.repositories.BusinessRepository;
import com.it.BookSmart.repositories.EmployeeRepository;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

import com.it.BookSmart.exceptions.ResourceNotFoundException;

@Service
@RequiredArgsConstructor
public class EmployeeService {

    private final EmployeeRepository repository;
    private final EmployeeMapper employeeMapper;
    private final BusinessRepository businessRepository;

    public List<EmployeeDto> getAllEmployees() {
        return repository.findAll()
                .stream()
                .map(employeeMapper::toDto)
                .collect(Collectors.toList());
    }

    public EmployeeDto createEmployee(EmployeeDto employeeDto) {
        Business business = businessRepository.findById(employeeDto.getBusinessId())
                .orElseThrow(() -> new ResourceNotFoundException("Business not found with id: " + employeeDto.getBusinessId()));

        Employee employee = new Employee();
        employee.setName(employeeDto.getName());
        employee.setPosition(employeeDto.getPosition());
        employee.setBusiness(business);

        return employeeMapper.toDto(repository.save(employee));
    }
    @Transactional
    public EmployeeDto updateEmployee(Long id, EmployeeDto employeeDto) {
        Employee employee = repository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Employee not found with id: " + id));

        Business business = businessRepository.findById(employeeDto.getBusinessId())
                .orElseThrow(() -> new ResourceNotFoundException("Business not found with id: " + employeeDto.getBusinessId()));

        employee.setName(employeeDto.getName());
        employee.setPosition(employeeDto.getPosition());
        employee.setBusiness(business);

        return employeeMapper.toDto(repository.save(employee));
    }

    @Transactional
    public void deleteEmployee(Long id) {
        if (!repository.existsById(id)) {
            throw new ResourceNotFoundException("Employee not found with id: " + id);
        }
        repository.deleteById(id);
    }

    public List<EmployeeDto> getEmployeesByBusinessId(Long businessId) {
        if (!businessRepository.existsById(businessId)) {
            throw new ResourceNotFoundException("Business not found with id: " + businessId);
        }

        return repository.findAllByBusinessId(businessId)
                .stream()
                .map(employeeMapper::toDto)
                .toList();
    }
}
