package com.it.BookSmart.services;

import com.it.BookSmart.dtos.EmployeeDto;
import com.it.BookSmart.entities.Business;
import com.it.BookSmart.entities.Employee;
import com.it.BookSmart.entities.User;
import com.it.BookSmart.mappers.EmployeeMapper;
import com.it.BookSmart.repositories.BusinessRepository;
import com.it.BookSmart.repositories.EmployeeRepository;
import com.it.BookSmart.repositories.UserRepository;
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
    private final UserRepository userRepository;

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
        
        // Set user if userId is provided
        if (employeeDto.getUserId() != null) {
            User user = userRepository.findById(employeeDto.getUserId())
                    .orElseThrow(() -> new ResourceNotFoundException("User not found with id: " + employeeDto.getUserId()));
            employee.setUser(user);
        }

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
        
        // Update user if userId is provided
        if (employeeDto.getUserId() != null) {
            User user = userRepository.findById(employeeDto.getUserId())
                    .orElseThrow(() -> new ResourceNotFoundException("User not found with id: " + employeeDto.getUserId()));
            employee.setUser(user);
        } else {
            employee.setUser(null);
        }

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

    @Transactional
    public EmployeeDto getById(Long id) {
        Employee employee = repository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Employee not found with id: " + id));
        return employeeMapper.toDto(employee);
    }
}
