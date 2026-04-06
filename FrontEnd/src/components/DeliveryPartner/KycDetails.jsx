import { useState } from 'react';
import { useAuth } from './AuthContext';
import { useNavigate } from 'react-router-dom';
import { useToast } from '../../context/ToastContext';
import { FaFingerprint, FaIdCard, FaFileImage, FaShieldAlt } from 'react-icons/fa';
import './Auth.css';

const DocumentUpload = () => {
    const [formData, setFormData] = useState({
        panNumber: '',
        aadhaarNumber: ''
    });

    const [panImage, setPanImage] = useState(null);
    const [aadhaarImage, setAadhaarImage] = useState(null);
    const [uploading, setUploading] = useState(false);

    const { uploadPanImage, uploadAadhaarImage, updateDocumentNumbers, user } = useAuth();
    const navigate = useNavigate();
    const { showToast } = useToast();

    const handlePanChange = (e) => {
        let value = e.target.value.toUpperCase().replace(/[^A-Z0-9]/g, '').slice(0, 10);
        setFormData({ ...formData, panNumber: value });
    };

    const handleAadhaarChange = (e) => {
        let value = e.target.value.replace(/\D/g, "").slice(0, 12);
        setFormData({ ...formData, aadhaarNumber: value });
    };

    const handleFileChange = (e, type) => {
        if (e.target.files && e.target.files[0]) {
            if (type === 'pan') setPanImage(e.target.files[0]);
            if (type === 'aadhaar') setAadhaarImage(e.target.files[0]);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!user || (!user.id && !user._id)) {
            showToast('Authentication lost. Please login again.', 'error');
            return;
        }

        const userId = user.id || user._id;
        const panRegex = /^[A-Z]{5}[0-9]{4}[A-Z]{1}$/;

        if (!panRegex.test(formData.panNumber)) {
            showToast("Invalid PAN format (e.g. ABCDE1234F)", "error");
            return;
        }

        if (formData.aadhaarNumber.length !== 12) {
            showToast("Aadhaar must be exactly 12 digits", "error");
            return;
        }

        if (!panImage || !aadhaarImage) {
            showToast('Please upload both document images', 'error');
            return;
        }

        setUploading(true);
        try {
            await uploadPanImage(userId, panImage);
            await uploadAadhaarImage(userId, aadhaarImage);
            await updateDocumentNumbers({
                panNumber: formData.panNumber,
                aadhaarNumber: formData.aadhaarNumber
            });
            showToast('KYC documents verified!', 'success');
            navigate('/delivery/dash');
        } catch (error) {
            console.error(error);
            showToast('Verification upload failed', 'error');
        } finally {
            setUploading(false);
        }
    };

    return (
        <div className="delivery-body">
            <div className="auth-container">
                <div className="auth-card1">
                    <h2 className="auth-title">KYC Verification</h2>
                    <p className="auth-subtitle">Identity & Tax documentation</p>

                    <form onSubmit={handleSubmit}>
                        <div className="input-group-custom">
                            <span className="input-icon"><FaShieldAlt /></span>
                            <input
                                type="text"
                                name="panNumber"
                                className="auth-input"
                                placeholder="Permanent Account Number (PAN)"
                                value={formData.panNumber}
                                onChange={handlePanChange}
                                maxLength={10}
                                required
                            />
                        </div>

                        <div className="input-group-custom">
                            <span className="input-icon"><FaFileImage /></span>
                            <input
                                type="file"
                                className="auth-input"
                                accept="image/*"
                                onChange={(e) => handleFileChange(e, 'pan')}
                                required
                                title="Upload PAN Image"
                            />
                            <small className="text-white-50 mt-1 d-block" style={{ fontSize: '0.75rem' }}>
                                Upload a clear copy of your PAN card
                            </small>
                        </div>

                        <div className="input-group-custom mt-4">
                            <span className="input-icon"><FaFingerprint /></span>
                            <input
                                type="text"
                                name="aadhaarNumber"
                                className="auth-input"
                                placeholder="Aadhaar ID (12 Digits)"
                                value={formData.aadhaarNumber}
                                onChange={handleAadhaarChange}
                                maxLength={12}
                                required
                            />
                        </div>

                        <div className="input-group-custom">
                            <span className="input-icon"><FaFileImage /></span>
                            <input
                                type="file"
                                className="auth-input"
                                accept="image/*"
                                onChange={(e) => handleFileChange(e, 'aadhaar')}
                                required
                                title="Upload Aadhaar Image"
                            />
                            <small className="text-white-50 mt-1 d-block" style={{ fontSize: '0.75rem' }}>
                                Upload front side of your Aadhaar card
                            </small>
                        </div>

                        <button type="submit" className="auth-btn" disabled={uploading}>
                            {uploading ? 'Verifying...' : 'Submit for Review'}
                        </button>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default DocumentUpload;