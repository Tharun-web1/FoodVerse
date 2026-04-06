import React, { useEffect, useState } from "react";
import { Link, Outlet, useNavigate, useLocation } from "react-router-dom";
import "bootstrap/dist/css/bootstrap.min.css";
import "./AdminDashBoard.css";
import axios from "axios";
import { API_BASE_URL } from "../../api/api";

// 📊 CHART IMPORTS
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { 
  FiPieChart, 
  FiUsers, 
  FiShoppingBag, 
  FiStar, 
  FiBriefcase, 
  FiLogOut,
  FiTruck,
  FiShield,
  FiTag
} from "react-icons/fi";
import { IoRestaurantOutline } from "react-icons/io5";

export default function AdminDashboard() {
  const navigate = useNavigate();
  const location = useLocation();

  const [showSidebar, setShowSidebar] = useState(false);
  const [filter, setFilter] = useState("7days");

  // 🔹 LIVE STATS FROM API
  const [stats, setStats] = useState({
    totalUsers: 0,
    activeUsers: 0,
    totalRiders: 0,
    activeRiders: 0,
    totalRestaurants: 0,
    activeRestaurants: 0,
    inactiveRestaurants: 0,
    totalOrders: 0,
    totalRevenue: 0,
  });

  const [revenueData, setRevenueData] = useState([]);
  const [activities, setActivities] = useState([]);
  const [loadingAnalytics, setLoadingAnalytics] = useState(true);

  const handleLogout = () => {
    localStorage.clear();
    navigate("/login/user", { replace: true });
  };

  const isDashboard = location.pathname === "/admin";

  // 🔹 FETCH LIVE STATS & ANALYTICS
  useEffect(() => {
    const token = localStorage.getItem("token");

    // Stats
    axios
      .get(`${API_BASE_URL}/admin/stats`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      .then((res) => {
        console.log("Admin Stats Response:", res.data);
        setStats(res.data);
      })
      .catch((err) => console.error("Failed to fetch admin stats:", err));

    // Revenue Analytics
    setLoadingAnalytics(true);
    axios
      .get(`${API_BASE_URL}/admin/analytics/revenue`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      .then((res) => {
        const formattedData = res.data.reverse().map(item => ({
          label: new Date(item.date).toLocaleDateString(undefined, { month: 'short', day: 'numeric' }),
          count: item.amount
        }));
        setRevenueData(formattedData);
        setLoadingAnalytics(false);
      })
      .catch((err) => {
        console.error("Failed to fetch analytics:", err);
        setLoadingAnalytics(false);
      });

    // Recent Activities
    axios
      .get(`${API_BASE_URL}/admin/recent-activity`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      .then((res) => setActivities(res.data))
      .catch((err) => console.error("Recent activity fetch failed:", err));
  }, []);

  return (
    <div className="admin-wrapper">
      {/* MOBILE HEADER */}
      <div className="d-md-none admin-header">
        <span className="admin-title">Admin Panel</span>
        <button
          className="menu-btn"
          onClick={() => setShowSidebar(!showSidebar)}
        >
          ☰
        </button>
      </div>

      {/* LAYOUT */}
      <div className="admin-layout d-flex">
        {/* SIDEBAR */}
        <nav className={`admin-sidebar ${showSidebar ? "show" : ""}`}>
          <div className="sidebar-brand-box">
            <div className="brand-logo-pill">
              <FiShield />
            </div>
            <h4 className="sidebar-title d-none d-md-block">Admin Panel</h4>
          </div>

          <ul className="nav flex-column mt-4 px-1">
            <li className="nav-item">
              <Link className={`nav-link ${location.pathname === "/admin" || location.pathname === "/admin/" ? "active" : ""}`} to="">
                <span><FiPieChart /></span> <span className="nav-text">Dashboard</span>
              </Link>
            </li>
            <li className="nav-item">
              <Link className={`nav-link ${location.pathname === "/admin/users" ? "active" : ""}`} to="users">
                <span><FiUsers /></span> <span className="nav-text">Manage Users</span>
              </Link>
            </li>
            <li className="nav-item">
              <Link className={`nav-link ${location.pathname === "/admin/restaurants" ? "active" : ""}`} to="restaurants">
                <span><IoRestaurantOutline /></span> <span className="nav-text">Restaurants</span>
              </Link>
            </li>
            <li className="nav-item">
              <Link className={`nav-link ${location.pathname === "/admin/riders" ? "active" : ""}`} to="riders">
                <span><FiTruck /></span> <span className="nav-text">Riders</span>
              </Link>
            </li>
            <li className="nav-item">
              <Link className={`nav-link ${location.pathname === "/admin/payments" ? "active" : ""}`} to="payments">
                <span><FiShoppingBag /></span> <span className="nav-text">Payments</span>
              </Link>
            </li>
            <li className="nav-item">
              <Link className={`nav-link ${location.pathname === "/admin/reviews" ? "active" : ""}`} to="reviews">
                <span><FiStar /></span> <span className="nav-text">Reviews</span>
              </Link>
            </li>
            <li className="nav-item">
              <Link className={`nav-link ${location.pathname === "/admin/admins" ? "active" : ""}`} to="admins">
                <span><FiShield /></span> <span className="nav-text">Manage Admins</span>
              </Link>
            </li>
            <li className="nav-item">
              <Link className={`nav-link ${location.pathname === "/admin/coupons" ? "active" : ""}`} to="coupons">
                <span><FiTag /></span> <span className="nav-text">Manage Coupons</span>
              </Link>
            </li>
            <li className="nav-item logout-container">
              <button className="nav-link logout-btn w-100 border-0" onClick={handleLogout}>
                <span><FiLogOut /></span> <span className="nav-text">Logout</span>
              </button>
            </li>
          </ul>
        </nav>

        {/* MAIN CONTENT */}
        <main className="admin-content flex-fill p-4">
          {isDashboard ? (
            <>
              <div className="d-flex justify-content-between align-items-center mb-4">
                <h2 className="mb-0">Admin Dashboard</h2>
                <div className="d-flex align-items-center gap-2 glass-badge py-2">
                  <span className="live-dot pulse"></span>
                  <span className="small fw-800">SYSTEM LIVE</span>
                </div>
              </div>

              {/* 🔹 STAT CARDS — LIVE FROM API */}
              <div className="row g-3">
                <div className="col-lg-2 col-md-4 col-sm-6 mb-3">
                  <div className="stat-card reveal-item" onClick={() => navigate("users")}>
                    <div className="stat-header d-flex justify-content-between">
                      <p>Active Users</p>
                      <span className="stat-icon user-bg"><FiUsers /></span>
                    </div>
                    <h3>{stats.activeUsers}</h3>
                    <div className="d-flex gap-2 mt-2">
                      <small className="text-secondary fw-bold">{stats.totalUsers} Total</small>
                    </div>
                  </div>
                </div>

                <div className="col-lg-2 col-md-4 col-sm-6 mb-3">
                  <div className="stat-card reveal-item" style={{ animationDelay: '0.1s' }} onClick={() => navigate("riders")}>
                    <div className="stat-header d-flex justify-content-between">
                      <p>Active Riders</p>
                      <span className="stat-icon rider-bg"><FiTruck /></span>
                    </div>
                    <h3>{stats.activeRiders}</h3>
                    <div className="d-flex gap-2 mt-2">
                      <small className="text-secondary fw-bold">{stats.totalRiders} Total</small>
                    </div>
                  </div>
                </div>

                <div className="col-lg-3 col-md-4 col-sm-6 mb-3">
                  <div className="stat-card reveal-item" style={{ animationDelay: '0.2s' }} onClick={() => navigate("restaurants")}>
                    <div className="stat-header d-flex justify-content-between">
                      <p>Restaurants</p>
                      <span className="stat-icon res-bg"><IoRestaurantOutline /></span>
                    </div>
                    <h3>{stats.totalRestaurants}</h3>
                    <div className="d-flex gap-2 mt-2">
                      <small className="text-success fw-bold">{stats.activeRestaurants} Live</small>
                      <small className="text-muted">/</small>
                      <small className="text-danger fw-bold">{stats.inactiveRestaurants} Off</small>
                    </div>
                  </div>
                </div>

                <div className="col-lg-2 col-md-4 col-sm-6 mb-3">
                  <div className="stat-card reveal-item" style={{ animationDelay: '0.3s' }} onClick={() => navigate("payments")}>
                    <div className="stat-header d-flex justify-content-between">
                      <p>New Orders</p>
                      <span className="stat-icon order-bg"><FiShoppingBag /></span>
                    </div>
                    <h3>{stats.totalOrders}</h3>
                  </div>
                </div>

                <div className="col-lg-3 col-md-4 col-sm-6 mb-3">
                  <div className="stat-card reveal-item highlight-card" style={{ animationDelay: '0.4s' }}>
                    <div className="stat-header d-flex justify-content-between">
                      <p className="text-white opacity-75">Net Revenue</p>
                      <span className="stat-icon revenue-bg"><FiBriefcase /></span>
                    </div>
                    <h3 className="text-white">₹{stats.totalRevenue.toLocaleString("en-IN")}</h3>
                    <div className="stat-trend text-white opacity-75">Based on 30 day cycle</div>
                  </div>
                </div>
              </div>


              {/* 📊 GRAPH & ACTIVITY FEED */}
              <div className="row">
                <div className="col-lg-8">
                  <div className="table-container mb-4">
                    <div className="graph-header">
                      <h5 className="mb-0">
                        {loadingAnalytics ? "Loading Analytics..." : "Revenue Growth (Last 30 Days)"}
                      </h5>
                    </div>

                    <ResponsiveContainer width="100%" height={320}>
                      {loadingAnalytics ? (
                        <div className="d-flex align-items-center justify-content-center h-100">
                          <div className="spinner-border text-primary"></div>
                        </div>
                      ) : (
                        <LineChart data={revenueData}>
                      <CartesianGrid strokeDasharray="4 4" stroke="#f1f5f9" vertical={false} />
                      <XAxis 
                        dataKey="label" 
                        stroke="#94a3b8" 
                        fontSize={12} 
                        tickLine={false} 
                        axisLine={false} 
                        dy={10}
                      />
                      <YAxis 
                        stroke="#94a3b8" 
                        fontSize={12} 
                        tickLine={false} 
                        axisLine={false} 
                        tickFormatter={(value) => `₹${value}`}
                      />
                      <Tooltip
                        contentStyle={{ 
                          backgroundColor: "#ffffff", 
                          border: "none", 
                          borderRadius: "12px", 
                          boxShadow: "0 10px 15px -3px rgba(0, 0, 0, 0.1)" 
                        }}
                        itemStyle={{ color: "#f97316", fontWeight: "800" }}
                        cursor={{ stroke: '#f1f5f9', strokeWidth: 2 }}
                      />
                      <Line
                        type="monotone"
                        dataKey="count"
                        name="Revenue"
                        stroke="#f97316"
                        strokeWidth={4}
                        dot={{ r: 4, fill: "#ffffff", stroke: "#f97316", strokeWidth: 2 }}
                        activeDot={{ r: 6, fill: "#f97316", stroke: "#ffffff", strokeWidth: 2 }}
                        animationDuration={1500}
                      />
                        </LineChart>
                      )}
                    </ResponsiveContainer>
                  </div>
                </div>

                {/* 🔹 RECENT ACTIVITY FEED */}
                <div className="col-lg-4">
                  <div className="table-container activity-feed-card">
                    <h5 className="mb-4">Recent Activity</h5>
                    <div className="activity-list">
                      {activities.length > 0 ? (
                        activities.map((act, idx) => (
                          <div key={idx} className="activity-item d-flex gap-3 mb-4">
                            <div className={`activity-icon-box ${act.type.toLowerCase()}`}>
                              {act.type === 'USER' && <FiUsers />}
                              {act.type === 'RESTAURANT' && <IoRestaurantOutline />}
                              {act.type === 'ORDER' && <FiShoppingBag />}
                            </div>
                            <div className="activity-details">
                              <div className="fw-700 text-dark small">{act.title}</div>
                              <div className="text-muted extra-small">{act.subtitle}</div>
                              <div className="text-secondary extra-small mt-1 opacity-75">{act.time}</div>
                            </div>
                          </div>
                        ))
                      ) : (
                        <div className="text-center py-5 text-muted">No recent events.</div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </>
          ) : (
            <Outlet />
          )}
        </main>
      </div>
    </div>
  );
}
