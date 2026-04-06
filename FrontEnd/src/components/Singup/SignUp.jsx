import React, { useState } from "react";
import axios from "axios";
import "./signup.css";
import { useNavigate, Link } from "react-router-dom";
import { API_BASE_URL } from "../../api/api";

export default function SignUp() {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    username: "",
    phnno: "",
    mail: "",
    password: "",
    role: "USER"
  });

  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage("");

    try {
      const res = await axios.post(
        `${API_BASE_URL}/auth/signup`,
        formData
      );

      // Show alert and redirect
      alert("✅ Signup successful!");
      navigate("/login/user");
    } catch (error) {
      console.error(error);
      const errorMsg = error.response?.data?.message || "❌ Signup failed";
      alert(errorMsg);
      setMessage(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <div className="signup-container">
        <div className="signup-overlay"></div>
        <div className="signup-card mt-4 fade-in">
          <div className="signup-header">
            <h3>Create Account</h3>
            <p className="text-muted">Join us to order delicious food</p>
          </div>

          <form onSubmit={handleSubmit}>
            <div className="form-group mb-3">
              <label className="form-label">Username</label>
              <input
                type="text"
                className="form-control"
                name="username"
                placeholder="Enter Username"
                required
                onChange={handleChange}
              />
            </div>

            <div className="form-group mb-3">
              <label className="form-label">Phone Number</label>
              <input
                type="tel"
                className="form-control"
                name="phnno"
                placeholder="Enter Phone Number"
                required
                onChange={handleChange}
              />
            </div>

            <div className="form-group mb-3">
              <label className="form-label">Email (Optional)</label>
              <input
                type="email"
                className="form-control"
                name="mail"
                placeholder="Enter Email"
                onChange={handleChange}
              />
            </div>

            <div className="form-group mb-3">
              <label className="form-label">Password</label>
              <input
                type="password"
                className="form-control"
                name="password"
                placeholder="Enter Password"
                required
                onChange={handleChange}
              />
            </div>

            <button type="submit" className="btn-signup w-100" disabled={loading}>
              {loading ? "Creating Account..." : "Sign Up"}
            </button>

            <div className="signup-footer text-center mt-4">
              <p>Already have an account? <Link to="/login/user" className="link-login">Login Here</Link></p>
            </div>

            {message && <p className="text-center mt-2 text-danger fs-6">{message}</p>}
          </form>
        </div>
      </div>
    </>
  );
}
