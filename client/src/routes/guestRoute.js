import React from 'react';
import { Navigate } from 'react-router-dom';
import { useApplicationStore } from '../store/application.store';

const GuestRoute = ({ children, redirectPath = '/' }) => {
    const isAuthenticated = useApplicationStore((state) => !!state.token);

    return isAuthenticated ? <Navigate to={redirectPath} replace /> : children;
};


export default GuestRoute;
