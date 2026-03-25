import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useAuthStore } from './store/authStore';
import LandingPage from './pages/LandingPage';
import SchoolPage from './pages/SchoolPage';
import PreschoolPage from './pages/PreschoolPage';
import DemoPage from './pages/DemoPage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import PricingPage from './pages/PricingPage';
import StudentDashboard from './pages/dashboard/StudentDashboard';
import StudentRepDashboard from './pages/dashboard/StudentRepDashboard';
import TeacherDashboard from './pages/dashboard/TeacherDashboard';
import AdminDashboard from './pages/dashboard/AdminDashboard';
import ClubLeaderDashboard from './pages/dashboard/ClubLeaderDashboard';
import CoachDashboard from './pages/dashboard/CoachDashboard';
import ITDashboard from './pages/dashboard/ITDashboard';
import ParentDashboard from './pages/dashboard/ParentDashboard';

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
    student_rep: '/dashboard/student-rep',
    admin: '/dashboard/admin',
    coach: '/dashboard/coach',
    club_leader: '/dashboard/club',
    staff: '/dashboard/admin',
    it_director: '/dashboard/it',
    teacher: '/dashboard/teacher',
    parent: '/dashboard/parent',
  };
  return <Navigate to={user ? roleMap[user.role] || '/dashboard/student' : '/login'} replace />;
}

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Public marketing pages */}
        <Route path="/" element={<LandingPage />} />
        <Route path="/school" element={<SchoolPage />} />
        <Route path="/preschool" element={<PreschoolPage />} />
        <Route path="/demo" element={<DemoPage />} />
        <Route path="/pricing" element={<PricingPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />

        {/* Dashboard routing */}
        <Route path="/dashboard" element={<ProtectedRoute><DashboardRedirect /></ProtectedRoute>} />
        <Route path="/dashboard/student" element={<ProtectedRoute allowedRoles={['student']}><StudentDashboard /></ProtectedRoute>} />
        <Route path="/dashboard/student-rep" element={<ProtectedRoute allowedRoles={['student_rep']}><StudentRepDashboard /></ProtectedRoute>} />
        <Route path="/dashboard/teacher" element={<ProtectedRoute allowedRoles={['teacher']}><TeacherDashboard /></ProtectedRoute>} />
        <Route path="/dashboard/admin" element={<ProtectedRoute allowedRoles={['admin', 'staff']}><AdminDashboard /></ProtectedRoute>} />
        <Route path="/dashboard/club" element={<ProtectedRoute allowedRoles={['club_leader']}><ClubLeaderDashboard /></ProtectedRoute>} />
        <Route path="/dashboard/coach" element={<ProtectedRoute allowedRoles={['coach']}><CoachDashboard /></ProtectedRoute>} />
        <Route path="/dashboard/it" element={<ProtectedRoute allowedRoles={['it_director']}><ITDashboard /></ProtectedRoute>} />
        <Route path="/dashboard/parent" element={<ProtectedRoute allowedRoles={['parent']}><ParentDashboard /></ProtectedRoute>} />

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}
