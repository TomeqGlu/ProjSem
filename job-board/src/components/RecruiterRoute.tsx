// src/components/RecruiterRoute.tsx
import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';

export function RecruiterRoute() {
  const { user, profile, loading } = useAuth();

  if (loading) {
    return <div className="loading">Ładowanie...</div>;
  }

  if (!user || profile?.role !== 'recruiter') {
    return <Navigate to="/jobs" replace />;
  }

  return <Outlet />;
}