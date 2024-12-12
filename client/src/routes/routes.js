import HomePage from '../components/HomePage';
import LoginForm from '../components/LoginForm';
import RegisterForm from '../components/RegisterForm';
import ProtectedRoute from './protectedRoute';
import GuestRoute from './guestRoute';
import BusinessList from '../components/BusinessList';
import BusinessDetails from '../components/BusinessDetails';
import Dashboard from '../components/Dashboard';

const routes = [
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
        element: (
            <ProtectedRoute>
                <HomePage />
            </ProtectedRoute>
        ),
    },
    {
        path: '/login',
        element: (
            <GuestRoute>
                <LoginForm />
            </GuestRoute>
        ),
    },
    {
        path: '/register',
        element: (
            <GuestRoute>
                <RegisterForm />
            </GuestRoute>
        ),
    },

    {
        path: '/dashboard',
        element: (
            <ProtectedRoute allowedRoles={['OWNER']}>
                <Dashboard/>
            </ProtectedRoute>
        ),
    },

    {
        path: '/businesses',
        element: (
            <ProtectedRoute allowedRoles={['USER']}>
                <BusinessList />
            </ProtectedRoute>
        ),
    },
    {
        path: '/businesses/:id',
        element: (
            <ProtectedRoute allowedRoles={['USER']}>
                <BusinessDetails />
            </ProtectedRoute>
        ),
    },
];

export default routes;
