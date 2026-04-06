import React, { useEffect, useState } from "react";
import api from "../../services/api";
import Navbar from "../Restaurant/Navbar";
import OrderTable from "./OrderTable";
import Loader from "../Common/Loader";
import "../RestaurantCss/Orders.css";

export default function Orders() {
  const [orders, setOrders] = useState([]);
  const [activeStatus, setActiveStatus] = useState("ALL");
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const token = localStorage.getItem("restaurant_token");


  const isValidId = (id) => {
    return id && id !== "undefined" && id !== "null";
  };

  useEffect(() => {
    const initializeOrders = async () => {
      let restaurantId = localStorage.getItem("restaurantId");

      if (!isValidId(restaurantId)) {
        try {
          const profileRes = await api.get('/restaurants/profile');

          if (profileRes.data && profileRes.data.id) {
            restaurantId = profileRes.data.id;
            localStorage.setItem("restaurantId", restaurantId);
          } else {
            throw new Error("Could not retrieve a valid restaurant ID");
          }
        } catch (err) {
          console.error("Error fetching profile info:", err);
          setError("Failed to identify restaurant. Please log in again.");
          setIsLoading(false);
          return;
        }
      }

      if (isValidId(restaurantId)) {
        fetchOrders(restaurantId);
      } else {
        setError("Invalid restaurant ID. Please try logging in again.");
        setIsLoading(false);
      }
    };

    initializeOrders();
  }, [token]);


  const fetchOrders = async (resId) => {
    if (!isValidId(resId)) return;
    setIsLoading(true);
    try {
      const res = await api.get(`/orders/restaurant/${resId}`);

      setOrders(res.data);
      setError(null);
    } catch (err) {
      console.error("Error fetching orders:", err);
      setError("Failed to load orders. Please try again later.");
    } finally {
      setIsLoading(false);
    }
  };

  const updateStatus = async (orderId, status) => {
    try {
      await api.put(`/orders/${orderId}/status?status=${status}`);
      fetchOrders(localStorage.getItem("restaurantId"));
    } catch (err) {
      console.error("Error updating status:", err);
      alert("Failed to update order status.");
    }
  };

  const handleRefresh = () => {
    const resId = localStorage.getItem("restaurantId");
    if (isValidId(resId)) {
      fetchOrders(resId);
    } else {
      window.location.reload();
    }
  };

  const statusCategories = [
    { label: "All", value: "ALL" },
    { label: "New", value: "NEW" }, // PLACED, PAID
    { label: "Accepted", value: "ACCEPTED" },
    { label: "Preparing", value: "PREPARING" },
    { label: "Out for Delivery", value: "OUT_FOR_DELIVERY" },
    { label: "Completed", value: "DELIVERED" },
    { label: "Cancelled", value: "CANCELLED" }
  ];

  const filteredOrders = orders
    .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
    .filter(order => {
      if (activeStatus === "ALL") return true;
      if (activeStatus === "NEW") return ["PLACED", "PAID"].includes(order.status);
      if (activeStatus === "CANCELLED") return ["CANCELLED", "CANCELED", "REJECTED"].includes(order.status);
      return order.status === activeStatus;
    });

  return (
    <>
      <Navbar />
      <div className="orders-premium-container">
        
        {/* Header Section */}
        <div className="orders-header-glass">
          <h1 className="orders-title">📦 Manage <span>Orders</span></h1>
          <button className="btn btn-outline-light px-4 rounded-pill" onClick={handleRefresh} disabled={isLoading}>
            {isLoading ? (
              <>
                <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                Refreshing...
              </>
            ) : "Refresh Orders"}
          </button>
        </div>

        {/* Status Filter Tabs (Scrollable) */}
        <div className="orders-filter-wrapper">
          <div className="orders-filter-pills">
            {statusCategories.map((cat) => (
              <button
                key={cat.value}
                className={`filter-pill ${activeStatus === cat.value ? "active shadow-sm" : ""}`}
                onClick={() => setActiveStatus(cat.value)}
              >
                {cat.label}
                {cat.value !== "ALL" && (
                  <span className="filter-badge">
                     {orders.filter(o => {
                       if (cat.value === "NEW") return ["PLACED", "PAID"].includes(o.status);
                       if (cat.value === "CANCELLED") return ["CANCELLED", "CANCELED", "REJECTED"].includes(o.status);
                       return o.status === cat.value;
                     }).length}
                  </span>
                )}
              </button>
            ))}
          </div>
        </div>

        {isLoading ? (
          <Loader text="Fetching your orders..." />
        ) : error ? (
          <div className="alert alert-danger mx-auto max-width-600" role="alert" style={{ maxWidth: '600px' }}>
            {error}
          </div>
        ) : (
          <OrderTable orders={filteredOrders} updateStatus={updateStatus} />
        )}
      </div>
    </>
  );
}
