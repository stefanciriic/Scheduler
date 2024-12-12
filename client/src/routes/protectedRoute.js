import React from 'react';
import { Navigate } from 'react-router-dom';
import { useApplicationStore } from '../store/application.store';

const ProtectedRoute = ({ children, allowedRoles = [] }) => {
    const token = useApplicationStore((state) => state.token);
    const user = useApplicationStore((state) => state.user); 

    if (!token) {
        return <Navigate to="/login" replace />;
    }

    if (allowedRoles.length > 0 && (!user || !allowedRoles.includes(user.role))) {
        return <Navigate to="/" replace />; // Redirect to home or an error page if unauthorized
    }

    return children;
};

export default ProtectedRoute;
