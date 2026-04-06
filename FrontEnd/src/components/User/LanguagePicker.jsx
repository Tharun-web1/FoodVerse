import React from 'react';
import { useTranslation } from 'react-i18next';
import { FiX, FiCheck } from 'react-icons/fi';
import '../UserCss/LanguagePicker.css';

export const languages = [
    { code: 'en', name: 'English', native: 'English', flag: '🇺🇸' },
    { code: 'hi', name: 'Hindi', native: 'हिन्दी', flag: '🇮🇳' },
    { code: 'te', name: 'Telugu', native: 'తెలుగు', flag: '🇮🇳' },
    { code: 'kn', name: 'Kannada', native: 'ಕನ್ನಡ', flag: '🇮🇳' },
    { code: 'ta', name: 'Tamil', native: 'தமிழ்', flag: '🇮🇳' },
    { code: 'ml', name: 'Malayalam', native: 'മലയാളం', flag: '🇮🇳' }
];

const LanguagePicker = ({ isOpen, onClose }) => {
    const { t, i18n } = useTranslation();

    if (!isOpen) return null;

    const handleLanguageChange = (code) => {
        i18n.changeLanguage(code);
        onClose();
    };

    return (
        <div className="lang-picker-overlay" onClick={onClose}>
            <div className="lang-picker-modal" onClick={e => e.stopPropagation()}>
                <div className="lang-picker-header">
                    <h3>{t('select_language')}</h3>
                    <button className="close-btn" onClick={onClose}><FiX /></button>
                </div>
                <div className="lang-grid">
                    {languages.map(lang => (
                        <button 
                            key={lang.code}
                            className={`lang-option ${i18n.language === lang.code ? 'active' : ''}`}
                            onClick={() => handleLanguageChange(lang.code)}
                        >
                            <span className="lang-flag">{lang.flag}</span>
                            <div className="lang-info">
                                <span className="lang-name">{lang.name}</span>
                                <span className="lang-native">{lang.native}</span>
                            </div>
                            {i18n.language === lang.code && <FiCheck className="check-icon" />}
                        </button>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default LanguagePicker;
