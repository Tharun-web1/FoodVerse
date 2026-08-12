import { useState, useEffect } from 'react';
import { useAuth } from './AuthContext';
import { useNavigate, Link } from 'react-router-dom';
import { useToast } from '../../context/ToastContext';
import axios from 'axios';
import { API_BASE_URL } from '../../api/api';
import { FaUser, FaLock, FaMobileAlt, FaEnvelope, FaFingerprint } from 'react-icons/fa';
import { FiTruck, FiUser, FiLock, FiSmartphone, FiKey } from 'react-icons/fi';
import './Auth.css';

const Login = () => {
    const [identifier, setIdentifier] = useState('');
    const [password, setPassword] = useState('');

    // OTP States
    const [loginMode, setLoginMode] = useState('password'); // 'password' or 'otp'
    const [otpStep, setOtpStep] = useState(1); // 1: Request, 2: Verify
    const [otp, setOtp] = useState('');
    const [timer, setTimer] = useState(0);

    const [loading, setLoading] = useState(false);
    const { login } = useAuth();
    const { showToast } = useToast();
    const navigate = useNavigate();

    useEffect(() => {
        let interval;
        if (timer > 0) {
            interval = setInterval(() => {
                setTimer(prev => prev - 1);
            }, 1000);
        }
        return () => clearInterval(interval);
    }, [timer]);

    const handleRequestOtp = async (e) => {
        if (e) e.preventDefault();
        if (!identifier) {
            showToast('Please enter your Email or Phone', 'warning');
            return;
        }

        setLoading(true);
        try {
            const res = await axios.post(`${API_BASE_URL}/auth/request-otp`, {
                identifier: identifier
            });
            setOtpStep(2);
            setTimer(60);
            showToast(res.data.message || 'OTP sent successfully!', 'success');
        } catch (error) {
            showToast(error.response?.data?.message || 'Failed to send OTP', 'error');
        } finally {
            setLoading(false);
        }
    };

    const handleVerifyOtp = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            const res = await axios.post(`${API_BASE_URL}/auth/login-otp`, {
                identifier: identifier,
                otp: otp
            });

            localStorage.setItem('token', res.data);
            localStorage.setItem('user_role', 'RIDER');

            const { hasVehicleDetails } = await login(identifier, 'OTP_LOGIN_BYPASS', res.data);
            if (hasVehicleDetails) {
                navigate('/delivery-partner/dashboard');
            } else {
                navigate('/delivery-partner/vehicle');
            }
            showToast('Login successful!', 'success');
        } catch (error) {
            showToast(error.response?.data?.message || 'Invalid OTP', 'error');
        } finally {
            setLoading(false);
        }
    };

    const handlePasswordLogin = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            const { hasVehicleDetails } = await login(identifier.trim(), password);
            if (hasVehicleDetails) {
                navigate('/delivery-partner/dashboard');
            } else {
                navigate('/delivery-partner/vehicle');
            }
        } catch (error) {
            const errorMsg = error.response?.data?.message || error.message || 'Login failed';
            showToast(errorMsg, 'error');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="auth-page">
            <div className="auth-form-wrapper">
                <div className="auth-form-card">
                    {/* <div className="auth-brand-center">
                        <FiTruck className="brand-icon" />
                        <span>FoodVerse Logistics</span>
                    </div> */}
                    <h2>Partner Portal</h2>
                    <p className="auth-sub">Access your delivery dashboard</p>

                    <div className="otp-toggle">
                        <button
                            className={`otp-btn ${loginMode === 'password' ? 'active' : ''}`}
                            onClick={() => { setLoginMode('password'); setOtpStep(1); }}
                            type="button"
                        >
                            Password
                        </button>
                        <button
                            className={`otp-btn ${loginMode === 'otp' ? 'active' : ''}`}
                            onClick={() => { setLoginMode('otp'); setOtpStep(1); }}
                            type="button"
                        >
                            OTP Access
                        </button>
                    </div>

                    <form onSubmit={loginMode === 'otp' ? (otpStep === 1 ? handleRequestOtp : handleVerifyOtp) : handlePasswordLogin}>
                        {loginMode === 'otp' ? (
                            <>
                                <div className="input-group-custom">
                                    <span className="input-icon"><FiSmartphone /></span>
                                    <input
                                        type="text"
                                        className="auth-input"
                                        placeholder="Mobile Number or Email"
                                        value={identifier}
                                        onChange={(e) => setIdentifier(e.target.value)}
                                        disabled={otpStep === 2}
                                        required
                                    />
                                </div>

                                {otpStep === 2 && (
                                    <div className="input-group-custom animate__animated animate__fadeIn">
                                        <span className="input-icon"><FiKey /></span>
                                        <input
                                            type="text"
                                            className="auth-input"
                                            placeholder="Enter 6-Digit OTP"
                                            value={otp}
                                            onChange={(e) => setOtp(e.target.value)}
                                            maxLength={6}
                                            required
                                        />
                                    </div>
                                )}
                            </>
                        ) : (
                            <>
                                <div className="input-group-custom">
                                    <span className="input-icon"><FiUser /></span>
                                    <input
                                        type="text"
                                        className="auth-input"
                                        placeholder="Username / Email / Mobile"
                                        value={identifier}
                                        onChange={(e) => setIdentifier(e.target.value)}
                                        required
                                    />
                                </div>

                                <div className="input-group-custom">
                                    <span className="input-icon"><FiLock /></span>
                                    <input
                                        type="password"
                                        className="auth-input"
                                        placeholder="Password"
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                        required
                                    />
                                </div>
                            </>
                        )}

                        <button type="submit" className="auth-btn" disabled={loading}>
                            {loading ? 'Authenticating...' : (loginMode === 'otp' && otpStep === 1 ? 'Get Access Code' : 'Sign In')}
                        </button>

                        <div className="auth-link">
                            New partner? <Link to="/delivery-partner/register">Join Our Fleet</Link>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default Login;
