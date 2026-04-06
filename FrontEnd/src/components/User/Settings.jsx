import React, { useState, useEffect } from 'react';
import { FiX, FiUser, FiLock, FiBell, FiMoon, FiGlobe } from 'react-icons/fi';
import axios from 'axios';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../../context/AuthContext';
import { API_BASE_URL } from '../../api/api';
import LanguagePicker, { languages } from './LanguagePicker';
import '../UserCss/Settings.css';

const Settings = ({ isOpen, onClose }) => {
    const { t, i18n } = useTranslation();
    const { token } = useAuth();
    const [activeTab, setActiveTab] = useState('profile');
    const [loading, setLoading] = useState(false);
    const [successMsg, setSuccessMsg] = useState('');
    const [errorMsg, setErrorMsg] = useState('');
    const [isLangPickerOpen, setIsLangPickerOpen] = useState(false);

    const [profile, setProfile] = useState({
        username: '',
        mail: '',
        phnno: ''
    });

    const [passwords, setPasswords] = useState({
        newPassword: '',
        confirmPassword: ''
    });

    const [preferences, setPreferences] = useState({
        notifications: true,
        darkMode: localStorage.getItem('theme') === 'dark',
        language: i18n.language || 'en'
    });

    useEffect(() => {
        if (isOpen && token) {
            fetchProfile();
        }
    }, [isOpen, token]);

    // Initial theme load
    useEffect(() => {
        const savedTheme = localStorage.getItem('theme') || 'light';
        document.documentElement.setAttribute('data-theme', savedTheme);
    }, []);

    const fetchProfile = async () => {
        try {
            const res = await axios.get(`${API_BASE_URL}/users/me`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setProfile(res.data);
        } catch (err) {
            console.error("Error fetching profile", err);
        }
    };

    const handleProfileUpdate = async (e) => {
        e.preventDefault();
        setLoading(true);
        setSuccessMsg('');
        setErrorMsg('');
        try {
            await axios.put(`${API_BASE_URL}/users/me`, profile, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setSuccessMsg('Profile updated successfully!');
            setTimeout(() => setSuccessMsg(''), 3000);
        } catch (err) {
            setErrorMsg('Failed to update profile.');
        } finally {
            setLoading(false);
        }
    };

    const handlePasswordUpdate = async (e) => {
        e.preventDefault();
        if (passwords.newPassword !== passwords.confirmPassword) {
            setErrorMsg("Passwords don't match!");
            return;
        }
        setLoading(true);
        setSuccessMsg('');
        setErrorMsg('');
        try {
            await axios.put(`${API_BASE_URL}/users/me/password`, { newPassword: passwords.newPassword }, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setSuccessMsg('Password changed successfully!');
            setPasswords({ newPassword: '', confirmPassword: '' });
            setTimeout(() => setSuccessMsg(''), 3000);
        } catch (err) {
            setErrorMsg('Failed to change password.');
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
                    <h3>{t('user_settings')}</h3>
                    <button className="close-settings" onClick={onClose}><FiX /></button>
                </div>

                <div className="settings-content">
                    <div className="settings-nav">
                        <button 
                            className={`nav-item ${activeTab === 'profile' ? 'active' : ''}`}
                            onClick={() => setActiveTab('profile')}
                        >
                            <FiUser /> <span>{t('profile')}</span>
                        </button>
                        <button 
                            className={`nav-item ${activeTab === 'security' ? 'active' : ''}`}
                            onClick={() => setActiveTab('security')}
                        >
                            <FiLock /> <span>{t('security')}</span>
                        </button>
                        <button 
                            className={`nav-item ${activeTab === 'preferences' ? 'active' : ''}`}
                            onClick={() => setActiveTab('preferences')}
                        >
                            <FiBell /> <span>{t('preferences')}</span>
                        </button>
                    </div>

                    <div className="settings-main">
                        {successMsg && <div className="settings-alert success">{t(successMsg === 'Profile updated successfully!' ? 'profile_updated' : 'password_updated')}</div>}
                        {errorMsg && <div className="settings-alert error">{t(errorMsg === "Passwords don't match!" ? 'password_mismatch' : (errorMsg === 'Failed to update profile.' ? 'failed_update' : 'failed_password'))}</div>}

                        {activeTab === 'profile' && (
                            <form className="settings-form" onSubmit={handleProfileUpdate}>
                                <div className="form-group">
                                    <label>{t('username')}</label>
                                    <input 
                                        type="text" 
                                        value={profile.username}
                                        onChange={(e) => setProfile({...profile, username: e.target.value})}
                                    />
                                </div>
                                <div className="form-group">
                                    <label>{t('email')}</label>
                                    <input 
                                        type="email" 
                                        value={profile.mail}
                                        onChange={(e) => setProfile({...profile, mail: e.target.value})}
                                    />
                                </div>
                                <div className="form-group">
                                    <label>{t('phone')}</label>
                                    <input 
                                        type="text" 
                                        value={profile.phnno}
                                        onChange={(e) => setProfile({...profile, phnno: e.target.value})}
                                    />
                                </div>
                                <button type="submit" className="save-btn" disabled={loading}>
                                    {loading ? t('saving') : t('save_changes')}
                                </button>
                            </form>
                        )}

                        {activeTab === 'security' && (
                            <form className="settings-form" onSubmit={handlePasswordUpdate}>
                                <div className="form-group">
                                    <label>{t('new_password')}</label>
                                    <input 
                                        type="password" 
                                        placeholder={t('new_password')}
                                        value={passwords.newPassword}
                                        onChange={(e) => setPasswords({...passwords, newPassword: e.target.value})}
                                    />
                                </div>
                                <div className="form-group">
                                    <label>{t('confirm_password')}</label>
                                    <input 
                                        type="password" 
                                        placeholder={t('confirm_password')}
                                        value={passwords.confirmPassword}
                                        onChange={(e) => setPasswords({...passwords, confirmPassword: e.target.value})}
                                    />
                                </div>
                                <button type="submit" className="save-btn" disabled={loading}>
                                    {loading ? t('updating') : t('update_password')}
                                </button>
                            </form>
                        )}

                        {activeTab === 'preferences' && (
                            <div className="prefs-list">
                                <div className="pref-item">
                                    <div className="pref-info">
                                        <FiBell />
                                        <span>{t('notifications')}</span>
                                    </div>
                                    <label className="toggle-switch">
                                        <input 
                                            type="checkbox" 
                                            checked={preferences.notifications}
                                            onChange={() => setPreferences({...preferences, notifications: !preferences.notifications})}
                                        />
                                        <span className="slider"></span>
                                    </label>
                                </div>
                                <div className="pref-item">
                                    <div className="pref-info">
                                        <FiMoon />
                                        <span>{t('dark_mode')}</span>
                                    </div>
                                    <label className="toggle-switch">
                                        <input 
                                            type="checkbox" 
                                            checked={preferences.darkMode}
                                            onChange={handleThemeToggle}
                                        />
                                        <span className="slider"></span>
                                    </label>
                                </div>
                                <div className="pref-item">
                                    <div className="pref-info">
                                        <FiGlobe />
                                        <span>{t('language')}</span>
                                    </div>
                                    <button 
                                        className="lang-select-trigger"
                                        onClick={() => setIsLangPickerOpen(true)}
                                    >
                                        {languages.find(l => l.code === i18n.language)?.name || 'English'}
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            <LanguagePicker 
                isOpen={isLangPickerOpen}
                onClose={() => setIsLangPickerOpen(false)}
            />
        </div>
    );
};

export default Settings;
