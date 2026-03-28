import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth, getRoleDashboardPath } from '../../context/AuthContext';

interface ProtectedRouteProps {
  children: React.ReactElement;
  allowedRoles?: string[];
}

export default function ProtectedRoute({ children, allowedRoles }: ProtectedRouteProps) {
  const { loading, session, role } = useAuth();

  if (loading) {
    return <div className="min-h-screen bg-surface flex items-center justify-center text-on-surface-variant">Loading…</div>;
  }

  if (!session) {
    return <Navigate to="/login" replace />;
  }

  if (allowedRoles && role && !allowedRoles.includes(role)) {
    return <Navigate to={getRoleDashboardPath(role)} replace />;
  }

  return children;
}
