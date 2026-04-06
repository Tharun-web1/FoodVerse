package com.user.service;

import com.user.entity.Address;
import com.user.entity.UserEntity;
import com.user.repo.AddressRepo;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@Transactional
public class AddressService {

    @Autowired
    private AddressRepo addressRepo;

    public Address addAddress(UserEntity user, Address address) {
        if (user == null) {
            throw new RuntimeException("User not found");
        }
        
        // Check if a "CURRENT" address already exists for this user
        if ("CURRENT".equals(address.getAddressType())) {
            List<Address> existingAddresses = addressRepo.findByUserId(user.getId());
            Address currentAddress = existingAddresses.stream()
                .filter(a -> "CURRENT".equals(a.getAddressType()))
                .findFirst()
                .orElse(null);          
            if (currentAddress != null) {
                // Update existing CURRENT address
                currentAddress.setAddressLine(address.getAddressLine());
                currentAddress.setCity(address.getCity());
                currentAddress.setState(address.getState());
                currentAddress.setZipCode(address.getZipCode());
                currentAddress.setLatitude(address.getLatitude());
                currentAddress.setLongitude(address.getLongitude());
                currentAddress.setDefault(true); // Current detected is usually the default
                
                // Unset other default addresses
                for (Address a : existingAddresses) {
                    if (a.isDefault() && !a.getId().equals(currentAddress.getId())) {
                        a.setDefault(false);
                        addressRepo.save(a);
                    }
                }
                return addressRepo.save(currentAddress);
            }
        }

        address.setUser(user);
        
        List<Address> existingAddresses = addressRepo.findByUserId(user.getId());
        if (existingAddresses.isEmpty()) {
            address.setDefault(true);
        } else if (address.isDefault()) {
            for (Address a : existingAddresses) {
                if (a.isDefault()) {
                    a.setDefault(false);
                    addressRepo.save(a);
                }
            }
        }
        
        return addressRepo.save(address);
    }

    public List<Address> getAddressesByUser(UserEntity user) {
        if (user == null) {
            throw new RuntimeException("User not found");
        }
        return addressRepo.findByUserId(user.getId());
    }

    public void deleteAddress(Long addressId, UserEntity user) {
        Address address = addressRepo.findById(addressId)
                .orElseThrow(() -> new RuntimeException("Address not found"));
        
        if (!address.getUser().getId().equals(user.getId())) {
            throw new RuntimeException("Unauthorized");
        }
        
        addressRepo.delete(address);
    }
}
