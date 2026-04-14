import React, { useState, useEffect } from "react";
import axios from "axios";
import "./login.css";
import { useNavigate, Link } from "react-router-dom";
import { API_BASE_URL } from "../../api/api";

export default function ForgotPassword() {
  const navigate = useNavigate();
  const [step, setStep] = useState(1); // 1: Request, 2: Reset
  const [identifier, setIdentifier] = useState("");
  const [otp, setOtp] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [timer, setTimer] = useState(0);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const startTimer = () => {
    setTimer(60);
    const interval = setInterval(() => {
      setTimer((prev) => {
        if (prev <= 1) {
          clearInterval(interval);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
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

  const handleRequestOtp = async (e) => {
    if (e) e.preventDefault();
    if (!identifier) {
      alert("Please enter your Email or Phone Number");
      return;
    }

    setLoading(true);
    try {
      const res = await axios.post(`${API_BASE_URL}/auth/forgot-password/request`, {
        identifier: identifier
      });
      setStep(2);
      startTimer();
      alert(res.data.message || "Recovery code sent! Please check your Email and Phone.");
    } catch (err) {
      alert(err.response?.data?.message || "Failed to send recovery code. Ensure user exists.");
    } finally {
      setLoading(false);
    }
  };

  const handleResetPassword = async (e) => {
    e.preventDefault();
    
    if (newPassword !== confirmPassword) {
      alert("Passwords do not match!");
      return;
    }

    const passwordError = validatePassword(newPassword);
    if (passwordError) {
      alert("❌ " + passwordError);
      return;
    }

    setLoading(true);
    try {
      const res = await axios.post(`${API_BASE_URL}/auth/forgot-password/reset`, {
        identifier: identifier,
        otp: otp,
        newPassword: newPassword
      });
      alert(res.data.message || "Password reset successful!");
      navigate("/login/user");
    } catch (err) {
      alert(err.response?.data?.message || "Failed to reset password. Check OTP.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-container">
      <div className="login-overlay"></div>
      <div className="login-card mt-4 fade-in">
        <div className="login-header">
          <h3>Password Recovery</h3>
          <p className="text-muted">
            {step === 1 ? "Enter your details to receive a code" : "Verify code and set your new password"}
          </p>
        </div>

        {step === 1 ? (
          <form onSubmit={handleRequestOtp}>
            <div className="form-group mb-4">
              <label className="form-label">Email or Phone Number</label>
              <input
                type="text"
                className="form-control"
                placeholder="Enter registered Email or Phone"
                value={identifier}
                onChange={(e) => setIdentifier(e.target.value)}
                required
              />
            </div>
            <button type="submit" className="btn-login w-100" disabled={loading}>
              {loading ? "Sending..." : "Send Reset Code"}
            </button>
            <div className="text-center mt-3">
              <Link to="/login/user" className="text-secondary text-decoration-none" style={{ fontSize: '0.9rem' }}>
                Back to Login
              </Link>
            </div>
          </form>
        ) : (
          <form onSubmit={handleResetPassword}>
            <div className="form-group mb-3">
              <label className="form-label">Enter 6-Digit Code</label>
              <input
                type="text"
                className="form-control"
                placeholder="X X X X X X"
                maxLength={6}
                required
                value={otp}
                onChange={(e) => setOtp(e.target.value)}
              />
            </div>

            <div className="form-group mb-3">
              <label className="form-label">New Password</label>
              <div className="input-group-custom">
                <input
                  type={showPassword ? "text" : "password"}
                  className="form-control"
                  placeholder="Enter strong password"
                  required
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                />
                <i 
                  className={`fa-solid ${showPassword ? 'fa-eye-slash' : 'fa-eye'} password-toggle`} 
                  onClick={() => setShowPassword(!showPassword)}
                ></i>
              </div>
            </div>

            <div className="form-group mb-4">
              <label className="form-label">Confirm Password</label>
              <div className="input-group-custom">
                <input
                  type={showConfirmPassword ? "text" : "password"}
                  className="form-control"
                  placeholder="Repeat new password"
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

            <button type="submit" className="btn-login w-100" disabled={loading}>
              {loading ? "Resetting..." : "Reset Password"}
            </button>

            <div className="otp-timer-container text-center mt-3" style={{ fontSize: '0.85rem' }}>
              {timer > 0 ? (
                <span className="text-muted">Resend code in {timer}s</span>
              ) : (
                <span className="resend-link" style={{ color: '#ff6b6b', cursor: 'pointer', fontWeight: 'bold' }} onClick={handleRequestOtp}>
                  Resend Code
                </span>
              )}
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
