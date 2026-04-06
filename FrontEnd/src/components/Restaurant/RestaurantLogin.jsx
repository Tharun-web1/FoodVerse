import React, { useState, useEffect } from "react";
import api from "../../services/api";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";
import { API_BASE_URL } from "../../api/api";
import "../RestaurantCss/RestaurantLogin.css";

export default function RestaurantLogin() {
  const navigate = useNavigate();

  const [loginData, setLoginData] = useState({
    username: "",
    password: ""
  });

  // OTP States
  const [loginMode, setLoginMode] = useState("password"); // "password" or "otp"
  const [otpStep, setOtpStep] = useState(1); // 1: Request, 2: Verify
  const [otp, setOtp] = useState("");
  const [timer, setTimer] = useState(0);

  const [loading, setLoading] = useState(false);

  useEffect(() => {
    let interval;
    if (timer > 0) {
      interval = setInterval(() => {
        setTimer(prev => prev - 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [timer]);

  const handleChange = (e) => {
    setLoginData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }));
  };

  const handleRequestOtp = async (e) => {
    if (e) e.preventDefault();
    if (!loginData.username) {
      alert("Please enter your Username, Phone or Email");
      return;
    }

    setLoading(true);
    try {
      const res = await axios.post(`${API_BASE_URL}/auth/request-otp`, {
        identifier: loginData.username
      });
      setOtpStep(2);
      setTimer(60);
      alert(res.data.message || "OTP sent successfully!");
    } catch (err) {
      alert(err.response?.data?.message || "Failed to send OTP");
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOtp = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await axios.post(`${API_BASE_URL}/auth/login-otp`, {
        identifier: loginData.username,
        otp: otp
      });

      handleLoginSuccess(res.data);
    } catch (err) {
      alert(err.response?.data?.message || "Invalid OTP");
    } finally {
      setLoading(false);
    }
  };

  const handleLoginSuccess = async (token) => {
    localStorage.setItem("restaurant_token", token);

    try {
      // Use the generic axios to set headers manually or use your api service if it allows passing token
      const profileRes = await axios.get(`${API_BASE_URL}/restaurants/profile`, {
        headers: { Authorization: `Bearer ${token}` }
      });

      if (profileRes.data) {
        if (profileRes.data.status !== 'APPROVED') {
          localStorage.removeItem("restaurant_token");
          alert("Your restaurant registration is pending approval.");
          return;
        }

        if (profileRes.data.id) {
          localStorage.setItem("restaurantId", profileRes.data.id);
        }
        window.location.href = "/res/dash";
      }
    } catch (err) {
      console.error(err);
      alert("Login verification failed");
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (loginMode === 'otp') {
      if (otpStep === 1) handleRequestOtp();
      else handleVerifyOtp(e);
      return;
    }

    setLoading(true);
    try {
      const res = await api.post('/auth/login', loginData);
      handleLoginSuccess(res.data);
    } catch (err) {
      alert(err.response?.data?.message || "❌ Login failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>

      <div className="login-container">
        <div className="login-card mt-4 fade-in">
          <div className="login-header">
            <h3>Restaurant Login</h3>
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
              <label className="form-label">{loginMode === 'password' ? 'Username, Phone or Email' : 'Email or Phone Number'}</label>
              <input
                type="text"
                name="username"
                className="form-control"
                placeholder={loginMode === 'password' ? 'Enter Username, Phone or Email' : 'Enter Email or Phone Number'}
                value={loginData.username}
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
                  name="password"
                  className="form-control"
                  placeholder="Enter password"
                  value={loginData.password}
                  onChange={handleChange}
                  required
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
                    <div className="text-center mt-2">
                      <span className="resend-link" onClick={handleRequestOtp}>Resend Now</span>
                    </div>
                  )}
                </div>
              )
            )}

            <button
              type="submit"
              className="btn-login w-100"
              disabled={loading}
            >
              {loading ? "Processing..." : (loginMode === 'otp' && otpStep === 1 ? "Get OTP" : "Log In")}
            </button>
          </form>

          <div className="login-footer text-center mt-4">
            <p>
              Don't have a restaurant account?{" "}
              <Link to="/signup/res" className="link-register">
                Register Here
              </Link>
            </p>
          </div>
        </div>
      </div>
    </>
  );
}
