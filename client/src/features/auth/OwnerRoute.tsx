import { Navigate } from 'react-router-dom';
import { useAuthStore } from '../../store/application.store';

interface OwnerRouteProps {
  children: JSX.Element;
}

const OwnerRoute = ({ children }: OwnerRouteProps) => {
  const user = useAuthStore((state) => state.user);

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (user.role !== 'BUSINESS_OWNER' && user.role !== 'ADMIN') {
    return <Navigate to="/" replace />;
  }

  return children;
};

export default OwnerRoute;

