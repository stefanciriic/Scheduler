package com.it.BookSmart.repositories;

import com.it.BookSmart.entities.Business;
import org.springframework.data.jpa.repository.JpaRepository;

public interface BusinessRepository extends JpaRepository<Business, Long> {}