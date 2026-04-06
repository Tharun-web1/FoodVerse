import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from './AuthContext';
import Loader from '../Common/Loader';

const ProtectedRoute = () => {
    const { user, loading } = useAuth();

    if (loading) {
        return <Loader fullPage text="Authenticating..." />;
    }

    return user ? <Outlet /> : <Navigate to="/delivery/login" />;
};

export default ProtectedRoute;
