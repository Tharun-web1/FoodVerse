package com.user.repo;

import java.util.List;
import java.util.Optional;

import org.springframework.data.repository.query.Param;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.user.entity.DeliveryOrder;
import com.user.enums.DeliveryStatus;

@Repository
public interface DeliveryOrderRepo
        extends JpaRepository<DeliveryOrder, Integer> {

    // Orders assigned to a partner
    List<DeliveryOrder> findByPartnerId(@Param("partnerId") Integer partnerId);

    // Orders by status
    List<DeliveryOrder> findByStatus(DeliveryStatus status);

    // Partner + Status filter
    List<DeliveryOrder> findByPartnerIdAndStatus(
            Integer partnerId,
            DeliveryStatus status);

    // Today delivered orders (for earnings / reports)
    List<DeliveryOrder> findByPartnerIdAndStatusOrderByDeliveredTimeDesc(
            Integer partnerId,
            DeliveryStatus status);

    Optional<DeliveryOrder> findByOrderId(Integer orderId);

    long countByPartnerIdAndStatus(Integer partnerId, DeliveryStatus status);
}
