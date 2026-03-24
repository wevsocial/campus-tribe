import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useAuthStore } from './store/authStore';
import LandingPage from './pages/LandingPage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import PricingPage from './pages/PricingPage';
import StudentDashboard from './pages/dashboard/StudentDashboard';
import AdminDashboard from './pages/dashboard/AdminDashboard';
import ClubLeaderDashboard from './pages/dashboard/ClubLeaderDashboard';
import CoachDashboard from './pages/dashboard/CoachDashboard';

function ProtectedRoute({ children, allowedRoles }: { children: React.ReactElement; allowedRoles?: string[] }) {
  const { isAuthenticated, user } = useAuthStore();
  if (!isAuthenticated) return <Navigate to="/login" replace />;
  if (allowedRoles && user && !allowedRoles.includes(user.role)) return <Navigate to="/dashboard" replace />;
  return children;
}

function DashboardRedirect() {
  const { user } = useAuthStore();
  const roleMap: Record<string, string> = {
    student: '/dashboard/student',
    admin: '/dashboard/admin',
    coach: '/dashboard/coach',
    club_leader: '/dashboard/club',
    staff: '/dashboard/admin',
    it_director: '/dashboard/admin',
  };
  return <Navigate to={user ? roleMap[user.role] || '/dashboard/student' : '/login'} replace />;
}

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/pricing" element={<PricingPage />} />
        <Route path="/dashboard" element={<ProtectedRoute><DashboardRedirect /></ProtectedRoute>} />
        <Route path="/dashboard/student" element={<ProtectedRoute allowedRoles={['student']}><StudentDashboard /></ProtectedRoute>} />
        <Route path="/dashboard/admin" element={<ProtectedRoute allowedRoles={['admin', 'staff', 'it_director']}><AdminDashboard /></ProtectedRoute>} />
        <Route path="/dashboard/club" element={<ProtectedRoute allowedRoles={['club_leader']}><ClubLeaderDashboard /></ProtectedRoute>} />
        <Route path="/dashboard/coach" element={<ProtectedRoute allowedRoles={['coach']}><CoachDashboard /></ProtectedRoute>} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}
