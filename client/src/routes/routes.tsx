import { Navigate, RouteObject } from 'react-router-dom';
import ProtectedRoute from '../features/auth/ProtectedRoute';
import HomePage from '../pages/HomePage';
import LoginPage from '../pages/LoginPage';
import RegisterPage from '../pages/RegisterPage';
import ErrorPage from '../pages/ErrorPage';
import BusinessDetailsPage from '../pages/BusinessDetailsPage';
import MyReservationsPage from '../pages/MyReservationsPage';

const Routes: RouteObject[] = [
  {
    path: '/',
    element: (
      <ProtectedRoute>
        <HomePage />
      </ProtectedRoute>
    ),
  }, 
  {
    path: '/home',
    element: <Navigate to="/" replace />,
  },
  {
    path: '/login',
    element: <LoginPage />,
  },
  {
    path: '/register',
    element: <RegisterPage />,
  },
  {
    path: '*', 
    element: <ErrorPage />,
  },
  {
    path: "/businesses/:id",
    element: (
      <ProtectedRoute>
        <BusinessDetailsPage />
      </ProtectedRoute>
    ),
  },
  {
    path: "/my-reservations",
    element: (
      <ProtectedRoute>
        <MyReservationsPage />
      </ProtectedRoute>
    ),
  },
  
];

export default Routes;
