import { Link, useLocation } from 'react-router-dom';

const BottomNav = () => {
    const location = useLocation();

    // Only show on mobile (d-md-none)
    // Fixed to bottom
    const navClass = "fixed-bottom bg-white border-top shadow-lg d-md-none d-flex justify-content-around py-2";

    const isActive = (path) => location.pathname === path ? 'text-primary' : 'text-muted';

    return (
        <nav className={navClass} style={{ zIndex: 1030 }}>
            <Link to="/delivery/earnings" className={`d-flex flex-column align-items-center text-decoration-none ${isActive('/delivery/earnings')}`}>
                <i className="fas fa-wallet fs-5 mb-1"></i>
                <span style={{ fontSize: '0.75rem', fontWeight: '500' }}>Earnings</span>
            </Link>

            <Link to="/delivery/dash" className={`d-flex flex-column align-items-center text-decoration-none ${isActive('/delivery/dash')}`}>
                <i className="fas fa-home fs-5 mb-1"></i>
                <span style={{ fontSize: '0.75rem', fontWeight: '500' }}>Home</span>
            </Link>

            <Link to="/delivery/profile" className={`d-flex flex-column align-items-center text-decoration-none ${isActive('/delivery/profile')}`}>
                <i className="fas fa-user fs-5 mb-1"></i>
                <span style={{ fontSize: '0.75rem', fontWeight: '500' }}>Profile</span>
            </Link>
        </nav>
    );
};

export default BottomNav;