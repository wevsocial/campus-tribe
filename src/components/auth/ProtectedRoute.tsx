import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth, getRoleDashboardPath } from '../../context/AuthContext';

interface ProtectedRouteProps {
  children: React.ReactElement;
  allowedRoles?: string[];
}

export default function ProtectedRoute({ children, allowedRoles }: ProtectedRouteProps) {
  const { loading, session, role, isEmailVerified } = useAuth();
  const location = useLocation();

  if (loading) {
    return <div className="min-h-screen bg-surface flex items-center justify-center text-on-surface-variant">Loading…</div>;
  }

  if (!session) {
    return <Navigate to="/login" replace />;
  }

  if (allowedRoles && role && !allowedRoles.includes(role)) {
    return <Navigate to={getRoleDashboardPath(role)} replace />;
  }

  // Email verification gate: if not verified, only allow dashboard root
  if (!isEmailVerified) {
    const dashRoot = getRoleDashboardPath(role);
    if (location.pathname !== dashRoot) {
      return <Navigate to={dashRoot} replace />;
    }
  }

  return children;
}
