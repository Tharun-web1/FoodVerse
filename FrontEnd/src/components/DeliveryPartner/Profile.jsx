import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from './AuthContext';
import { useToast } from '../../context/ToastContext';
import BottomNav from './BottomNav';

// Helper component for list items
const MenuListItem = ({ icon, title, color, onClick }) => (
    <button className="list-group-item list-group-item-action d-flex align-items-center py-3 px-4 border-bottom border-light" onClick={onClick}>
        <div className="d-flex justify-content-center align-items-center" style={{ width: '40px' }}>
            <i className={`${icon} fs-5`} style={{ color: color }}></i>
        </div>
        <span className="fs-6 text-dark fw-medium ms-2">{title}</span>
    </button>
);

const Profile = () => {
    const { user, logout, uploadProfileImage } = useAuth();
    const { showToast } = useToast();
    const navigate = useNavigate();
    const [uploadingImage, setUploadingImage] = useState(false);

    const handleImageUpload = async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        try {
            setUploadingImage(true);
            await uploadProfileImage(user.id, file);
            showToast("Profile image uploaded successfully!", "success");
            // Force reload to get the new image
            window.location.reload();
        } catch (error) {
            console.error("Failed to upload profile image", error);
            showToast("Failed to upload profile image. Please try again.", "error");
        } finally {
            setUploadingImage(false);
        }
    };

    if (!user) return <div className="text-center mt-5">Loading profile...</div>;

    const nameParts = user.name ? user.name.split(' ') : ['Partner'];
    const firstName = nameParts[0];
    const lastName = nameParts.slice(1).join(' ');

    return (
        <>
            <div className="min-vh-100 pb-5" style={{ backgroundColor: '#FCFAFC' }}>
                <div className="container px-3" style={{ paddingTop: '20px', paddingBottom: '70px', maxWidth: '500px', margin: '0 auto' }}>

                    {/* Profile Card */}
                    <div className="card border-0 mb-3 shadow-sm position-relative overflow-hidden" style={{ borderRadius: '16px', background: '#fff' }}>
                        <div className="card-body p-3">
                            <div className="d-flex align-items-center mb-4 position-relative z-1">
                                <div className="position-relative me-3 ms-2">
                                    <img
                                        src={`http://localhost:8082/partner/auth/userimg/${user.id}`}
                                        alt="Profile"
                                        className="rounded-circle"
                                        style={{ width: '90px', height: '90px', objectFit: 'cover', border: '3px solid #fff', boxShadow: '0 2px 10px rgba(0,0,0,0.1)' }}
                                        onError={(e) => {
                                            e.target.style.display = 'none';
                                            e.target.nextSibling.style.display = 'block';
                                        }}
                                    />
                                    <i className="fas fa-user-circle text-secondary" style={{ fontSize: '90px', display: 'none' }}></i>

                                    <label className="position-absolute d-flex justify-content-center align-items-center shadow-sm" style={{ bottom: '-2px', right: '-2px', width: '32px', height: '32px', backgroundColor: '#F3E8F8', borderRadius: '50%', cursor: 'pointer', border: '2px solid white' }}>
                                        <i className={`fas ${uploadingImage ? 'fa-spinner fa-spin' : 'fa-camera'}`} style={{ color: '#800080', fontSize: '14px' }}></i>
                                        <input
                                            type="file"
                                            className="d-none"
                                            accept="image/*"
                                            capture="environment"
                                            onChange={handleImageUpload}
                                            disabled={uploadingImage}
                                        />
                                    </label>
                                </div>
                                <div className="mt-2">
                                    <h2 className="mb-0 fw-bold text-dark" style={{ letterSpacing: '-0.5px' }}>{firstName}</h2>
                                    <p className="text-secondary mb-0" style={{ fontSize: '1.2rem', marginTop: '-2px' }}>{lastName}</p>
                                </div>
                            </div>
                        </div>

                        {/* View Details Button inside card but bottom right */}
                        <div className="position-absolute bg-light" style={{ bottom: '0', right: '0', borderTopLeftRadius: '16px', backgroundColor: '#F3E8F8 !important' }}>
                            <button
                                className="btn border-0 py-2 px-3 fw-bold shadow-none"
                                style={{ color: '#800080', fontSize: '0.9rem' }}
                                onClick={() => navigate('/delivery/details')}
                            >
                                View Details <i className="fas fa-arrow-right ms-1"></i>
                            </button>
                        </div>
                    </div>

                    <div className="bg-white shadow-sm border-0 mb-4" style={{ borderRadius: '12px', overflow: 'hidden' }}>
                        <div className="list-group list-group-flush">
                            <MenuListItem icon="fas fa-file" title="Documents" color="#ea8614ff" onClick={() => navigate('/delivery/documents')} />
                            <MenuListItem icon="fas fa-shopping-bag" title="Order History" color="#ea8614ff" onClick={() => navigate('/delivery/history')} />
                            <MenuListItem icon="fas fa-inr" title="Cash Balance" color="#ea8614ff" onClick={() => navigate('/delivery/earnings')} />
                            <MenuListItem icon="far fa-bell" title="Message Centre" color="#ea8614ff" onClick={() => navigate('/delivery/message')} />
                            <MenuListItem icon="far fa-question-circle" title="Help & Support" color="#ea8614ff" onClick={() => navigate('/delivery/help')} />
                            <MenuListItem icon="fas fa-info-circle" title="About" color="#ea8614ff" onClick={() => navigate('/delivery/about')} />
                        </div>
                    </div>

                    <div className="mt-4 text-center">
                        <button className="btn btn-outline-danger fw-medium" onClick={logout}>
                            <i className="fas fa-sign-out-alt me-2"></i> Logout
                        </button>
                    </div>
                </div>
            </div>
            <BottomNav />
        </>
    );
};

export default Profile;