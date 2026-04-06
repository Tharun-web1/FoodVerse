import React, { useEffect, useState } from "react";
import axios from "axios";
import "bootstrap/dist/css/bootstrap.min.css";
import "./ManageAdmins.css";
import { 
  FiUserPlus, 
  FiMail, 
  FiPhone, 
  FiTrash2, 
  FiEdit3, 
  FiKey, 
  FiX, 
  FiUser,
  FiLock,
  FiSmartphone
} from "react-icons/fi";
import { FaUserShield } from "react-icons/fa";
import { useToast } from "../../context/ToastContext";
import { API_BASE_URL } from "../../api/api";

// 🛡️ ManageAdmins.jsx — Premium Admin Management
export default function ManageAdmins() {
  const [admins, setAdmins] = useState([]);
  const [loading, setLoading] = useState(true);
  const { showToast } = useToast();

  // Add Admin State
  const [showAddForm, setShowAddForm] = useState(false);
  const [formData, setFormData] = useState({
    username: "",
    password: "",
    phnno: "",
    mail: "",
  });
  const [formLoading, setFormLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  // Edit Admin State
  const [showEditForm, setShowEditForm] = useState(false);
  const [editAdminId, setEditAdminId] = useState(null);
  const [editFormData, setEditFormData] = useState({
    username: "",
    password: "",
    phnno: "",
    mail: "",
  });
  const [editMessage, setEditMessage] = useState("");
  const [editError, setEditError] = useState("");

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleEditChange = (e) => {
    setEditFormData({
      ...editFormData,
      [e.target.name]: e.target.value,
    });
  };

  const handleCreateSubmit = async (e) => {
    e.preventDefault();
    setFormLoading(true);
    setMessage("");
    setError("");

    const token = localStorage.getItem("token");

    try {
      const response = await axios.post(
        `${API_BASE_URL}/admin/add-admin`,
        formData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (response.status === 201) {
        showToast("Administrator created successfully!", "success");
        setAdmins([...admins, response.data]); 
        setFormData({
          username: "",
          password: "",
          phnno: "",
          mail: "",
        });
        setShowAddForm(false);
      }
    } catch (err) {
      console.error("Failed to add admin:", err);
      showToast(err.response?.data?.message || "Creation failed", "error");
    } finally {
      setFormLoading(false);
    }
  };

  useEffect(() => {
    const token = localStorage.getItem("token");
    setLoading(true);
    axios
      .get(`${API_BASE_URL}/admin/admins`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      .then((res) => {
        setAdmins(res.data);
        setLoading(false);
      })
      .catch((err) => {
        console.error("Failed to fetch admins:", err);
        setLoading(false);
      });
  }, []);

  const openEditModal = (admin) => {
    setEditAdminId(admin.id);
    setEditFormData({
      username: admin.username,
      password: "", 
      phnno: admin.phnno,
      mail: admin.mail,
    });
    setEditMessage("");
    setEditError("");
    setShowEditForm(true);
  };

  const handleEditSubmit = async (e) => {
    e.preventDefault();
    setFormLoading(true);

    const token = localStorage.getItem("token");

    try {
      const response = await axios.put(
        `${API_BASE_URL}/admin/admins/${editAdminId}`,
        editFormData,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      showToast("Administrator updated successfully!", "success");
      setAdmins(admins.map(admin => admin.id === editAdminId ? response.data : admin));
      setShowEditForm(false);
    } catch (err) {
      console.error("Failed to update admin:", err);
      showToast(err.response?.data?.message || "Update failed", "error");
    } finally {
      setFormLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to permanently delete this administrator?")) return;

    const token = localStorage.getItem("token");
    try {
      await axios.delete(`${API_BASE_URL}/admin/admins/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setAdmins(admins.filter(a => a.id !== id));
      showToast("Administrator access revoked", "success");
    } catch (err) {
      console.error("Failed to delete admin:", err);
      showToast("Failed to delete administrator.", "error");
    }
  };

  return (
    <div className="container mt-5 admin-management-page">
      <div className="table-container premium-card p-5">
        <div className="d-flex flex-column flex-md-row justify-content-between align-items-md-center mb-5 gap-3">
          <div>
            <h2 className="fw-800 mb-1" style={{ fontSize: '2.2rem', letterSpacing: '-1.5px' }}>Administrator Fleet</h2>
            <p className="text-muted small fw-600 mb-0">Securely manage privileged access and system operators</p>
          </div>
          <button
            className="btn-sunset"
            onClick={() => setShowAddForm(true)}
          >
            <FiUserPlus /> Add System Admin
          </button>
        </div>

        {/* MODAL OVERLAY: CREATE */}
        {showAddForm && (
          <div className="admin-modal-overlay">
            <div className="admin-modal-content">
              <div className="admin-modal-header">
                <h3 className="admin-modal-title">
                  <FaUserShield className="text-primary" />
                  Create Operator
                </h3>
                <button
                  className="admin-modal-close"
                  onClick={() => setShowAddForm(false)}
                >
                  <FiX />
                </button>
              </div>

              <form onSubmit={handleCreateSubmit}>
                <div className="admin-modal-body">
                  <div className="form-floating-custom">
                    <label>Username</label>
                    <div className="input-with-icon">
                      <FiUser className="input-icon-left" />
                      <input type="text" name="username" value={formData.username} onChange={handleChange} placeholder="Unique identifier" required autoFocus />
                    </div>
                  </div>

                  <div className="form-floating-custom">
                    <label>Security Key</label>
                    <div className="input-with-icon">
                      <FiLock className="input-icon-left" />
                      <input type="password" name="password" value={formData.password} onChange={handleChange} placeholder="Secure passphrase" required />
                    </div>
                  </div>

                  <div className="form-floating-custom split-inputs d-flex gap-3">
                    <div className="flex-grow-1">
                      <label>Contact Line</label>
                      <div className="input-with-icon">
                        <FiSmartphone className="input-icon-left" />
                        <input type="text" name="phnno" value={formData.phnno} onChange={handleChange} placeholder="Primary phone" required />
                      </div>
                    </div>
                  </div>

                  <div className="form-floating-custom mt-3">
                    <label>System Email</label>
                    <div className="input-with-icon">
                      <FiMail className="input-icon-left" />
                      <input type="email" name="mail" value={formData.mail} onChange={handleChange} placeholder="operator@domain.com" required />
                    </div>
                  </div>
                </div>

                <div className="admin-modal-footer">
                  <button type="button" className="btn-outline-light-custom" onClick={() => setShowAddForm(false)}>
                    Dismiss
                  </button>
                  <button type="submit" className="btn-sunset" disabled={formLoading}>
                    {formLoading ? "Provisioning..." : "Activate Access"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}


        {loading ? (
          <div className="text-center py-5">
            <div className="spinner-border text-primary"></div>
            <p className="mt-3 text-muted fw-800">Sourcing operator data...</p>
          </div>
        ) : (
          <div className="table-responsive">
            <table className="premium-admin-table">
              <thead>
                <tr>
                  <th>Identity</th>
                  <th>System Operator</th>
                  <th>Contact Directive</th>
                  <th className="text-end">Command</th>
                </tr>
              </thead>
              <tbody>
                {admins.map((admin, index) => (
                  <tr key={admin.id} className="reveal-item" style={{ animationDelay: `${index * 0.08}s` }}>
                    <td><span className="id-badge">OP-{admin.id}</span></td>
                    <td>
                      <div className="d-flex align-items-center gap-3">
                        <div className="avatar-mini bg-light-soft">
                          <FaUserShield />
                        </div>
                        <div>
                          <div className="fw-800 text-dark mb-0">{admin.username}</div>
                          <div className="small text-primary fw-700">Root Access</div>
                        </div>
                      </div>
                    </td>
                    <td>
                      <div className="d-flex flex-column gap-1">
                        <div className="small fw-700 text-secondary d-flex align-items-center gap-2">
                          <FiMail className="opacity-50" /> {admin.mail}
                        </div>
                        <div className="small fw-700 text-muted d-flex align-items-center gap-2">
                           <FiSmartphone className="opacity-50" /> {admin.phnno}
                        </div>
                      </div>
                    </td>
                    <td className="text-end">
                      <div className="d-flex justify-content-end gap-2">
                        <button
                          className="btn-icon-manage"
                          title="Modify Credentials"
                          onClick={() => openEditModal(admin)}
                        >
                          <FiEdit3 />
                        </button>
                        <button
                          className="btn-delete-icon"
                          title="Revoke Access"
                          onClick={() => handleDelete(admin.id)}
                        >
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

        {/* MODAL OVERLAY: EDIT */}
        {showEditForm && (
          <div className="admin-modal-overlay">
            <div className="admin-modal-content">
              <div className="admin-modal-header">
                <h3 className="admin-modal-title">
                  <FiEdit3 className="text-warning" />
                  Modify Access
                </h3>
                <button
                  className="admin-modal-close"
                  onClick={() => setShowEditForm(false)}
                >
                  <FiX />
                </button>
              </div>

              <form onSubmit={handleEditSubmit}>
                <div className="admin-modal-body">
                  <div className="form-floating-custom">
                    <label>Username</label>
                    <div className="input-with-icon">
                      <FiUser className="input-icon-left" />
                      <input type="text" name="username" value={editFormData.username} onChange={handleEditChange} required />
                    </div>
                  </div>

                  <div className="form-floating-custom">
                    <label>New Security Key (Optional)</label>
                    <div className="input-with-icon">
                      <FiKey className="input-icon-left" />
                      <input type="password" name="password" value={editFormData.password} onChange={handleEditChange} placeholder="Leave blank to persist current" />
                    </div>
                  </div>

                  <div className="form-floating-custom">
                    <label>Contact Phone</label>
                    <div className="input-with-icon">
                      <FiSmartphone className="input-icon-left" />
                      <input type="text" name="phnno" value={editFormData.phnno} onChange={handleEditChange} required />
                    </div>
                  </div>

                  <div className="form-floating-custom mt-3">
                    <label>System Email</label>
                    <div className="input-with-icon">
                      <FiMail className="input-icon-left" />
                      <input type="email" name="mail" value={editFormData.mail} onChange={handleEditChange} required />
                    </div>
                  </div>
                </div>

                <div className="admin-modal-footer">
                  <button type="button" className="btn-outline-light-custom" onClick={() => setShowEditForm(false)}>
                    Cancel
                  </button>
                  <button type="submit" className="btn-sunset" disabled={formLoading}>
                    {formLoading ? "Updating..." : "Persist Changes"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
