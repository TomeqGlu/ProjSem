import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';

export function PrivateRoute() {
  const { user, loading } = useAuth();

  if (loading) {
    return <div className="loading">Ładowanie...</div>;
  }

  return user ? <Outlet /> : <Navigate to="/login" replace />;
}