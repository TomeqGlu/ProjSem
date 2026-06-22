import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';

export function CandidateRoute() {
  const { user, profile, loading } = useAuth();

  if (loading) {
    return <div className="loading">Ładowanie...</div>;
  }

  if (!user || profile?.role !== 'candidate') {
    return <Navigate to="/jobs" replace />;
  }

  return <Outlet />;
}