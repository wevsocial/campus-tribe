import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth, getRoleDashboardPath } from '../../context/AuthContext';

interface ProtectedRouteProps {
  children: React.ReactElement;
  allowedRoles?: string[];
}

export default function ProtectedRoute({ children, allowedRoles }: ProtectedRouteProps) {
  const { loading, session, user, profile, role, isEmailVerified } = useAuth();
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

  // Multi-role check: if user has roles[], any of those roles can access the route
  const userRoles: string[] = (profile as any)?.roles?.length
    ? (profile as any).roles
    : role
      ? [role]
      : [];

  if (allowedRoles && userRoles.length > 0) {
    const hasAccess = allowedRoles.some(r => userRoles.includes(r));
    if (!hasAccess) {
      // Check sessionStorage for chosen role this session
      const sessionRole = sessionStorage.getItem('ct.session-role');
      if (sessionRole && userRoles.includes(sessionRole) && allowedRoles.includes(sessionRole)) {
        // Allow — session role has access
      } else {
        // Redirect to their primary role dashboard
        return <Navigate to={getRoleDashboardPath(role)} replace />;
      }
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
