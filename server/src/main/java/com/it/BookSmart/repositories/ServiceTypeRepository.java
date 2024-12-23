package com.it.BookSmart.repositories;

import com.it.BookSmart.entities.ServiceType;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Collection;
import java.util.List;
import java.util.Optional;

@Repository
public interface ServiceTypeRepository extends JpaRepository<ServiceType, Long> {

    Optional<ServiceType> findServiceById(Long id);

    boolean existsByNameAndBusinessId(String name, Long businessId);

    List<ServiceType> findByBusinessId(Long businessId);
}

