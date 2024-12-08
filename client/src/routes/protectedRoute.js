import React from 'react';
import { Navigate } from 'react-router-dom';
import { useApplicationStore } from '../store/application.store';

const ProtectedRoute = ({ children }) => {
    const isAuthenticated = useApplicationStore((state) => !!state.token);

    return isAuthenticated ? children : <Navigate to="/login" replace />;
};

export default ProtectedRoute;
