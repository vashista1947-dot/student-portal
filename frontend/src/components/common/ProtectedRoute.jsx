import { Navigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import Loader from './Loader';

const ProtectedRoute = ({ children, roles, allowedRoles }) => {
  const { user, loading } = useAuth();
  const targetRoles = allowedRoles || roles;

  if (loading) return <Loader />;

  if (!user) return <Navigate to="/login" replace />;

  const userRoles = [user.role];
  if ((user.role === 'admin' || user.role === 'super_admin') && user.rollNumber) {
    userRoles.push('student');
  }

  if (targetRoles && !targetRoles.some(role => userRoles.includes(role))) {
    return <Navigate to="/login" replace />;
  }

  return children;
};

export default ProtectedRoute;