import { Navigate, RouteObject } from 'react-router-dom';
import ProtectedRoute from '../features/auth/ProtectedRoute';
import OwnerRoute from '../features/auth/OwnerRoute';
import HomePage from '../pages/HomePage';
import LoginPage from '../pages/LoginPage';
import RegisterPage from '../pages/RegisterPage';
import ErrorPage from '../pages/ErrorPage';
import BusinessDetailsPage from '../pages/BusinessDetailsPage';
import DashboardPage from '../pages/DashboardPage';
import MyBusinessPage from '../pages/MyBusinessPage';
import ServicesManagementPage from '../pages/ServicesManagementPage';
import EmployeesManagementPage from '../pages/EmployeesManagementPage';
import ReservationsPage from '../pages/ReservationsPage';

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
    element: <BusinessDetailsPage />,
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
    path: '*', 
    element: <ErrorPage />,
  },
];

export default Routes;
