import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from './AuthContext';
import { API_BASE_URL } from '../../services/api';

const Documents = () => {
    const navigate = useNavigate();
    const { user } = useAuth();

    if (!user) return <div className="text-center mt-5" style={{ backgroundColor: '#F8F9FA' }}>Loading documents...</div>;

    const goBack = () => {
        navigate(-1);
    };

    return (
        <div className="min-vh-100 pb-5" style={{ backgroundColor: '#F8F9FA' }}>
            {/* Header */}
            <div className="bg-white d-flex justify-content-between align-items-center px-3 py-3 shadow-sm sticky-top">
                <div className="d-flex align-items-center" onClick={goBack} style={{ cursor: 'pointer' }}>
                    <i className="fas fa-arrow-left text-secondary me-2 fs-5"></i>
                    <h5 className="mb-0 fw-bold text-dark">Documents</h5>
                </div>
                <div>
                    <button className="btn btn-link text-decoration-none p-0 text-secondary d-flex align-items-center">
                        <i className="far fa-question-circle me-1"></i>
                        <span className="fw-medium">Help</span>
                    </button>
                </div>
            </div>

            <div className="container px-3 pb-4" style={{ paddingTop: '20px', maxWidth: '500px', margin: '0 auto' }}>
                <div className="card shadow-sm border-0 mb-4" style={{ borderRadius: '12px' }}>
                    <div className="card-body p-4">
                        <div className="mb-4">
                            <label className="form-label text-secondary fw-bold mb-2">Bike License</label>
                            <div className="document-preview border rounded p-2 text-center bg-light d-flex align-items-center justify-content-center" style={{ minHeight: '180px' }}>
                                <img
                                    src={`${API_BASE_URL}/partner/auth/BikeLicence/${user.id}`}
                                    alt="Bike License"
                                    className="img-fluid rounded shadow-sm"
                                    style={{ maxHeight: '200px', objectFit: 'contain' }}
                                    onError={(e) => { e.target.style.display = 'none'; e.target.parentElement.innerHTML = '<div class="text-muted small py-4"><i class="fas fa-file-image fs-1 mb-2"></i><br/>Document not available</div>'; }}
                                />
                            </div>
                        </div>

                        <div>
                            <label className="form-label text-secondary fw-bold mb-2">PAN Card</label>
                            <div className="document-preview border rounded p-2 text-center bg-light d-flex align-items-center justify-content-center" style={{ minHeight: '180px' }}>
                                <img
                                    src={`${API_BASE_URL}/partner/auth/pan/${user.id}`}
                                    alt="PAN Card"
                                    className="img-fluid rounded shadow-sm"
                                    style={{ maxHeight: '200px', objectFit: 'contain' }}
                                    onError={(e) => { e.target.style.display = 'none'; e.target.parentElement.innerHTML = '<div class="text-muted small py-4"><i class="fas fa-id-card fs-1 mb-2"></i><br/>Document not available</div>'; }}
                                />
                            </div>
                        </div>

                        <div>
                            <label className="form-label text-secondary fw-bold mb-2">Aadhar Card</label>
                            <div className="document-preview border rounded p-2 text-center bg-light d-flex align-items-center justify-content-center" style={{ minHeight: '180px' }}>
                                <img
                                    src={`${API_BASE_URL}/partner/auth/adhaar/${user.id}`}
                                    alt="Aadhar Card"
                                    className="img-fluid rounded shadow-sm"
                                    style={{ maxHeight: '200px', objectFit: 'contain' }}
                                    onError={(e) => { e.target.style.display = 'none'; e.target.parentElement.innerHTML = '<div class="text-muted small py-4"><i class="fas fa-id-card fs-1 mb-2"></i><br/>Document not available</div>'; }}
                                />
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Documents;