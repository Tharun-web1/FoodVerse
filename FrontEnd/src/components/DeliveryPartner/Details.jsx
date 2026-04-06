import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from './AuthContext';

const DetailItem = ({ icon, title, subtitle, actionText, actionClick }) => (
    <div className="d-flex align-items-center py-3 border-bottom border-light">
        <div className="d-flex justify-content-center align-items-center" style={{ width: '40px', color: '#6c757d' }}>
            <i className={`${icon} fs-5`}></i>
        </div>
        <div className="ms-3 flex-grow-1">
            <h6 className="mb-0 fw-bold text-dark" style={{ letterSpacing: '0.2px' }}>{title || '-'}</h6>
            <small className="text-muted">{subtitle}</small>
        </div>
        {actionText && (
            <div className="ms-2">
                <button
                    className="btn btn-link text-decoration-none p-0 fw-bold"
                    style={{ color: '#800080', fontSize: '0.9rem' }}
                    onClick={actionClick}
                >
                    {actionText}
                </button>
            </div>
        )}
    </div>
);

const Details = () => {
    const navigate = useNavigate();
    const { user } = useAuth();

    if (!user) return <div className="text-center mt-5">Loading details...</div>;

    const goBack = () => {
        navigate(-1);
    };

    return (
        <div className="min-vh-100 pb-5" style={{ backgroundColor: '#F8F9FA' }}>
            {/* Header */}
            <div className="bg-white d-flex justify-content-between align-items-center px-3 py-3 shadow-sm sticky-top">
                <div className="d-flex align-items-center cursor-pointer" onClick={goBack} style={{ cursor: 'pointer' }}>
                    <i className="fas fa-arrow-left text-secondary me-2 fs-5"></i>
                    <h5 className="mb-0 fw-bold text-dark">Details</h5>
                </div>
                <div>
                    <button className="btn btn-link text-decoration-none p-0 text-secondary d-flex align-items-center">
                        <i className="far fa-question-circle me-1"></i>
                        <span className="fw-medium">Help</span>
                    </button>
                </div>
            </div>

            <div className="container px-3 pb-4" style={{ paddingTop: '20px', maxWidth: '500px', margin: '0 auto' }}>

                {/* Personal Details */}
                <h6 className="text-secondary fw-bold mb-3 ms-1" style={{ fontSize: '0.9rem' }}>Personal Details</h6>
                <div className="card border-0 shadow-sm mb-4" style={{ borderRadius: '12px' }}>
                    <div className="card-body p-2 px-3">
                        <DetailItem
                            icon="far fa-user-circle"
                            title={user.name}
                            subtitle="Full Name"
                        />
                        <DetailItem
                            icon="fas fa-phone"
                            title={user.phone}
                            subtitle="Mobile Number"
                            actionText="Change"
                        />
                        <DetailItem
                            icon="fas fa-hashtag"
                            title={user.riderId}
                            subtitle="Rider ID"
                        />
                        <DetailItem
                            icon="far fa-calendar-alt"
                            title={user.age}
                            subtitle="Age"
                        />
                        <DetailItem
                            icon="fas fa-hashtag"
                            title={user.panNumber}
                            subtitle="PAN Number"
                        />
                        <DetailItem
                            icon="far fa-id-card"
                            title={user.aadhaarNumber}
                            subtitle="Aadhaar Number"
                        />
                        <DetailItem
                            icon="fas fa-map-marker-alt"
                            title="Hyderabad"
                            subtitle="City"
                        />
                    </div>
                </div>

                {/* Vehicle & License Details */}
                <h6 className="text-secondary fw-bold mb-3 ms-1 mt-4" style={{ fontSize: '0.9rem' }}>Vehicle & License Details</h6>
                <div className="card border-0 shadow-sm mb-4" style={{ borderRadius: '12px' }}>
                    <div className="card-body p-2 px-3">
                        <DetailItem
                            icon="fas fa-hashtag"
                            title={user.vehicleNumber}
                            subtitle="Vehicle Number"
                        />
                        <DetailItem
                            icon="fas fa-motorcycle"
                            title={user.vehicleType}
                            subtitle="Vehicle Type"
                        />
                        <DetailItem
                            icon="fas fa-hashtag"
                            title={user.licenseNumber}
                            subtitle="License Number"
                        />
                        <DetailItem
                            icon="far fa-calendar-alt"
                            title="-"
                            subtitle="License Expiry Date"
                        />
                    </div>
                </div>

            </div>
        </div>
    );
};

export default Details;
