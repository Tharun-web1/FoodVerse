import React, { useEffect, useState } from "react";
import axios from "axios";
import "bootstrap/dist/css/bootstrap.min.css";
import { useNavigate } from "react-router-dom";
import "./Managerestaurants.css";
import {
  FiMapPin,
  FiStar,
  FiMail,
  FiPhone,
  FiFileText,
  FiTrash2,
  FiSearch,
  FiClock,
  FiCheckCircle,
  FiSlash,
  FiTarget,
  FiChevronLeft,
  FiChevronRight,
  FiShield,
  FiInfo,
  FiImage,
  FiXCircle
} from "react-icons/fi";
import { IoRestaurantOutline } from "react-icons/io5";
import { useToast } from "../../context/ToastContext";
import { API_BASE_URL } from "../../api/api";

export default function Managerestaurants() {
  const { showToast } = useToast();
  const [restaurants, setRestaurants] = useState([]);
  const [filteredRestaurants, setFilteredRestaurants] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");

  const [currentPage, setCurrentPage] = useState(0); // Backend starts at 0
  const [totalPages, setTotalPages] = useState(0);
  const [totalRestaurantsCount, setTotalRestaurantsCount] = useState(0);
  const pageSize = 10;

  // 🔹 VIEW MODAL STATES
  const [showViewModal, setShowViewModal] = useState(false);
  const [selectedRestaurant, setSelectedRestaurant] = useState(null);

  // 🔹 TAB: "restaurants" or "requests"
  const [activeTab, setActiveTab] = useState("restaurants");

  // 🔹 SUSPENSION MODAL STATES
  const [showSuspendModal, setShowSuspendModal] = useState(false);
  const [selectedSuspendId, setSelectedSuspendId] = useState(null);
  const [suspensionHours, setSuspensionHours] = useState(0); // 0 = indefinite

  // 🔹 REQUESTS STATE
  const [requests, setRequests] = useState([]);
  const [requestsLoading, setRequestsLoading] = useState(false);

  const navigate = useNavigate();

  // ─── FETCH ALL RESTAURANTS ───
  const fetchRestaurants = (pageNumber = 0, searchQuery = "", status = "ALL") => {
    const token = localStorage.getItem("token");

    let url = `${API_BASE_URL}/admin/restaurants?page=${pageNumber}&size=${pageSize}&search=${searchQuery}`;
    if (status === "ACTIVE") url += "&active=true";
    if (status === "INACTIVE") url += "&active=false";

    setLoading(true);
    axios
      .get(url, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })
      .then((res) => {
        setRestaurants(res.data.content || []);
        setFilteredRestaurants(res.data.content || []);
        setTotalPages(res.data.totalPages || 0);
        setTotalRestaurantsCount(res.data.totalElements || 0);
        setLoading(false);
      })
      .catch(() => {
        setError("Failed to load restaurants");
        setLoading(false);
      });
  };

  // ─── FETCH PENDING REQUESTS ───
  const fetchRequests = () => {
    const token = localStorage.getItem("token");
    setRequestsLoading(true);
    axios
      .get(`${API_BASE_URL}/admin/restaurants/requests`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      .then((res) => {
        setRequests(res.data);
        setRequestsLoading(false);
      })
      .catch(() => {
        setRequestsLoading(false);
      });
  };

  useEffect(() => {
    fetchRestaurants(currentPage, search, statusFilter);
    fetchRequests();
  }, [currentPage, statusFilter]);

  const handleSearch = (e) => {
    e.preventDefault();
    setCurrentPage(0);
    fetchRestaurants(0, search, statusFilter);
  };

  useEffect(() => {
    setFilteredRestaurants(restaurants);
  }, [restaurants]);

  // 🔹 ACTIVATE / DEACTIVATE FUNCTION
  const toggleStatus = (id, currentStatus, hours = null) => {
    const token = localStorage.getItem("token");

    // If currentStatus is true, we are SUSPENDING. If no hours provided and not release, show modal.
    if (currentStatus === true && hours === null) {
      setSelectedSuspendId(id);
      setShowSuspendModal(true);
      return;
    }

    let url = `${API_BASE_URL}/admin/restaurants/${id}/status?active=${!currentStatus}`;
    if (hours !== null && hours > 0) {
      url += `&hours=${hours}`;
    }

    axios
      .put(url, {}, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })
      .then((res) => {
        setRestaurants((prev) =>
          prev.map((r) =>
            r.id === id ? { ...r, active: res.data.active } : r
          )
        );
        showToast(currentStatus ? "Restaurant suspended" : "Restaurant released", "success");
        setShowSuspendModal(false);
        setSuspensionHours(0);
      })
      .catch(() => {
        showToast("Status update failed", "error");
      });
  };

  // 🔹 Delete restaurant
  const deleteRestaurant = (id) => {
    const token = localStorage.getItem("token");

    if (window.confirm("Are you sure you want to permanently delete this restaurant and all associated data?")) {
      axios
        .delete(`${API_BASE_URL}/admin/restaurants/${id}`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        })
        .then(() => {
          setRestaurants(restaurants.filter((r) => r.id !== id));
          setRequests(requests.filter((r) => r.id !== id));
          showToast("Restaurant deleted successfully", "success");
        })
        .catch(() => {
          showToast("Failed to delete restaurant", "error");
        });
    }
  };

  // 🔹 APPROVE RESTAURANT
  const approveRestaurant = (id) => {
    const token = localStorage.getItem("token");
    axios
      .put(`${API_BASE_URL}/admin/restaurants/${id}/approve`, {}, {
        headers: { Authorization: `Bearer ${token}` },
      })
      .then(() => {
        setRequests(requests.filter((r) => r.id !== id));
        fetchRestaurants(); // refresh main list
        showToast("Restaurant approved successfully", "success");
      })
      .catch(() => showToast("Failed to approve restaurant", "error"));
  };

  // 🔹 BLOCK RESTAURANT
  const blockRestaurant = (id) => {
    const token = localStorage.getItem("token");
    axios
      .put(`${API_BASE_URL}/admin/restaurants/${id}/block`, {}, {
        headers: { Authorization: `Bearer ${token}` },
      })
      .then(() => {
        setRequests(requests.filter((r) => r.id !== id));
        fetchRestaurants(); // refresh main list
        showToast("Restaurant blocked successfully", "success");
      })
      .catch(() => showToast("Failed to block restaurant", "error"));
  };

  // 🔹 View restaurant (open modal)
  const viewRestaurant = (restaurant) => {
    setSelectedRestaurant(restaurant);
    setShowViewModal(true);
  };

  return (
    <div className="container mt-5 restaurants-page">
      <div className="premium-card">
        <div className="d-flex flex-wrap justify-content-between align-items-center mb-5 gap-3">
          <div className="d-flex align-items-center gap-3 flex-wrap">
            <h2 className="mb-0">Restaurant Fleet</h2>
            <div className="d-flex gap-2">
              {requests.length > 0 && (
                <div className="header-metric-badge badge-pending">
                  <FiClock />
                  {requests.length} Requests
                </div>
              )}
            </div>
          </div>
          <div className="text-secondary small fw-700 bg-light px-3 py-2 rounded-pill">
            Total Partners: <span className="text-dark">{totalRestaurantsCount}</span>
          </div>
        </div>

        {/* TABS */}
        <ul className="nav nav-pills mb-5 gap-2" style={{ background: "#f8fafc", padding: "8px", borderRadius: "14px", width: "fit-content" }}>
          <li className="nav-item">
            <button
              className={`nav-link border-0 fw-700 px-4 py-2 ${activeTab === "restaurants" ? "active btn-primary-premium shadow-sm" : "text-secondary"}`}
              onClick={() => setActiveTab("restaurants")}
              style={{ borderRadius: "10px" }}
            >
              Verified Fleet
            </button>
          </li>
          <li className="nav-item">
            <button
              className={`nav-link border-0 fw-700 px-4 py-2 ${activeTab === "requests" ? "active btn-primary-premium shadow-sm" : "text-secondary"}`}
              onClick={() => setActiveTab("requests")}
              style={{ borderRadius: "10px" }}
            >
              Onboarding
              {requests.length > 0 && (
                <span className="badge bg-danger ms-2 rounded-pill" style={{ fontSize: '0.65rem' }}>{requests.length}</span>
              )}
            </button>
          </li>
        </ul>

        {activeTab === "restaurants" && (
          <>
            {/* SEARCH + FILTER */}
            <div className="row g-3 mb-4 align-items-center">
              <div className="col-lg-5 search-form-compact">
                <form className="d-flex" onSubmit={handleSearch}>
                  <div className="input-group">
                    <span className="input-group-text">
                      <FiSearch />
                    </span>
                    <input
                      className="form-control px-2 py-2"
                      placeholder="Search name, location or cuisine..."
                      value={search}
                      onChange={(e) => setSearch(e.target.value)}
                      style={{ borderRadius: "0 12px 12px 0" }}
                    />
                  </div>
                </form>
              </div>

              <div className="col-lg-3">
                <select
                  className="form-select px-3 py-2 border-2 fw-700 rounded-4"
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  style={{ color: '#475569' }}
                >
                  <option value="ALL">All Status</option>
                  <option value="ACTIVE">⚡ Active Only</option>
                  <option value="INACTIVE">💤 Inactive Only</option>
                </select>
              </div>
            </div>

            {/* TABLE */}
            {loading && <div className="text-center py-5"><div className="spinner-border text-primary"></div></div>}
            {error && <div className="alert alert-danger">{error}</div>}

            {!loading && filteredRestaurants.length === 0 && (
              <div className="text-center py-5 border rounded-4 bg-light">
                <FiSlash size={40} className="text-muted mb-3" />
                <p className="text-muted fw-800">No restaurants matching your criteria.</p>
              </div>
            )}

            {!loading && filteredRestaurants.length > 0 && (
              <div className="table-responsive">
                <table className="table align-middle">
                  <thead>
                    <tr>
                      <th>Restaurant</th>
                      <th>Contact & Info</th>
                      <th>Performance</th>
                      <th>Status</th>
                      <th className="text-end">Management</th>
                    </tr>
                  </thead>

                  <tbody>
                    {filteredRestaurants.map((r, index) => (
                      <tr key={r.id} className="reveal-item" style={{ animationDelay: `${index * 0.05}s` }}>
                        <td>
                          <div className="d-flex align-items-center gap-3">
                            <div className="restaurant-thumb-box">
                              <IoRestaurantOutline />
                            </div>
                            <div>
                              <div className="fw-800 text-dark mb-0">{r.name}</div>
                              <div className="text-muted extra-small d-flex align-items-center gap-1">
                                <FiMapPin />{r.location}
                              </div>
                            </div>
                          </div>
                        </td>
                        <td>
                          <div>
                            <span className="badge-cuisine-tag">{r.r_cuisine?.split(',')[0]}</span>
                            <div className="extra-small mt-1 text-secondary fw-700 d-flex align-items-center gap-1">
                              <FiMail className="opacity-50" />{r.mail}
                            </div>
                          </div>
                        </td>
                        <td>
                          <div className="rating-pill-static">
                            <FiStar />
                            {r.rating || "0.0"}
                          </div>
                          <div className="extra-small text-muted mt-1 fw-700">{r.review || 0} reviews</div>
                        </td>
                        <td>
                          <span className={`status-pill ${r.active ? 'active' : 'inactive'}`}>
                            {r.active ? "● Live Now" : "○ Hibernating"}
                          </span>
                        </td>
                        <td className="text-end">
                          <div className="d-flex justify-content-end gap-2">
                            <button className="btn-icon-manage" onClick={() => viewRestaurant(r)} title="Review Intelligence">
                              <FiFileText />
                            </button>
                            <button
                              className={`btn-status-toggle ${r.active ? 'suspend' : 'activate'}`}
                              onClick={() => toggleStatus(r.id, r.active)}
                            >
                              {r.active ? "Suspend" : "Release"}
                            </button>
                            <button className="btn-delete-icon" onClick={() => deleteRestaurant(r.id)} title="Purge Records">
                              <FiTrash2 />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            {/* PAGINATION */}
            {totalPages >= 1 && (
              <div className="d-flex flex-column flex-md-row justify-content-between align-items-center mt-5 gap-3">
                <div className="text-secondary small fw-700">
                  Displaying {restaurants.length} of {totalRestaurantsCount} partners
                </div>
                <nav>
                  <ul className="pagination mb-0 gap-1">
                    <li className={`page-item ${currentPage === 0 ? "disabled" : ""}`}>
                      <button className="page-link shadow-none rounded-3" onClick={() => setCurrentPage(currentPage - 1)}>
                        <FiChevronLeft />
                      </button>
                    </li>
                    {[...Array(totalPages)].map((_, i) => (
                      <li key={i} className={`page-item ${currentPage === i ? "active" : ""}`}>
                        <button className="page-link shadow-none rounded-3" onClick={() => setCurrentPage(i)}>{i + 1}</button>
                      </li>
                    ))}
                    <li className={`page-item ${currentPage === totalPages - 1 ? "disabled" : ""}`}>
                      <button className="page-link shadow-none rounded-3" onClick={() => setCurrentPage(currentPage + 1)}>
                        <FiChevronRight />
                      </button>
                    </li>
                  </ul>
                </nav>
              </div>
            )}
          </>
        )}

        {/* REQUESTS TAB */}
        {activeTab === "requests" && (
          <div className="mt-2">
            {requestsLoading && <div className="text-center py-5"><div className="spinner-border text-primary"></div></div>}

            {!requestsLoading && requests.length === 0 && (
              <div className="alert alert-light border-2 text-center py-5 rounded-4">
                <FiCheckCircle size={40} className="text-success mb-3 opacity-25" />
                <h5 className="fw-800 text-secondary">Queue is Empty</h5>
                <p className="text-muted mb-0">No pending restaurant onboarding requests.</p>
              </div>
            )}

            {!requestsLoading && requests.length > 0 && (
              <div className="table-responsive">
                <table className="table align-middle">
                  <thead>
                    <tr>
                      <th>Request Details</th>
                      <th>Location</th>
                      <th>Role</th>
                      <th className="text-end">Onboarding Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {requests.map((r, index) => (
                      <tr key={r.id} className="reveal-item" style={{ animationDelay: `${index * 0.05}s` }}>
                        <td>
                          <div className="fw-800 text-dark">{r.name}</div>
                          <small className="text-muted fw-600">By @{r.username}</small>
                        </td>
                        <td className="fw-700 text-secondary d-flex align-items-center gap-1">
                          <FiMapPin />{r.location}
                        </td>
                        <td>
                          <span className="badge bg-light text-primary border border-primary border-opacity-25 px-3 py-2 rounded-pill fw-700">
                            {r.role}
                          </span>
                        </td>
                        <td className="text-end">
                          <div className="d-flex justify-content-end gap-2">
                            <button className="btn btn-outline-info btn-sm px-3 rounded-pill fw-700" onClick={() => viewRestaurant(r)}>Review</button>
                            <button className="btn btn-primary-premium btn-sm px-3 rounded-pill fw-700 shadow-sm" onClick={() => approveRestaurant(r.id)}>Approve</button>
                            <button className="btn btn-outline-warning btn-sm px-3 rounded-pill fw-700" onClick={() => blockRestaurant(r.id)}>Reject</button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {/* VIEW MODAL (Redesigned) */}
        {showViewModal && (
          <>
            <div className="modal-backdrop fade show" onClick={() => setShowViewModal(false)}></div>
            <div className="modal fade show d-block" tabIndex="-1">
              <div className="modal-dialog modal-dialog-centered modal-lg">
                <div className="modal-content overflow-hidden border-0 shadow-lg" style={{ borderRadius: '28px' }}>
                  <div className="modal-header border-0 p-4 pb-0">
                    <h4 className="modal-title fw-800">Partner Intelligence</h4>
                    <button className="btn-close shadow-none" onClick={() => setShowViewModal(false)}></button>
                  </div>
                  <div className="modal-body p-4" style={{ backgroundColor: '#fcfdfe' }}>
                    {selectedRestaurant && (
                      <div className="row g-4">
                        {/* Left: General Info & Owner */}
                        <div className="col-md-6">
                          <div className="premium-compact-card h-100 shadow-sm">
                            <h6 className="text-primary fw-800 text-uppercase small mb-4 d-flex align-items-center gap-2">
                              <FiInfo />Core Information
                            </h6>
                            <div className="mb-4">
                              <label className="text-muted extra-small d-block text-uppercase fw-800 mb-1">Store Name</label>
                              <span className="fw-800 fs-5 text-dark">{selectedRestaurant.name}</span>
                            </div>

                            <div className="row mb-4">
                              <div className="col-6">
                                <label className="text-muted extra-small d-block text-uppercase fw-800 mb-1">Owner Name</label>
                                <span className="fw-700">{selectedRestaurant.r_fName} {selectedRestaurant.r_lName}</span>
                              </div>
                              <div className="col-6">
                                <label className="text-muted extra-small d-block text-uppercase fw-800 mb-1">Handle</label>
                                <span className="fw-700 text-primary">@{selectedRestaurant.username}</span>
                              </div>
                            </div>

                            <div className="mb-4">
                              <label className="text-muted extra-small d-block text-uppercase fw-800 mb-1">Zone Mapping</label>
                              <div className="d-flex align-items-center gap-2">
                                <span className="fw-800 text-dark d-flex align-items-center gap-1"><FiMapPin className="text-danger" />{selectedRestaurant.location}</span>
                                <span className="badge bg-light text-secondary border rounded-pill px-3">{selectedRestaurant.r_zone || 'Central'}</span>
                              </div>
                            </div>

                            <div className="mb-4">
                              <label className="text-muted extra-small d-block text-uppercase fw-800 mb-1">Cuisine & Tags</label>
                              <span className="badge-cuisine fs-6">{selectedRestaurant.r_cuisine}</span>
                            </div>

                            <div className="mb-0">
                              <label className="text-muted extra-small d-block text-uppercase fw-800 mb-1">Description</label>
                              <p className="small text-secondary mb-0 fw-600" style={{ fontStyle: 'italic', lineHeight: '1.6' }}>
                                {selectedRestaurant.description || 'No description provided.'}
                              </p>
                            </div>
                          </div>
                        </div>

                        {/* Right: Legal & Compliance */}
                        <div className="col-md-6">
                          <div className="premium-compact-card h-100 shadow-sm">
                            <h6 className="text-primary fw-800 text-uppercase small mb-4 d-flex align-items-center gap-2">
                              <FiShield />Compliance Profile
                            </h6>

                            <div className="card bg-light border-0 mb-3 px-3 py-3 rounded-4 shadow-none">
                              <div className="d-flex justify-content-between align-items-center">
                                <div>
                                  <label className="text-muted extra-small d-block text-uppercase fw-800 mb-1">TIN Identification</label>
                                  <span className="fw-800 text-dark">{selectedRestaurant.r_tin || 'N/A'}</span>
                                </div>
                                <div className="text-end">
                                  <label className="text-muted extra-small d-block text-uppercase fw-800 mb-1">Exp Date</label>
                                  <span className="small fw-700 text-secondary">{selectedRestaurant.r_exp || 'N/A'}</span>
                                </div>
                              </div>
                            </div>

                            <div className="card bg-light border-0 mb-4 px-3 py-3 rounded-4 shadow-none">
                              <div className="d-flex justify-content-between align-items-center">
                                <div>
                                  <label className="text-muted extra-small d-block text-uppercase fw-800 mb-1">Licence Registration</label>
                                  <span className="fw-800 text-dark">{selectedRestaurant.r_llNo || 'N/A'}</span>
                                </div>
                                <div className="text-end">
                                  <label className="text-muted extra-small d-block text-uppercase fw-800 mb-1">Exp Date</label>
                                  <span className="small fw-700 text-secondary">{selectedRestaurant.r_llExp || 'N/A'}</span>
                                </div>
                              </div>
                            </div>

                            <h6 className="text-primary fw-800 text-uppercase extra-small mb-3">Verification Artifacts</h6>
                            <div className="d-flex flex-column gap-2">
                              <a
                                href={`http://localhost:8083/restaurants/tindoc/${selectedRestaurant.id}`}
                                target="_blank"
                                rel="noreferrer"
                                className="btn btn-light text-primary fw-800 py-2 border-0 rounded-3 d-flex align-items-center justify-content-center gap-2"
                              >
                                <FiFileText /> View TIN Document
                              </a>
                              <a
                                href={`http://localhost:8083/restaurants/licencedoc/${selectedRestaurant.id}`}
                                target="_blank"
                                rel="noreferrer"
                                className="btn btn-light text-primary fw-800 py-2 border-0 rounded-3 d-flex align-items-center justify-content-center gap-2"
                              >
                                <FiShield /> View Licence Registry
                              </a>
                              <a
                                href={`http://localhost:8083/restaurants/${selectedRestaurant.id}/image`}
                                target="_blank"
                                rel="noreferrer"
                                className="btn btn-light text-secondary fw-800 py-2 border-0 rounded-3 d-flex align-items-center justify-content-center gap-2"
                              >
                                <FiImage /> Inspect Store Logo
                              </a>
                            </div>
                          </div>
                        </div>

                        {/* Bottom: Contact & Performance */}
                        <div className="col-12">
                          <div className="bg-white border rounded-4 p-4 shadow-sm">
                            <div className="row g-4 align-items-center">
                              <div className="col-md-4 border-md-end">
                                <label className="text-muted extra-small d-block text-uppercase fw-800 mb-2">Communication Hub</label>
                                <div className="small fw-800 text-dark mb-2 d-flex align-items-center gap-2"><FiMail className="text-primary" />{selectedRestaurant.mail}</div>
                                <div className="small fw-800 text-dark mb-3 d-flex align-items-center gap-2"><FiPhone className="text-primary" />{selectedRestaurant.phnno}</div>

                                <div className="d-flex gap-3 border-top pt-3">
                                  <div>
                                    <label className="text-muted extra-small d-block text-uppercase fw-800">Delivery Time</label>
                                    <span className="small fw-800">{selectedRestaurant.r_min} - {selectedRestaurant.r_max} Mints</span>
                                  </div>
                                  <div className="ms-auto text-end">
                                    <label className="text-muted extra-small d-block text-uppercase fw-800">Coordinates</label>
                                    <span className="extra-small fw-700 text-secondary">{selectedRestaurant.r_lat}, {selectedRestaurant.r_lon}</span>
                                  </div>
                                </div>
                              </div>
                              <div className="col-md-4 border-md-end px-md-4">
                                <label className="text-muted extra-small d-block text-uppercase fw-800 mb-2">Performance Analytics</label>
                                <div className="d-flex align-items-center gap-3">
                                  <div className="h3 mb-0 fw-800 text-warning">{selectedRestaurant.rating || '0.0'}</div>
                                  <div className="small text-muted fw-700">Accumulated Score <br /> ({selectedRestaurant.review || 0} reviews)</div>
                                </div>
                              </div>
                              <div className="col-md-4 px-md-4">
                                <label className="text-muted extra-small d-block text-uppercase fw-800 mb-2">Operational Integrity</label>
                                <div className="d-flex flex-column gap-2">
                                  <span className={`badge ${selectedRestaurant.status === 'APPROVED' ? 'bg-success' : selectedRestaurant.status === 'BLOCKED' ? 'bg-danger' : 'bg-warning'} px-3 py-2 rounded-pill fw-800`}>
                                    {selectedRestaurant.status}
                                  </span>
                                  <span className={`badge ${selectedRestaurant.active ? 'bg-info' : 'bg-secondary'} px-3 py-2 rounded-pill fw-800`}>
                                    {selectedRestaurant.active ? 'NETWORK: LIVE' : 'NETWORK: STANDBY'}
                                  </span>
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                  <div className="modal-footer border-0 p-4 pt-2">
                    <button className="btn btn-light px-4 py-2 fw-800 rounded-pill" onClick={() => setShowViewModal(false)}>Close Dossier</button>
                    {selectedRestaurant?.status === 'PENDING' && (
                      <button className="btn btn-primary-premium px-5 py-2 fw-800 rounded-pill shadow" onClick={() => approveRestaurant(selectedRestaurant.id)}>Approve Engagement</button>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </>
        )}

        {/* 🔹 SUSPENSION MODAL */}
        {showSuspendModal && (
          <>
            <div className="modal-backdrop fade show" onClick={() => setShowSuspendModal(false)}></div>
            <div className="modal fade show d-block" tabIndex="-1">
              <div className="modal-dialog modal-dialog-centered">
                <div className="modal-content overflow-hidden border-0 shadow-lg" style={{ borderRadius: '28px' }}>
                  <div className="modal-header border-0 p-4 pb-0">
                    <h4 className="modal-title fw-800 d-flex align-items-center gap-2">
                      <FiSlash className="text-danger" /> Suspend Partner
                    </h4>
                    <button className="btn-close shadow-none" onClick={() => setShowSuspendModal(false)}></button>
                  </div>
                  <div className="modal-body p-4">
                    <p className="text-secondary fw-600 mb-4">
                      Choose the duration for this suspension. The restaurant will be automatically released after the selected period.
                    </p>
                    <div className="d-grid gap-2">
                      <button
                        className={`btn py-3 rounded-4 fw-800 ${suspensionHours === 0 ? 'btn-primary-premium shadow-sm' : 'btn-light text-dark border'}`}
                        onClick={() => setSuspensionHours(0)}
                      >
                        Indefinite / Manual Release
                      </button>
                      <button
                        className={`btn py-3 rounded-4 fw-800 ${suspensionHours === 1 ? 'btn-primary-premium shadow-sm' : 'btn-light text-dark border'}`}
                        onClick={() => setSuspensionHours(1)}
                      >
                        Suspend for 1 Hour
                      </button>
                      <button
                        className={`btn py-3 rounded-4 fw-800 ${suspensionHours === 4 ? 'btn-primary-premium shadow-sm' : 'btn-light text-dark border'}`}
                        onClick={() => setSuspensionHours(4)}
                      >
                        Suspend for 4 Hours
                      </button>
                      <button
                        className={`btn py-3 rounded-4 fw-800 ${suspensionHours === 24 ? 'btn-primary-premium shadow-sm' : 'btn-light text-dark border'}`}
                        onClick={() => setSuspensionHours(24)}
                      >
                        Suspend for 24 Hours
                      </button>
                    </div>
                  </div>
                  <div className="modal-footer border-0 p-4 pt-2">
                    <button className="btn btn-light px-4 py-2 fw-800 rounded-pill" onClick={() => setShowSuspendModal(false)}>Cancel</button>
                    <button
                      className="btn btn-danger px-5 py-2 fw-800 rounded-pill shadow"
                      onClick={() => toggleStatus(selectedSuspendId, true, suspensionHours)}
                    >
                      Confirm Suspension
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
