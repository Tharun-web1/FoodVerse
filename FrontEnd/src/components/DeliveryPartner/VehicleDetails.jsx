import { useState } from 'react';
import { useAuth } from './AuthContext';
import { useNavigate } from 'react-router-dom';
import { useToast } from '../../context/ToastContext';
import { FaMotorcycle, FaIdCard, FaFileImage, FaCheckCircle, FaCar, FaBicycle } from 'react-icons/fa';
import './Auth.css';

const VehicleDetails = () => {
    const [formData, setFormData] = useState({
        vehicleType: 'Bike',
        vehicleNumber: '',
        licenseNumber: ''
    });
    const [licenseImage, setLicenseImage] = useState(null);
    const [uploading, setUploading] = useState(false);

    const { updateVehicleDetails, uploadLicenseImage, user } = useAuth();
    const navigate = useNavigate();
    const { showToast } = useToast();

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleFileChange = (e) => {
        if (e.target.files && e.target.files[0]) {
            setLicenseImage(e.target.files[0]);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (formData.vehicleType !== 'Electric Vehicle' && (!formData.vehicleNumber || !formData.licenseNumber || !licenseImage)) {
            showToast('Please fill all details and upload license image', 'error');
            return;
        }

        if (!user || (!user.id && !user._id)) {
            showToast('User context lost. Please login again.', 'error');
            return;
        }

        const userId = user.id || user._id;

        setUploading(true);
        try {
            await updateVehicleDetails(formData);
            if (formData.vehicleType !== 'Electric Vehicle' && licenseImage) {
                await uploadLicenseImage(userId, licenseImage);
            }
            showToast('Vehicle configuration saved!', 'success');
            navigate('/delivery/kycdocuments');
        } catch (error) {
            console.error(error);
            showToast('Failed to save vehicle data', 'error');
        } finally {
            setUploading(false);
        }
    };

    const getVehicleIcon = () => {
        switch(formData.vehicleType) {
            case 'Car': return <FaCar />;
            case 'Bicycle': return <FaBicycle />;
            default: return <FaMotorcycle />;
        }
    };

    return (
        <div className="delivery-body">
            <div className="auth-container">
                <div className="auth-card1">
                    <h2 className="auth-title">Vehicle Setup</h2>
                    <p className="auth-subtitle">Configure your delivery mode</p>
                    
                    <form onSubmit={handleSubmit}>
                        <div className="input-group-custom">
                            <span className="input-icon">{getVehicleIcon()}</span>
                            <select
                                name="vehicleType"
                                className="auth-input"
                                value={formData.vehicleType}
                                onChange={handleChange}
                                style={{ appearance: 'none' }}
                            >
                                <option value="Bike">Bike / Motorcycle</option>
                                <option value="Scooter">Scooter</option>
                                <option value="Car">Car</option>
                                <option value="Bicycle">Bicycle</option>
                                <option value="Electric Vehicle">Electric Vehicle</option>
                            </select>
                        </div>

                        {formData.vehicleType !== 'Electric Vehicle' && (
                            <>
                                <div className="input-group-custom">
                                    <span className="input-icon"><FaIdCard /></span>
                                    <input
                                        type="text"
                                        name="vehicleNumber"
                                        className="auth-input"
                                        placeholder="Plate Number (e.g. KA-01-AB-1234)"
                                        value={formData.vehicleNumber}
                                        onChange={handleChange}
                                        required
                                    />
                                </div>

                                <div className="input-group-custom">
                                    <span className="input-icon"><FaIdCard /></span>
                                    <input
                                        type="text"
                                        name="licenseNumber"
                                        className="auth-input"
                                        placeholder="Driving License Number"
                                        value={formData.licenseNumber}
                                        onChange={handleChange}
                                        required
                                    />
                                </div>

                                <div className="input-group-custom">
                                    <span className="input-icon"><FaFileImage /></span>
                                    <input
                                        type="file"
                                        className="auth-input"
                                        accept="image/*"
                                        onChange={handleFileChange}
                                        required
                                        title="Upload License Image"
                                    />
                                    <small className="text-white-50 mt-1 d-block" style={{ fontSize: '0.75rem' }}>
                                        Upload a clear photo of your driving license
                                    </small>
                                </div>
                            </>
                        )}

                        <button type="submit" className="auth-btn" disabled={uploading}>
                            {uploading ? 'Processing...' : 'Continue to KYC'}
                        </button>
                    </form>
                </div>
            </div>
        </div>
    );
};


export default VehicleDetails;
