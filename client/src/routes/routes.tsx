import { Navigate, RouteObject } from 'react-router-dom';
import ProtectedRoute from '../features/auth/ProtectedRoute';
import OwnerRoute from '../features/auth/OwnerRoute';
import AdminRoute from '../features/auth/AdminRoute';

import LoginPage from '../pages/auth/LoginPage';
import RegisterPage from '../pages/auth/RegisterPage';

import HomePage from '../pages/public/HomePage';
import BusinessDetailsPage from '../pages/public/BusinessDetailsPage';

import MyReservationsPage from '../pages/user/MyReservationsPage';

import DashboardPage from '../pages/owner/DashboardPage';
import MyBusinessPage from '../pages/owner/MyBusinessPage';

import ServicesManagementPage from '../pages/owner/management/ServicesManagementPage';
import EmployeesManagementPage from '../pages/owner/management/EmployeesManagementPage';
import ReservationsPage from '../pages/owner/management/ReservationsPage';

import AdminDashboard from '../pages/admin/AdminDashboard';

// Error page
import ErrorPage from '../pages/ErrorPage';

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
    path: '/businesses/:id',
    element: (
      <ProtectedRoute>
        <BusinessDetailsPage />
      </ProtectedRoute>
    ),
  },
  {
    path: '/my-reservations',
    element: (
      <ProtectedRoute>
        <MyReservationsPage />
      </ProtectedRoute>
    ),
  },
  {
    path: '/dashboard',
    element: (
      <OwnerRoute>
        <DashboardPage />
      </OwnerRoute>
    ),
  },
  {
    path: '/dashboard/business',
    element: (
      <OwnerRoute>
        <MyBusinessPage />
      </OwnerRoute>
    ),
  },
  {
    path: '/dashboard/services',
    element: (
      <OwnerRoute>
        <ServicesManagementPage />
      </OwnerRoute>
    ),
  },
  {
    path: '/dashboard/employees',
    element: (
      <OwnerRoute>
        <EmployeesManagementPage />
      </OwnerRoute>
    ),
  },
  {
    path: '/dashboard/reservations',
    element: (
      <OwnerRoute>
        <ReservationsPage />
      </OwnerRoute>
    ),
  },
  {
    path: '/admin',
    element: (
      <AdminRoute>
        <AdminDashboard />
      </AdminRoute>
    ),
  },
  {
    path: '*', 
    element: <ErrorPage />,
  },
];

export default Routes;
