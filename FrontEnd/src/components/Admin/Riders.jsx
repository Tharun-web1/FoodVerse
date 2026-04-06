import React, { useEffect, useState } from "react";
import axios from "axios";
import "./Riders.css";
import { FiTruck, FiMail, FiPhone, FiSearch, FiCheckCircle, FiSlash } from "react-icons/fi";
import { useToast } from "../../context/ToastContext";
import { API_BASE_URL } from "../../api/api";

export default function Riders() {
  const { showToast } = useToast();
  const [riders, setRiders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [search, setSearch] = useState("");
  const [showBlockModal, setShowBlockModal] = useState(false);
  const [selectedRider, setSelectedRider] = useState(null);
  const [blockDates, setBlockDates] = useState({ 
    from: new Date().toISOString().slice(0, 16), 
    until: new Date(Date.now() + 86400000).toISOString().slice(0, 16) 
  });

  const fetchRiders = () => {
    const token = localStorage.getItem("token");
    setLoading(true);
    axios
      .get(`${API_BASE_URL}/partner/auth/all`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })
      .then((res) => {
        setRiders(res.data || []);
        setLoading(false);
      })
      .catch((err) => {
        console.error("Error fetching riders:", err);
        setError("Failed to load delivery partner fleet.");
        setLoading(false);
      });
  };

  useEffect(() => {
    fetchRiders();
  }, []);

  const filteredRiders = riders.filter(r =>
    r.name?.toLowerCase().includes(search.toLowerCase()) ||
    r.email?.toLowerCase().includes(search.toLowerCase()) ||
    r.phone?.includes(search)
  );
  
  const handleBlockConfirm = () => {
    const token = localStorage.getItem("token");
    axios
      .put(
        `${API_BASE_URL}/partner/auth/block/${selectedRider.id}`,
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
        setRiders((prev) =>
          prev.map((r) => (r.id === selectedRider.id ? res.data : r))
        );
        setShowBlockModal(false);
        showToast("Rider blocked successfully", "success");
      })
      .catch((err) => {
        console.error("Block error:", err);
        showToast("Block failed. Try again.", "error");
      });
  };

  const toggleStatus = (id, currentStatus) => {
    const token = localStorage.getItem("token");
    const isActive = currentStatus === 'ACTIVE';
    
    if (isActive) {
        setSelectedRider(riders.find(r => r.id === id));
        setShowBlockModal(true);
        return;
    }

    axios
      .put(
        `${API_BASE_URL}/partner/auth/approve/${id}`,
        {},
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      )
      .then((res) => {
        setRiders((prev) =>
          prev.map((r) => (r.id === id ? res.data : r))
        );
        showToast("Rider unblocked successfully", "success");
      })
      .catch((err) => {
        console.error("Status update error:", err);
        showToast("Operation failed. Try again.", "error");
      });
  };

  return (
    <div className="container mt-5 riders-page">
      <div className="premium-card">
        <div className="d-flex flex-wrap justify-content-between align-items-center mb-5 gap-3">
          <div>
            <h2 className="mb-1">Rider Fleet</h2>
            <p className="text-muted small mb-0">Manage delivery logistics and partner availability.</p>
          </div>
          <div className="search-form-compact">
            <div className="input-group">
              <span className="input-group-text"><FiSearch /></span>
              <input
                type="text"
                className="form-control ps-1"
                placeholder="Search riders..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                style={{ borderRadius: '0 12px 12px 0' }}
              />
            </div>
          </div>
        </div>

        {error && <div className="alert alert-danger rounded-4">{error}</div>}

        {loading ? (
          <div className="text-center py-5">
            <div className="spinner-border text-primary mb-3"></div>
            <p className="text-muted fw-600">Tracking active partners...</p>
          </div>
        ) : (
          <div className="table-responsive">
            <table className="table align-middle">
              <thead>
                <tr>
                  <th>Rider ID</th>
                  <th>Rider Name</th>
                  <th>Contact Email</th>
                  <th>Mobile Number</th>
                  <th>Operational Status</th>
                  <th className="text-end">Command</th>
                </tr>
              </thead>
              <tbody>
                {filteredRiders.length > 0 ? filteredRiders.map((rider, index) => (
                  <tr key={rider.id} className="reveal-item" style={{ animationDelay: `${index * 0.05}s` }}>
                    <td>
                      <span className="id-badge">#{rider.id}</span>
                    </td>
                    <td>
                      <div className="d-flex align-items-center gap-3">
                        <div className="avatar-mini bg-light-soft text-primary"><FiTruck /></div>
                        <div className="fw-800 text-dark">{rider.name}</div>
                      </div>
                    </td>
                    <td>
                      <div className="d-flex align-items-center gap-2 small fw-600 text-secondary">
                        <FiMail className="opacity-50" /> {rider.email}
                      </div>
                    </td>
                    <td>
                      <div className="d-flex align-items-center gap-2 small fw-600 text-secondary">
                        <FiPhone className="opacity-50" /> {rider.phone}
                      </div>
                    </td>
                    <td>
                      <span className={`status-pill ${rider.status === 'ACTIVE' ? 'active' : 'inactive'}`}>
                        {rider.status === 'ACTIVE' ? <><FiCheckCircle /> On Duty</> : <><FiSlash /> Off Duty</>}
                      </span>
                    </td>
                    <td className="text-end">
                      <button
                        className={`btn-status-toggle ${rider.status === 'ACTIVE' ? 'suspend' : 'activate'}`}
                        onClick={() => toggleStatus(rider.id, rider.status)}
                      >
                        {rider.status === 'ACTIVE' ? "Restrict Access" : "Restore Access"}
                      </button>
                    </td>
                  </tr>
                )) : (
                  <tr><td colSpan="6" className="text-center py-5 text-muted">No delivery partners found.</td></tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* BLOCK MODAL */}
      {showBlockModal && (
        <div className="modal-overlay">
          <div className="modal-content1 p-4 shadow-lg rounded-4">
            <h4 className="fw-800 mb-3" style={{ fontFamily: 'Outfit, sans-serif' }}>Temporary Block Rider</h4>
            <p className="text-muted small mb-4">Select the period for which #{selectedRider?.id} will be restricted from the platform.</p>
            
            <div className="mb-3">
              <label className="form-label small fw-bold">Block Interval Start</label>
              <input 
                type="datetime-local" 
                className="form-control py-2 rounded-3" 
                value={blockDates.from}
                onChange={(e) => setBlockDates({ ...blockDates, from: e.target.value })}
              />
            </div>
            
            <div className="mb-4">
              <label className="form-label small fw-bold">Block Interval End</label>
              <input 
                type="datetime-local" 
                className="form-control py-2 rounded-3" 
                value={blockDates.until}
                onChange={(e) => setBlockDates({ ...blockDates, until: e.target.value })}
              />
            </div>

            <div className="d-flex gap-2 justify-content-end">
              <button className="btn btn-light rounded-pill px-4 fw-700" onClick={() => setShowBlockModal(false)}>Cancel</button>
              <button className="btn btn-danger rounded-pill px-4 fw-700" onClick={handleBlockConfirm}>Confirm Block</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
