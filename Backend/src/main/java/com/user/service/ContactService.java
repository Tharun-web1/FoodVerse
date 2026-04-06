package com.user.service;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.user.entity.Contact;
import com.user.repo.ContactRepo;

@Service
public class ContactService {
	
	@Autowired
	public ContactRepo repo;
	
	public Contact Contactform(Contact contact) {
		return repo.save(contact);
	}
}
