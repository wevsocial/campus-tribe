import React from 'react';
import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';
import LandingPage from './pages/LandingPage';
import UniversityPage from './pages/UniversityPage';
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
import StaffDashboard from './pages/dashboard/StaffDashboard';
import AboutPage from './pages/static/AboutPage';
import CareersPage from './pages/static/CareersPage';
import BlogPage from './pages/static/BlogPage';
import NewsletterPage from './pages/static/NewsletterPage';
import FeaturesGuidePage from './pages/static/FeaturesGuidePage';
import WellbeingPage from './pages/static/WellbeingPage';
import SupportPage from './pages/static/SupportPage';
import ApiDocumentationPage from './pages/static/ApiDocumentationPage';
import ProtectedRoute from './components/auth/ProtectedRoute';
import { getRoleDashboardPath, useAuth } from './context/AuthContext';

function DashboardRedirect() {
  const { role, session } = useAuth();
  return <Navigate to={session ? getRoleDashboardPath(role) : '/login'} replace />;
}

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/university" element={<UniversityPage />} />
        <Route path="/school" element={<SchoolPage />} />
        <Route path="/preschool" element={<PreschoolPage />} />
        <Route path="/demo" element={<DemoPage />} />
        <Route path="/pricing" element={<PricingPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />

        <Route path="/about" element={<AboutPage />} />
        <Route path="/careers" element={<CareersPage />} />
        <Route path="/blog" element={<BlogPage />} />
        <Route path="/newsletter" element={<NewsletterPage />} />
        <Route path="/resources/features" element={<FeaturesGuidePage />} />
        <Route path="/resources/api-documentation" element={<ApiDocumentationPage />} />
        <Route path="/resources/wellbeing" element={<WellbeingPage />} />
        <Route path="/resources/support" element={<SupportPage />} />

        <Route path="/dashboard" element={<ProtectedRoute><DashboardRedirect /></ProtectedRoute>} />
        <Route path="/dashboard/student" element={<ProtectedRoute allowedRoles={['student']}><StudentDashboard /></ProtectedRoute>} />
        <Route path="/dashboard/student-rep" element={<ProtectedRoute allowedRoles={['student_rep']}><StudentRepDashboard /></ProtectedRoute>} />
        <Route path="/dashboard/teacher" element={<ProtectedRoute allowedRoles={['teacher']}><TeacherDashboard /></ProtectedRoute>} />
        <Route path="/dashboard/admin" element={<ProtectedRoute allowedRoles={['admin']}><AdminDashboard /></ProtectedRoute>} />
        <Route path="/dashboard/staff" element={<ProtectedRoute allowedRoles={['staff']}><StaffDashboard /></ProtectedRoute>} />
        <Route path="/dashboard/club" element={<ProtectedRoute allowedRoles={['club_leader']}><ClubLeaderDashboard /></ProtectedRoute>} />
        <Route path="/dashboard/coach" element={<ProtectedRoute allowedRoles={['coach']}><CoachDashboard /></ProtectedRoute>} />
        <Route path="/dashboard/it" element={<ProtectedRoute allowedRoles={['it_director']}><ITDashboard /></ProtectedRoute>} />
        <Route path="/dashboard/parent" element={<ProtectedRoute allowedRoles={['parent']}><ParentDashboard /></ProtectedRoute>} />

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}
