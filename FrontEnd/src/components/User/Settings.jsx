import { useState, useEffect } from 'react';
import { FiX, FiLock, FiBell, FiMoon, FiChevronRight } from 'react-icons/fi';
import axios from 'axios';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../../context/AuthContext';
import { API_BASE_URL } from '../../api/api';
import '../UserCss/Settings.css';

const Settings = ({ isOpen, onClose }) => {
    const { t } = useTranslation();
    const { token } = useAuth();
    const [loading, setLoading] = useState(false);
    const [successMsg, setSuccessMsg] = useState('');
    const [errorMsg, setErrorMsg] = useState('');
    const [isPasswordExpanded, setIsPasswordExpanded] = useState(false);

    const [passwords, setPasswords] = useState({
        newPassword: '',
        confirmPassword: ''
    });

    const [preferences, setPreferences] = useState({
        notifications: true,
        darkMode: localStorage.getItem('theme') === 'dark'
    });

    // Initial theme load
    useEffect(() => {
        const savedTheme = localStorage.getItem('theme') || 'light';
        document.documentElement.setAttribute('data-theme', savedTheme);
    }, []);

    const handlePasswordUpdate = async (e) => {
        e.preventDefault();
        if (passwords.newPassword !== passwords.confirmPassword) {
            setErrorMsg(t('password_mismatch', "Passwords don't match!"));
            return;
        }
        setLoading(true);
        setSuccessMsg('');
        setErrorMsg('');
        try {
            await axios.put(`${API_BASE_URL}/users/me/password`, 
                { password: passwords.newPassword }, 
                { headers: { Authorization: `Bearer ${token}` } }
            );
            setSuccessMsg(t('password_updated', 'Password changed successfully!'));
            setPasswords({ newPassword: '', confirmPassword: '' });
            setIsPasswordExpanded(false);
            setTimeout(() => setSuccessMsg(''), 3000);
        } catch (err) {
            setErrorMsg(t('failed_password', 'Failed to change password.'));
        } finally {
            setLoading(false);
        }
    };

    const handleThemeToggle = () => {
        const newDarkMode = !preferences.darkMode;
        setPreferences({ ...preferences, darkMode: newDarkMode });
        const theme = newDarkMode ? 'dark' : 'light';
        document.documentElement.setAttribute('data-theme', theme);
        localStorage.setItem('theme', theme);
    };

    if (!isOpen) return null;

    return (
        <div className="settings-overlay">
            <div className="settings-window">
                <div className="settings-header">
                    <h3>{t('user_settings', 'User Settings')}</h3>
                    <button className="close-settings" onClick={onClose} aria-label="Close settings"><FiX /></button>
                </div>

                <div className="settings-main">
                    {successMsg && <div className="settings-alert success">{successMsg}</div>}
                    {errorMsg && <div className="settings-alert error">{errorMsg}</div>}

                    <div className="settings-list">
                        {/* CHANGE PASSWORD ACCORDION */}
                        <div className={`settings-list-item-wrapper ${isPasswordExpanded ? 'expanded' : ''}`}>
                            <div 
                                className="settings-list-item" 
                                onClick={() => setIsPasswordExpanded(!isPasswordExpanded)}
                            >
                                <div className="item-left">
                                    <FiLock className="item-icon" />
                                    <span>{t('change_password', 'Change Password')}</span>
                                </div>
                                <FiChevronRight className={`chevron-right ${isPasswordExpanded ? 'rotate-down' : ''}`} />
                            </div>

                            {isPasswordExpanded && (
                                <form className="settings-expanded-form" onSubmit={handlePasswordUpdate}>
                                    <div className="form-group">
                                        <label>{t('new_password', 'New Password')}</label>
                                        <input 
                                            type="password" 
                                            placeholder={t('new_password', 'New Password')}
                                            value={passwords.newPassword}
                                            onChange={(e) => setPasswords({...passwords, newPassword: e.target.value})}
                                            required
                                        />
                                    </div>
                                    <div className="form-group">
                                        <label>{t('confirm_password', 'Confirm Password')}</label>
                                        <input 
                                            type="password" 
                                            placeholder={t('confirm_password', 'Confirm Password')}
                                            value={passwords.confirmPassword}
                                            onChange={(e) => setPasswords({...passwords, confirmPassword: e.target.value})}
                                            required
                                        />
                                    </div>
                                    <button type="submit" className="save-btn" disabled={loading}>
                                        {loading ? t('updating', 'Updating...') : t('update_password', 'Update Password')}
                                    </button>
                                </form>
                            )}
                        </div>

                        {/* NOTIFICATIONS SWITCH */}
                        <div className="settings-list-item">
                            <div className="item-left">
                                <FiBell className="item-icon" />
                                <span>{t('notifications', 'Notifications')}</span>
                            </div>
                            <label className="settings-toggle-switch">
                                <input 
                                    type="checkbox" 
                                    checked={preferences.notifications}
                                    onChange={() => setPreferences({...preferences, notifications: !preferences.notifications})}
                                />
                                <span className="slider"></span>
                            </label>
                        </div>

                        {/* DARK MODE SWITCH */}
                        <div className="settings-list-item">
                            <div className="item-left">
                                <FiMoon className="item-icon" />
                                <span>{t('dark_mode', 'Dark Mode')}</span>
                            </div>
                            <label className="settings-toggle-switch">
                                <input 
                                    type="checkbox" 
                                    checked={preferences.darkMode}
                                    onChange={handleThemeToggle}
                                />
                                <span className="slider"></span>
                            </label>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Settings;
