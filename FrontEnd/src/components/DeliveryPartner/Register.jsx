import { useState } from 'react';
import { useAuth } from './AuthContext';
import { useNavigate, Link } from 'react-router-dom';
import { useToast } from '../../context/ToastContext';
import { FaUser, FaEnvelope, FaLock, FaPhone, FaCalendarAlt, FaVenusMars, FaEye, FaEyeSlash } from 'react-icons/fa';
import './Auth.css';

const Register = () => {
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        password: '',
        phone: '',
        age: '',
        gender: ''
    });
    const { register, login } = useAuth();
    const { showToast } = useToast();
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [confirmPassword, setConfirmPassword] = useState('');

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
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

    const handleSubmit = async (e) => {
        e.preventDefault();

        const passwordError = validatePassword(formData.password);
        if (passwordError) {
            showToast(passwordError, "error");
            return;
        }

        if (formData.password !== confirmPassword) {
            showToast("Passwords do not match!", "error");
            return;
        }

        setLoading(true);
        try {
            const cleanData = {
                ...formData,
                name: formData.name.trim(),
                email: formData.email.trim(),
                phone: formData.phone.trim(),
                password: formData.password.trim()
            };
            await register(cleanData);
            await login(cleanData.email, cleanData.password);
            navigate('/delivery/vehicle');
        } catch (error) {
            const message = error.response?.data?.message || 'Registration failed';
            showToast(message, 'error');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="delivery-body">
            <div className="auth-container">
                <div className="auth-card1">
                    <h2 className="auth-title">Join Our Fleet</h2>
                    <p className="auth-subtitle">Become a delivery partner today</p>
                    
                    <form onSubmit={handleSubmit}>
                        <div className="input-group-custom">
                            <span className="input-icon"><FaUser /></span>
                            <input
                                type="text"
                                name="name"
                                className="auth-input"
                                placeholder="Full Name"
                                value={formData.name}
                                onChange={handleChange}
                                required
                            />
                        </div>
                        
                        <div className="input-group-custom">
                            <span className="input-icon"><FaEnvelope /></span>
                            <input
                                type="email"
                                name="email"
                                className="auth-input"
                                placeholder="Email Address"
                                value={formData.email}
                                onChange={handleChange}
                                required
                            />
                        </div>

                        <div className="input-group-custom">
                            <span className="input-icon"><FaPhone /></span>
                            <input
                                type="tel"
                                name="phone"
                                className="auth-input"
                                placeholder="Phone Number"
                                value={formData.phone}
                                onChange={handleChange}
                                required
                            />
                        </div>

                        <div className="row g-2 mb-0">
                            <div className="col-5">
                                <div className="input-group-custom">
                                    <span className="input-icon"><FaCalendarAlt /></span>
                                    <input
                                        type="number"
                                        name="age"
                                        className="auth-input"
                                        placeholder="Age"
                                        value={formData.age}
                                        onChange={handleChange}
                                        required
                                        min="18"
                                    />
                                </div>
                            </div>
                            <div className="col-7">
                                <div className="input-group-custom">
                                    <span className="input-icon"><FaVenusMars /></span>
                                    <select
                                        name="gender"
                                        className="auth-input"
                                        value={formData.gender}
                                        onChange={handleChange}
                                        required
                                        style={{ appearance: 'none' }}
                                    >
                                        <option value="" disabled>Gender</option>
                                        <option value="Male">Male</option>
                                        <option value="Female">Female</option>
                                        <option value="Other">Other</option>
                                    </select>
                                </div>
                            </div>
                        </div>

                        <div className="input-group-custom">
                            <span className="input-icon"><FaLock /></span>
                            <input
                                type={showPassword ? "text" : "password"}
                                name="password"
                                className="auth-input"
                                placeholder="Secure Password"
                                value={formData.password}
                                onChange={handleChange}
                                required
                            />
                            <span 
                                className="input-toggle" 
                                onClick={() => setShowPassword(!showPassword)}
                                style={{ position: 'absolute', right: '15px', cursor: 'pointer', color: '#888' }}
                            >
                                {showPassword ? <FaEyeSlash /> : <FaEye />}
                            </span>
                        </div>

                        <div className="input-group-custom">
                            <span className="input-icon"><FaLock /></span>
                            <input
                                type={showConfirmPassword ? "text" : "password"}
                                className="auth-input"
                                placeholder="Confirm Password"
                                value={confirmPassword}
                                onChange={(e) => setConfirmPassword(e.target.value)}
                                required
                            />
                            <span 
                                className="input-toggle" 
                                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                style={{ position: 'absolute', right: '15px', cursor: 'pointer', color: '#888' }}
                            >
                                {showConfirmPassword ? <FaEyeSlash /> : <FaEye />}
                            </span>
                        </div>

                        <button type="submit" className="auth-btn" disabled={loading}>
                            {loading ? 'Creating Account...' : 'Finish Registration'}
                        </button>

                        <div className="auth-link">
                            Already have an account? <Link to="/delivery/login">Log in</Link>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default Register;
