package com.it.BookSmart.services;

import com.it.BookSmart.dtos.EmployeeDto;
import com.it.BookSmart.entities.Business;
import com.it.BookSmart.entities.Employee;
import com.it.BookSmart.entities.ServiceType;
import com.it.BookSmart.entities.User;
import com.it.BookSmart.mappers.EmployeeMapper;
import com.it.BookSmart.repositories.AppointmentRepository;
import com.it.BookSmart.repositories.BusinessRepository;
import com.it.BookSmart.repositories.EmployeeRepository;
import com.it.BookSmart.repositories.ServiceTypeRepository;
import com.it.BookSmart.repositories.UserRepository;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

import com.it.BookSmart.exceptions.ConflictException;
import com.it.BookSmart.exceptions.ResourceNotFoundException;

@Service
@RequiredArgsConstructor
public class EmployeeService {

    private final EmployeeRepository repository;
    private final EmployeeMapper employeeMapper;
    private final BusinessRepository businessRepository;
    private final UserRepository userRepository;
    private final AppointmentRepository appointmentRepository;
    private final ServiceTypeRepository serviceTypeRepository;

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
        // Check if employee exists
        Employee employee = repository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Employee not found with id: " + id));
        
        // Step 1: Check if employee has any appointments
        // Note: Appointment entity has @OnDelete(action = OnDeleteAction.CASCADE) which would
        // automatically delete all appointments when employee is deleted.
        // However, we want to prevent deletion if there are active appointments to protect user data.
        long appointmentCount = appointmentRepository.countByEmployee_Id(id);
        if (appointmentCount > 0) {
            throw new ConflictException(
                "Cannot delete employee with existing appointments. Employee has " + appointmentCount + 
                " appointment(s). Please cancel or reassign all appointments before deleting the employee."
            );
        }
        
        // Step 2: Unlink ServiceTypes that reference this employee
        // ServiceType has a foreign key to Employee, so we need to set it to null before deleting
        List<ServiceType> services = serviceTypeRepository.findByEmployeeId(id);
        if (!services.isEmpty()) {
            for (ServiceType service : services) {
                service.setEmployee(null);
            }
            serviceTypeRepository.saveAll(services);
        }
        
        // Step 3: If employee is linked to a user account, unlink it
        if (employee.getUser() != null) {
            // Option 1: Unlink the user (allow deletion but keep the user account)
            employee.setUser(null);
            repository.save(employee);
            
            // Option 2: Prevent deletion (uncomment below to enable)
            // throw new ConflictException(
            //     "Cannot delete employee linked to user account: " + employee.getUser().getUsername() + 
            //     ". Please unlink the user account first."
            // );
        }
        
        // Step 4: Finally, delete the employee
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
