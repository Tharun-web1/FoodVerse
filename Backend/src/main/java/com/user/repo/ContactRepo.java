package com.user.repo;

import org.springframework.data.jpa.repository.JpaRepository;

import com.user.entity.Contact;

public interface ContactRepo extends JpaRepository<Contact, Integer> {
	

}
