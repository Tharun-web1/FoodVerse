package com.user.repo;

import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import com.user.entity.Order;

public interface OrderRepo extends JpaRepository<Order, Long>{
	 List<Order> findByUserId(@Param("userId") Long userId);
	 
	 long countByUserId(@Param("userId") Long userId);
	 
	 @Query("SELECT DISTINCT o FROM Order o LEFT JOIN FETCH o.items i LEFT JOIN FETCH i.item WHERE o.user.id = :userId")
	 List<Order> findByUserIdWithItems(@Param("userId") Long userId);

	 @Query("SELECT DISTINCT o FROM Order o LEFT JOIN FETCH o.items WHERE o.restaurant.id = :restaurantId")
	 List<Order> findByRestaurantId(@Param("restaurantId") Long restaurantId);
 
	 java.util.Optional<Order> findByRazorpayOrderId(@Param("razorpayOrderId") String razorpayOrderId);

    @Query("SELECT FUNCTION('DATE', o.createdAt), SUM(o.totalAmount) FROM Order o WHERE o.status = 'DELIVERED' GROUP BY FUNCTION('DATE', o.createdAt)")
    java.util.List<Object[]> getDailyRevenue();

    @Query("SELECT SUM(o.totalAmount) FROM Order o WHERE o.status = 'DELIVERED'")
    Double getTotalRevenue();
}
