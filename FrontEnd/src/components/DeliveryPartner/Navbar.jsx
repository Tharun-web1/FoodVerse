import { useRef, useEffect } from 'react';
import { useAuth } from './AuthContext';
import { Link } from 'react-router-dom';
import logo from '../../assets/images/logo2.jpeg';

const Navbar = () => {
    const { user, location, logout, detectLocation } = useAuth();
    const navbarRef = useRef(null);

    useEffect(() => {
        const handleScroll = () => {
            const collapseElement = document.getElementById('navbarNav');
            if (collapseElement && collapseElement.classList.contains('show')) {
                collapseElement.classList.remove('show');
            }
        };

        const handleClickOutside = (event) => {
            const collapseElement = document.getElementById('navbarNav');
            const toggler = document.querySelector('.navbar-toggler');

            if (collapseElement && collapseElement.classList.contains('show')) {
                // If click is on the toggler, let Bootstrap handle it
                if (toggler && toggler.contains(event.target)) {
                    return;
                }
                // Otherwise close it (click outside or click on link)
                collapseElement.classList.remove('show');
            }
        };

        window.addEventListener('scroll', handleScroll);
        document.addEventListener('click', handleClickOutside);

        return () => {
            window.removeEventListener('scroll', handleScroll);
            document.removeEventListener('click', handleClickOutside);
        };
    }, []);

    return (
        <nav className="navbar navbar-expand-md navbar-light bg-white shadow-sm fixed-top" ref={navbarRef}>

            <Link className="navbar-brand fw-bold text-primary d-flex align-items-center" to="/delivery/dash">
                <img src={logo} alt="Delivery Logo" className="me-2 d-none d-md-block" style={{ marginLeft: "100px", width: "36px", height: "36px", borderRadius: "50%", objectFit: "cover" }} />
                <span className="d-none d-md-block">DeliveryPartner</span>
                <div
                    className="d-md-none d-flex align-items-center text-dark"
                    style={{ maxWidth: '200px', cursor: 'pointer' }}
                    onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        detectLocation();
                    }}
                >
                    <i className="fas fa-map-marker-alt text-danger me-2" style={{ "marginLeft": "10px" }}></i>
                    <span className="text-truncate fs-6">{location?.address || 'Locating...'}</span>
                </div>
            </Link>
            <Link to="/delivery/profile" className="d-md-none text-decoration-none" style={{ "marginRight": "10px" }}>
                <img
                    src={`http://localhost:8082/partner/auth/userimg/${user?.id}`}
                    alt="Profile"
                    className="rounded-circle border border-primary shadow-sm"
                    style={{ width: '40px', height: '40px', objectFit: 'cover' }}
                    onError={(e) => {
                        e.target.style.display = 'none';
                        e.target.nextSibling.style.display = 'block';
                    }}
                />
                <i className="fas fa-user-circle fa-2x text-primary" style={{ display: 'none' }}></i>
            </Link>
            <div className="collapse navbar-collapse" id="navbarNav">
                <ul className="navbar-nav ms-auto align-items-center" style={{ "marginRight": "80px" }}>
                    <li className="nav-item me-3 text-muted d-none d-md-block">
                        <i className="fas fa-map-marker-alt me-1 text-danger"></i>
                        <small>{location?.address}</small>
                    </li>
                    <li className="nav-item">
                        <Link className="nav-link" to="/delivery/profile">Profile</Link>
                    </li>
                    <li className="nav-item">
                        <Link className="nav-link" to="/delivery/earnings">Earnings</Link>
                    </li>
                    <li className="nav-item">
                        <Link className="nav-link" to="/delivery/history">History</Link>
                    </li>
                    <li className="nav-item">
                        <button className="btn btn-outline-danger btn-sm ms-2" onClick={logout}>Logout</button>
                    </li>
                </ul>
            </div>

        </nav>
    );
};

export default Navbar;
