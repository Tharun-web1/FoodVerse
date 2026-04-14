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
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [confirmPassword, setConfirmPassword] = useState("");

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const validatePassword = (password) => {
    const minLength = 8;
    const hasUpperCase = /[A-Z]/.test(password);
    const hasLowerCase = /[a-z]/.test(password);
    const hasNumber = /[0-9]/.test(password);
    const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>]/.test(password);

    if (password.length < minLength) return "Password must be at least 8 characters long";
    if (!hasUpperCase) return "Password must contain at least one uppercase letter";
    if (!hasLowerCase) return "Password must contain at least one lowercase letter";
    if (!hasNumber) return "Password must contain at least one number";
    if (!hasSpecialChar) return "Password must contain at least one special character (!@#$%^&*)";
    return null;
  };

  const getStrength = (password) => {
    let strength = 0;
    if (password.length >= 8) strength += 20;
    if (/[A-Z]/.test(password)) strength += 20;
    if (/[a-z]/.test(password)) strength += 20;
    if (/[0-9]/.test(password)) strength += 20;
    if (/[!@#$%^&*(),.?":{}|<>]/.test(password)) strength += 20;
    return strength;
  };

  const getStrengthColor = (strength) => {
    if (strength <= 40) return "#ff4d4d"; // Red
    if (strength <= 80) return "#ffa500"; // Orange
    return "#2ecc71"; // Green
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const passwordError = validatePassword(formData.password);
    if (passwordError) {
      alert("❌ " + passwordError);
      setMessage(passwordError);
      return;
    }

    if (formData.password !== confirmPassword) {
      alert("❌ Passwords do not match!");
      setMessage("Passwords do not match");
      return;
    }

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
              <div className="input-group-custom">
                <input
                  type={showPassword ? "text" : "password"}
                  className="form-control"
                  name="password"
                  placeholder="Enter Password"
                  required
                  onChange={handleChange}
                />
                <i 
                  className={`fa-solid ${showPassword ? 'fa-eye-slash' : 'fa-eye'} password-toggle`} 
                  onClick={() => setShowPassword(!showPassword)}
                ></i>
              </div>
              
              {/* Strength Meter */}
              {formData.password && (
                <div className="strength-meter-container mt-2">
                  <div 
                    className="strength-meter-bar" 
                    style={{ 
                      width: `${getStrength(formData.password)}%`, 
                      backgroundColor: getStrengthColor(getStrength(formData.password)) 
                    }}
                  ></div>
                  <span className="strength-text" style={{ color: getStrengthColor(getStrength(formData.password)) }}>
                    {getStrength(formData.password) <= 40 ? "Weak" : getStrength(formData.password) <= 80 ? "Medium" : "Strong"}
                  </span>
                </div>
              )}
            </div>

            <div className="form-group mb-3">
              <label className="form-label">Confirm Password</label>
              <div className="input-group-custom">
                <input
                  type={showConfirmPassword ? "text" : "password"}
                  className="form-control"
                  placeholder="Confirm Password"
                  required
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                />
                <i 
                  className={`fa-solid ${showConfirmPassword ? 'fa-eye-slash' : 'fa-eye'} password-toggle`} 
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                ></i>
              </div>
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
