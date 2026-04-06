package com.user.controller;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;
import java.io.IOException;

import com.user.entity.DeliveryOrder;
import com.user.enums.DeliveryStatus;
import com.user.service.DeliveryOrderService;

@RestController
@RequestMapping("/delivery-orders")
@CrossOrigin("*")
public class DeliveryOrderController {

    @Autowired
    private DeliveryOrderService service;

    // 📦 Assign Order (Admin → Partner)
    @PostMapping("/assign")
    public DeliveryOrder assignOrder(
            @RequestParam("orderId") Integer orderId,
            @RequestParam("partnerId") Integer partnerId,
            @RequestBody DeliveryOrder orderDetails) {

        return service.assignOrder(
                orderId,
                partnerId,
                orderDetails);
    }

    // 🙋 Accept Order (Partner claims it)
    @PutMapping("/{id}/accept")
    public DeliveryOrder acceptOrder(
            @PathVariable("id") Integer id,
            @RequestParam("partnerId") Integer partnerId) {
        return service.acceptOrder(id, partnerId);
     }

    // 🔍 Get Available Orders (Unassigned)
    @GetMapping("/available")
    public List<DeliveryOrder> getAvailableOrders() {
        return service.getAvailableOrders();
    }

    // 📋 Orders by Partner
    @GetMapping("/partner/{partnerId}")
    public List<DeliveryOrder> getOrdersByPartner(
            @PathVariable("partnerId") Integer partnerId) {

        return service.getOrdersByPartner(partnerId);
    }

    // 🔄 Update Status
    @PutMapping("/status/{orderId}")
    public DeliveryOrder updateStatus(
            @PathVariable("orderId") Integer orderId,
            @RequestParam("status") DeliveryStatus status) {

        return service.updateStatus(orderId, status);
    }


    // 📊 Orders by Status (Admin)
    @GetMapping("/status")
    public List<DeliveryOrder> getOrdersByStatus(
            @RequestParam("status") DeliveryStatus status) {

        return service.getOrdersByStatus(status);
    }

    // ❌ Cancel Order
    @PutMapping("/cancel/{id}")
    public DeliveryOrder cancelOrder(
            @PathVariable("id") Integer id) {

        return service.cancelOrder(id);
    }

    // 📍 Get Rider Location for Order
    @GetMapping("/{orderId}/rider-location")
    public RiderLocation getRiderLocation(@PathVariable("orderId") Integer orderId) {
        DeliveryOrder delivery = service.getDeliveryByOrderId(orderId);
        if (delivery != null && delivery.getPartner() != null) {
            return new RiderLocation(
                delivery.getPartner().getLatitude(),
                delivery.getPartner().getLongitude()
            );
        }
        return null;
    }

    // Static DTO for response
    public static class RiderLocation {
        public Double lat;
        public Double lng;
        public RiderLocation(Double lat, Double lng) {
            this.lat = lat;
            this.lng = lng;
        }
    }

    // 📸 Upload Delivery Proof Photo
    @PostMapping("/{id}/proof")
    public DeliveryOrder uploadProof(
            @PathVariable("id") Integer id,
            @RequestParam("file") MultipartFile file) throws IOException {
        
        return service.uploadDeliveryPhoto(id, file);
    }
}
