import HomePage from '../components/HomePage';
import LoginForm from '../components/LoginForm';
import RegisterForm from '../components/RegisterForm';
import ProtectedRoute from './protectedRoute';
import GuestRoute from './guestRoute';
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
];

export default routes;
