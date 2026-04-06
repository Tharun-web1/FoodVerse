import React, { useEffect, useState } from "react";
import axios from "axios";
import "./Userdetails.css";
import { FiUser, FiMail, FiPhone, FiCheckCircle, FiSlash, FiChevronLeft, FiChevronRight } from "react-icons/fi";
import { useToast } from "../../context/ToastContext";
import { API_BASE_URL } from "../../api/api";

export default function Userdetails() {
  const { showToast } = useToast();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [currentPage, setCurrentPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);

  const [showBlockModal, setShowBlockModal] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [blockDates, setBlockDates] = useState({ 
    from: new Date().toISOString().slice(0, 16), 
    until: new Date(Date.now() + 86400000).toISOString().slice(0, 16) 
  });

  const fetchUsers = (pageNumber = 0) => {
    const token = localStorage.getItem("token");
    setLoading(true);
    axios
      .get(`${API_BASE_URL}/admin/users?page=${pageNumber}&size=10`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })
      .then((res) => {
        setUsers(res.data.content || []);
        setTotalPages(res.data.totalPages || 0);
        setLoading(false);
      })
      .catch((err) => {
        console.error("Error fetching users:", err);
        setError("Failed to load community data.");
        setLoading(false);
      });
  };

  useEffect(() => {
    fetchUsers(currentPage);
  }, [currentPage]);

  const handleBlockConfirm = () => {
    const token = localStorage.getItem("token");
    axios
      .put(
        `${API_BASE_URL}/admin/users/block/${selectedUser.id}`,
        {},
        {
          headers: { Authorization: `Bearer ${token}` },
          params: { 
            from: blockDates.from, 
            until: blockDates.until 
          }
        }
      )
      .then((res) => {
        setUsers((prev) =>
          prev.map((u) => (u.id === selectedUser.id ? res.data : u))
        );
        setShowBlockModal(false);
        showToast("User restricted successfully", "success");
      })
      .catch((err) => {
        console.error("Block error:", err);
        showToast("Block failed. Try again.", "error");
      });
  };

  const toggleStatus = (id, currentStatus) => {
    const token = localStorage.getItem("token");
    
    if (currentStatus) {
        setSelectedUser(users.find(u => u.id === id));
        setShowBlockModal(true);
        return;
    }

    axios
      .put(
        `${API_BASE_URL}/admin/users/approve/${id}`,
        {},
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      )
      .then((res) => {
        setUsers((prev) =>
          prev.map((user) =>
            user.id === id ? res.data : user
          )
        );
        showToast("Access restored successfully", "success");
      })
      .catch((err) => {
        console.error("Status update error:", err);
        showToast("Operation failed. Try again.", "error");
      });
  };

  return (
    <div className="container mt-5 userdetails-page">
      <div className="premium-card">
        <div className="d-flex justify-content-between align-items-center mb-5">
          <div>
            <h2 className="mb-1">User Management</h2>
            <p className="text-muted small mb-0">Oversee community verification and access control.</p>
          </div>
          <div className="status-pill active px-4 py-2">
            <FiCheckCircle /> Verified Members: <span className="ms-2"> {users.filter(u => u.active).length}</span>
          </div>
        </div>

        {error && <div className="alert alert-danger rounded-4">{error}</div>}

        {loading ? (
          <div className="text-center py-5">
            <div className="spinner-border text-primary mb-3"></div>
            <p className="text-muted fw-800">Syncing user records...</p>
          </div>
        ) : (
          <div className="table-responsive">
            <table className="table align-middle">
              <thead>
                <tr>
                  <th>Identity</th>
                  <th>Member</th>
                  <th>Contact Email</th>
                  <th>Connection</th>
                  <th>Status</th>
                  <th className="text-end">Management</th>
                </tr>
              </thead>
              <tbody>
                {users.length > 0 ? users.map((user, index) => (
                  <tr key={user.id} className="reveal-item" style={{ animationDelay: `${index * 0.05}s` }}>
                    <td>
                      <span className="id-badge">#{user.id}</span>
                    </td>
                    <td>
                      <div className="d-flex align-items-center gap-3">
                        <div className="avatar-mini bg-light-soft text-primary"><FiUser /></div>
                        <div className="fw-800 text-dark">{user.username}</div>
                      </div>
                    </td>
                    <td>
                      <div className="d-flex align-items-center gap-2 small fw-600 text-secondary">
                        <FiMail className="opacity-50" /> {user.mail}
                      </div>
                    </td>
                    <td>
                      <div className="d-flex align-items-center gap-2 small fw-600 text-secondary">
                        <FiPhone className="opacity-50" /> {user.phnno}
                      </div>
                    </td>
                    <td>
                      <span className={`status-pill ${user.active ? 'active' : 'inactive'}`}>
                        {user.active ? <><FiCheckCircle /> Verified</> : <><FiSlash /> Suspended</>}
                      </span>
                    </td>
                    <td className="text-end">
                      <button
                        className={`btn-status-toggle ${user.active ? 'suspend' : 'activate'}`}
                        onClick={() => toggleStatus(user.id, user.active)}
                      >
                        {user.active ? "Restrict Access" : "Restore Access"}
                      </button>
                    </td>
                  </tr>
                )) : (
                  <tr><td colSpan="6" className="text-center py-5 text-muted">No community members found.</td></tr>
                )}
              </tbody>
            </table>

            {/* PAGINATION CONTROLS */}
            {totalPages > 1 && (
              <div className="d-flex justify-content-center mt-5">
                <nav>
                  <ul className="pagination gap-2">
                    <li className={`page-item ${currentPage === 0 ? "disabled" : ""}`}>
                      <button className="page-link border-0 rounded-3 shadow-sm" onClick={() => setCurrentPage(currentPage - 1)}>
                        <FiChevronLeft />
                      </button>
                    </li>
                    {[...Array(totalPages)].map((_, i) => (
                      <li key={i} className={`page-item ${currentPage === i ? "active" : ""}`}>
                        <button className="page-link border-0 rounded-3 shadow-sm" onClick={() => setCurrentPage(i)}>{i + 1}</button>
                      </li>
                    ))}
                    <li className={`page-item ${currentPage === totalPages - 1 ? "disabled" : ""}`}>
                      <button className="page-link border-0 rounded-3 shadow-sm" onClick={() => setCurrentPage(currentPage + 1)}>
                        <FiChevronRight />
                      </button>
                    </li>
                  </ul>
                </nav>
              </div>
            )}
          </div>
        )}
      </div>

      {/* BLOCK MODAL */}
      {showBlockModal && (
        <div className="modal-overlay">
          <div className="modal-content1 p-4 shadow-lg rounded-4">
            <h4 className="fw-800 mb-3" style={{ fontFamily: 'Outfit, sans-serif' }}>Restrict Member Access</h4>
            <p className="text-muted small mb-4">Select the period for which {selectedUser?.username} will be restricted from the platform.</p>
            
            <div className="mb-3">
              <label className="form-label small fw-bold">Restriction Start</label>
              <input 
                type="datetime-local" 
                className="form-control py-2 rounded-3" 
                value={blockDates.from}
                onChange={(e) => setBlockDates({ ...blockDates, from: e.target.value })}
              />
            </div>
            
            <div className="mb-4">
              <label className="form-label small fw-bold">Restriction End</label>
              <input 
                type="datetime-local" 
                className="form-control py-2 rounded-3" 
                value={blockDates.until}
                onChange={(e) => setBlockDates({ ...blockDates, until: e.target.value })}
              />
            </div>

            <div className="d-flex gap-2 justify-content-end">
              <button className="btn btn-light rounded-pill px-4 fw-700" onClick={() => setShowBlockModal(false)}>Cancel</button>
              <button className="btn btn-danger rounded-pill px-4 fw-700" onClick={handleBlockConfirm}>Confirm Restriction</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
