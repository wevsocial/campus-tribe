import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth, getRoleDashboardPath } from '../../context/AuthContext';

interface ProtectedRouteProps {
  children: React.ReactElement;
  allowedRoles?: string[];
}

export default function ProtectedRoute({ children, allowedRoles }: ProtectedRouteProps) {
  const { loading, session, user, role, isEmailVerified } = useAuth();
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

  // Email verification gate: only for email/password users, not OAuth users
  const isEmailProvider = user?.app_metadata?.provider === 'email' ||
    (user?.app_metadata?.providers as string[] | undefined)?.includes('email');
  if (isEmailProvider && !isEmailVerified) {
    const dashRoot = getRoleDashboardPath(role);
    if (location.pathname !== dashRoot) {
      return <Navigate to={dashRoot} replace />;
    }
  }

  return children;
}

