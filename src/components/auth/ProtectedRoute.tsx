import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth, getRoleDashboardPath } from '../../context/AuthContext';

interface ProtectedRouteProps {
  children: React.ReactElement;
  allowedRoles?: string[];
}

export default function ProtectedRoute({ children, allowedRoles }: ProtectedRouteProps) {
  const { loading, session, user, roles, role, isEmailVerified } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div className="min-h-screen bg-surface flex items-center justify-center">
        <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full" />
      </div>
    );
  }

  if (!session) {
    return <Navigate to="/login" replace />;
  }

  if (allowedRoles && roles.length > 0) {
    const hasAccess = allowedRoles.some(r => roles.includes(r as any));
    if (!hasAccess) {
      return <Navigate to={getRoleDashboardPath(role)} replace />;
    }
  }

  // Email verification gate: only for email/password users, not OAuth users
  const providers = (user?.app_metadata?.providers as string[] | undefined) ?? [];
  const isEmailProvider =
    user?.app_metadata?.provider === 'email' || providers.includes('email');
  if (isEmailProvider && !isEmailVerified) {
    const dashRoot = getRoleDashboardPath(role);
    if (location.pathname !== dashRoot) {
      return <Navigate to={dashRoot} replace />;
    }
  }

  return children;
}
