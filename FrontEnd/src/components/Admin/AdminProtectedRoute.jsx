import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

const AdminProtectedRoute = () => {
    const { user, token } = useAuth();

    if (!token) {
        return <Navigate to="/login/user" replace />;
    }

    if (user && user.role !== 'ADMIN') {
        return <Navigate to="/user" replace />;
    }

    return <Outlet />;
};

export default AdminProtectedRoute;
