import { Navigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext.jsx';

const PrivateRoute = ({ children }) => {
  const { token, isAuthenticated } = useAuth();

  if (!token || !isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return children;
};

export default PrivateRoute;