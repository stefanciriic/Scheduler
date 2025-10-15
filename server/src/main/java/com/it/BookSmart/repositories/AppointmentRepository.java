package com.it.BookSmart.repositories;

import com.it.BookSmart.entities.Appointment;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface AppointmentRepository extends JpaRepository<Appointment, Long> {
    List<Appointment> findByUserIdOrderByAppointmentTimeDesc(Long userId);
    
    boolean existsByUserId(Long userId);
    
    long countByUserId(Long userId);
    
    // Note: Employee is the actual field name in Appointment entity
    long countByEmployee_Id(Long employeeId);
    
    List<Appointment> findByEmployee_Id(Long employeeId);
    
    // ServiceType is the actual field name in Appointment entity
    List<Appointment> findByServiceType_Id(Long serviceTypeId);
}