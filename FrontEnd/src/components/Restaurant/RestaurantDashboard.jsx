import React, { useEffect, useState, useMemo, useContext } from "react";
import { useNavigate } from "react-router-dom";
import api from "../../services/api";
import Navbar from "../Restaurant/Navbar";
import "../RestaurantCss/RestaurantDashboard.css";
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
  BarChart, Bar, Cell
} from 'recharts';
import { RestaurantOrderContext } from "../../context/RestaurantOrderContext";

export default function RestaurantDashboard() {
  const navigate = useNavigate();

  const token = localStorage.getItem("restaurant_token");

  const isValidId = (id) => {
    return id && id !== "undefined" && id !== "null";
  };

  const [profileInfo, setProfileInfo] = useState({});
  const [stats, setStats] = useState({
    todayOrders: 0,
    delivered: 0,
    pending: 0,
    canceled: 0,
    revenue: 0,
    todayRevenue: 0,
    totalOrders: 0,
  });

  const { orders: allOrders } = useContext(RestaurantOrderContext);
  const [filterPeriod, setFilterPeriod] = useState("daily"); // daily, weekly, monthly

  useEffect(() => {
    const initializeDashboard = async () => {
      let currentId = localStorage.getItem("restaurantId");

      try {
        const profileRes = await api.get('/restaurants/profile');
        if (profileRes.data) {
          setProfileInfo(profileRes.data);
          if (profileRes.data.id) {
            currentId = profileRes.data.id;
            localStorage.setItem("restaurantId", currentId);
          }
        }
      } catch (err) {
        console.error("Dashboard: Failed to fetch profile info", err);
      }
    };

    initializeDashboard();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token]);

  // Update stats whenever allOrders changes
  useEffect(() => {
    if (!allOrders || allOrders.length === 0) return;

    const now = new Date();
    const todayDay = now.getDate();
    const todayMonth = now.getMonth();
    const todayYear = now.getFullYear();

    let todayOrders = 0;
    let delivered = 0;
    let pending = 0;
    let canceled = 0;
    let revenue = 0;
    let todayRevenue = 0;

    allOrders.forEach((o) => {
      const dateObj = o.createdAt ? new Date(o.createdAt) : null;

      if (dateObj && !isNaN(dateObj.getTime())) {
        const isToday =
          dateObj.getDate() === todayDay &&
          dateObj.getMonth() === todayMonth &&
          dateObj.getFullYear() === todayYear;

        if (isToday) {
          todayOrders++;
          if (o.status === "DELIVERED") {
            todayRevenue += o.totalAmount;
          }
        }
      }

      if (o.status === "DELIVERED") {
        delivered++;
        revenue += o.totalAmount;
      }
      else if (["PENDING", "ACCEPTED", "PREPARING", "OUT_FOR_DELIVERY"].includes(o.status)) {
        pending++;
      }
      else if (o.status === "REJECTED" || o.status === "CANCELED" || o.status === "CANCELLED") {
        canceled++;
      }
    });

    setStats({
      todayOrders,
      delivered,
      pending,
      canceled,
      revenue,
      todayRevenue,
      totalOrders: allOrders.length,
    });
  }, [allOrders]);

  // Aggregation Logic for Charts
  const chartData = useMemo(() => {
    if (!allOrders.length) return [];

    const dataMap = {};
    const now = new Date();

    allOrders.forEach(o => {
      // Use createdAt as it's the valid field from backend
      const date = o.createdAt ? new Date(o.createdAt) : null;
      if (!date || isNaN(date.getTime())) return;

      let key;
      let sortKey; // Added for proper chronological sorting

      if (filterPeriod === "daily") {
        // Last 7 days
        const diffDays = (now - date) / (1000 * 60 * 60 * 24);
        if (diffDays > 7) return;
        key = date.toLocaleDateString('en-US', { weekday: 'short', day: 'numeric' });
        sortKey = date.toISOString(); // Use ISO string for precise date sorting
      } else if (filterPeriod === "weekly") {
        // Last 4 weeks
        const diffDays = (now - date) / (1000 * 60 * 60 * 24);
        if (diffDays > 28) return;
        const weekNumber = Math.ceil(date.getDate() / 7);
        key = `Week ${weekNumber} (${date.toLocaleDateString('en-US', { month: 'short' })})`;
        sortKey = `${date.getFullYear()}-${(date.getMonth() + 1).toString().padStart(2, '0')}-${weekNumber}`;
      } else {
        // Last 6 months
        const diffMonths = (now.getMonth() - date.getMonth() + (12 * (now.getFullYear() - date.getFullYear())));
        if (diffMonths > 6) return;
        key = date.toLocaleDateString('en-US', { month: 'short', year: '2-digit' });
        sortKey = `${date.getFullYear()}-${(date.getMonth() + 1).toString().padStart(2, '0')}`;
      }

      if (!dataMap[key]) {
        dataMap[key] = { label: key, orders: 0, revenue: 0, sortKey };
      }
      dataMap[key].orders++;
      if (o.status === "DELIVERED") {
        dataMap[key].revenue += (o.totalAmount || 0);
      }
    });

    // Sort chronologically by sortKey instead of arbitrary reversal
    return Object.values(dataMap).sort((a, b) => a.sortKey.localeCompare(b.sortKey));
  }, [allOrders, filterPeriod]);

  // Summary statistics for the horizontal bar graph
  const summaryData = useMemo(() => {
    const now = new Date();
    const todayDay = now.getDate();
    const todayMonth = now.getMonth();
    const todayYear = now.getFullYear();

    const filtered = allOrders.filter(o => {
      const date = o.createdAt ? new Date(o.createdAt) : null;
      if (!date || isNaN(date.getTime())) return false; 

      if (filterPeriod === "daily") {
        return date.getDate() === todayDay &&
          date.getMonth() === todayMonth &&
          date.getFullYear() === todayYear;
      } else if (filterPeriod === "weekly") {
        const diffDays = (now - date) / (1000 * 60 * 60 * 24);
        return diffDays <= 7;
      } else {
        const diffDays = (now - date) / (1000 * 60 * 60 * 24);
        return diffDays <= 30;
      }
    });

    const deliveredCount = filtered.filter(o => o.status === "DELIVERED").length;
    const canceledCount = filtered.filter(o => o.status === "CANCELED" || o.status === "REJECTED" || o.status === "CANCELLED").length;

    return [
      { name: "Total", value: filtered.length, color: "#D4AF37" }, // Gold
      { name: "Delivered", value: deliveredCount, color: "#2F855A" }, // Dark Green
      { name: "Cancelled", value: canceledCount, color: "#C53030" }  // Dark Red
    ];
  }, [allOrders, filterPeriod]);

  // Logic for Top Selling Items
  const topSellingData = useMemo(() => {
    if (!allOrders || allOrders.length === 0) return [];

    const itemCounts = {};
    allOrders.forEach(order => {
      if (order.status !== "CANCELLED" && order.status !== "REJECTED" && order.items) {
        order.items.forEach(item => {
          const name = item.itemName || "Unknown";
          itemCounts[name] = (itemCounts[name] || 0) + (item.quantity || 1);
        });
      }
    });

    return Object.entries(itemCounts)
      .map(([name, value]) => ({ name, value }))
      .sort((a, b) => b.value - a.value)
      .slice(0, 5); // Top 5 items
  }, [allOrders]);


  return (
    <>
      <Navbar />

      <div className="rd-container">
        {/* TOP STATS */}
        <div className="rd-stats mt-5">
          <div className="rd-card" onClick={() => navigate('/res/orders/today')} style={{ cursor: 'pointer' }}>
            <div className="rd-icon">🧾</div>
            <div>
              <h2>{stats.todayOrders}</h2>
              <p>Today Orders</p>
            </div>
          </div>

          <div className="rd-card" onClick={() => navigate('/res/orders/delivered')} style={{ cursor: 'pointer' }}>
            <div className="rd-icon">✅</div>
            <div>
              <h2>{stats.delivered}</h2>
              <p>Orders Delivered</p>
            </div>
          </div>

          <div className="rd-card" onClick={() => navigate('/res/orders/pending')} style={{ cursor: 'pointer' }}>
            <div className="rd-icon">🚚</div>
            <div>
              <h2>{stats.pending}</h2>
              <p>Orders Pending</p>
            </div>
          </div>

          <div className="rd-card" onClick={() => navigate('/res/order')} style={{ cursor: 'pointer' }}>
            <div className="rd-icon">🥡</div>
            <div>
              <h2>{stats.totalOrders}</h2>
              <p>Total Orders</p>
            </div>
          </div>

          <div className="rd-card" onClick={() => navigate('/res/revenue/today')} style={{ cursor: 'pointer' }}>
            <div className="rd-icon">₹</div>
            <div>
              <h2>{stats.todayRevenue.toFixed(2)}</h2>
              <p>Today Revenue</p>
            </div>
          </div>

          <div className="rd-card" onClick={() => navigate('/res/revenue')} style={{ cursor: 'pointer' }}>
            <div className="rd-icon">₹</div>
            <div>
              <h2>{stats.revenue.toFixed(2)}</h2>
              <p>Total Revenue</p>
            </div>
          </div>


        </div>

        {/* ANALYTICS SECTION */}
        <div className="rd-header-actions mb-3">
          <h4 className="fw-bold">Analytics Overview</h4>
          <div className="rd-filter-selection">
            <label htmlFor="periodFilter" className="me-2 text-muted small fw-bold">View By:</label>
            <select
              id="periodFilter"
              className="rd-dropdown"
              value={filterPeriod}
              onChange={(e) => setFilterPeriod(e.target.value)}
            >
              <option value="daily">Daily</option>
              <option value="weekly">Weekly</option>
              <option value="monthly">Monthly</option>
            </select>
          </div>
        </div>

        {/* MAIN GRID */}
        <div className="rd-main">

          {/* ORDERS SUMMARY CHART */}
          <div className="rd-box">
            <div className="rd-box-header mb-4">
              <h4>Order Summary</h4>
            </div>

            <div className="rd-chart-container">
              <ResponsiveContainer width="100%" height={300}>
                <BarChart
                  layout="vertical"
                  data={summaryData}
                  margin={{ top: 20, right: 60, left: 20, bottom: 5 }}
                >
                  <CartesianGrid strokeDasharray="3 3" horizontal={false} />
                  <XAxis type="number" stroke="#ccc" fontSize={12} />
                  <YAxis
                    dataKey="name"
                    type="category"
                    stroke="#333"
                    fontSize={13}
                    width={80}
                  />
                  <Tooltip cursor={{ fill: 'transparent' }} />
                  <Bar dataKey="value" barSize={35} radius={[0, 4, 4, 0]} label={{ position: 'right', fill: '#333', fontSize: 13, fontWeight: 'bold' }}>
                    {summaryData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* REVENUE CHART */}
          <div className="rd-box">
            <div className="rd-box-header mb-4">
              <h4>Revenue Trend</h4>
            </div>

            <div className="rd-chart-container">
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} />
                  <XAxis dataKey="label" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Line
                    type="monotone"
                    dataKey="revenue"
                    stroke="#D4AF37"
                    strokeWidth={3}
                    dot={{ r: 4, fill: '#D4AF37' }}
                    activeDot={{ r: 6 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* TOP SELLING ITEMS CHART */}
          <div className="rd-box">
            <div className="rd-box-header mb-4">
              <h4>Top Selling Items</h4>
            </div>

            <div className="rd-chart-container">
              {topSellingData.length > 0 ? (
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart
                    layout="vertical"
                    data={topSellingData}
                    margin={{ top: 20, right: 60, left: 20, bottom: 5 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" horizontal={false} />
                    <XAxis type="number" hide />
                    <YAxis
                      dataKey="name"
                      type="category"
                      stroke="#333"
                      fontSize={12}
                      width={100}
                    />
                    <Tooltip cursor={{ fill: 'transparent' }} />
                    <Bar dataKey="value" fill="#6366f1" barSize={25} radius={[0, 4, 4, 0]} label={{ position: 'right', fill: '#333', fontSize: 12, fontWeight: 'bold' }}>
                      {topSellingData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={`hsl(${230 + index * 20}, 70%, 60%)`} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              ) : (
                <div className="text-center py-5 text-muted">No sales data yet</div>
              )}
            </div>
          </div>

        </div>
      </div >
    </>
  );
}
