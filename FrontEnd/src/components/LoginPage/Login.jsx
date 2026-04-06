import React, { useState } from "react";
import axios from "axios";
import "./login.css";
import { useNavigate, Link } from "react-router-dom";
import { API_BASE_URL } from "../../api/api";

export default function Login() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    username: "",
    password: ""
  });

  // OTP States
  const [loginMode, setLoginMode] = useState("password"); // "password" or "otp"
  const [otpStep, setOtpStep] = useState(1); // 1: Request, 2: Verify
  const [otp, setOtp] = useState("");
  const [timer, setTimer] = useState(0);

  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

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

  const handleRequestOtp = async (e) => {
    if (e) e.preventDefault();
    if (!formData.username) {
      alert("Please enter your Identifier (Username, Email or Phone)");
      return;
    }

    setLoading(true);
    try {
      const res = await axios.post(`${API_BASE_URL}/auth/request-otp`, {
        identifier: formData.username
      });
      setOtpStep(2);
      startTimer();
      alert(res.data.message || "OTP sent successfully! Please check your Email/Phone.");
    } catch (err) {
      alert(err.response?.data?.message || "Failed to send OTP. Ensure user exists.");
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOtp = async (e) => {
    e.preventDefault();
    if (!otp) {
      alert("Please enter the 6-digit OTP");
      return;
    }

    setLoading(true);
    try {
      const res = await axios.post(`${API_BASE_URL}/auth/login-otp`, {
        identifier: formData.username,
        otp: otp
      });

      handleLoginSuccess(res.data);
    } catch (err) {
      alert(err.response?.data?.message || "Invalid or expired OTP");
    } finally {
      setLoading(false);
    }
  };

  const handleLoginSuccess = async (token) => {
    localStorage.setItem("token", token);
    const payload = JSON.parse(atob(token.split(".")[1]));

    const getRole = (p) => {
      const val = p.role || p.roles || p.authorities || p.authority;
      if (!val) return "USER";
      if (typeof val === 'string') return val;
      if (Array.isArray(val)) {
        const first = val[0];
        if (typeof first === 'string') return first;
        if (first && typeof first === 'object') return first.authority || first.name || first.role || "USER";
      }
      return "USER";
    };

    let role = getRole(payload).replace("ROLE_", "").toUpperCase();

    if (role === "USER") {
      try {
        await axios.get(`${API_BASE_URL}/admin/stats`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        role = "ADMIN";
      } catch (e) {
        console.log("Standard user access confirmed");
      }
    }

    localStorage.setItem("user_role", role);
    window.location.href = role === "ADMIN" ? "/admin" : "/user";
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (loginMode === "otp") {
      if (otpStep === 1) handleRequestOtp();
      else handleVerifyOtp(e);
      return;
    }

    setLoading(true);
    try {
      const res = await axios.post(`${API_BASE_URL}/auth/login`, formData);
      handleLoginSuccess(res.data);
    } catch (err) {
      alert(err.response?.data?.message || "Invalid credentials");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <div className="login-container">
        <div className="login-overlay"></div>
        <div className="login-card mt-4 fade-in">
          <div className="login-header">
            <h3>Welcome Back</h3>
            <p className="text-muted">Access your account securely</p>
          </div>

          <div className="otp-toggle-container">
            <button
              className={`otp-toggle-btn ${loginMode === 'password' ? 'active' : ''}`}
              onClick={() => setLoginMode('password')}
            >
              Password
            </button>
            <button
              className={`otp-toggle-btn ${loginMode === 'otp' ? 'active' : ''}`}
              onClick={() => {
                setLoginMode('otp');
                setOtpStep(1);
              }}
            >
              OTP Login
            </button>
          </div>

          <form onSubmit={handleSubmit} className="login-form">
            <div className="form-group mb-4">
              <label className="form-label">{loginMode === 'password' ? 'Email, Phone or Name' : 'Email or Phone Number'}</label>
              <input
                type="text"
                name="username"
                className="form-input"
                placeholder={loginMode === 'password' ? 'Enter Email, Phone or Name' : 'Enter Email or Phone Number'}
                value={formData.username}
                onChange={handleChange}
                required
                disabled={otpStep === 2 && loginMode === 'otp'}
              />
            </div>

            {loginMode === "password" ? (
              <div className="form-group mb-4">
                <label className="form-label">Password</label>
                <input
                  type="password"
                  className="form-control"
                  name="password"
                  placeholder="Enter password"
                  required
                  value={formData.password}
                  onChange={handleChange}
                />
              </div>
            ) : (
              otpStep === 2 && (
                <div className="form-group mb-4">
                  <label className="form-label">Enter 6-Digit OTP</label>
                  <input
                    type="text"
                    className="form-control"
                    placeholder="X X X X X X"
                    maxLength={6}
                    required
                    value={otp}
                    onChange={(e) => setOtp(e.target.value)}
                    autoFocus
                  />
                  {timer > 0 ? (
                    <span className="otp-timer">Resend OTP in {timer}s</span>
                  ) : (
                    <span className="otp-timer">
                      Didn't get code? <span className="resend-link" onClick={handleRequestOtp}>Resend Now</span>
                    </span>
                  )}
                </div>
              )
            )}

            <button type="submit" className="btn-login w-100" disabled={loading}>
              {loading
                ? "Processing..."
                : (loginMode === 'otp' && otpStep === 1 ? "Get Verification Code" : "Login")}
            </button>

            <div className="login-footer text-center mt-4">
              <p>Don't have an account? <Link to="/signup/user" className="link-register">Register Here</Link></p>
            </div>
          </form>
        </div>
      </div>
    </>
  );
}
