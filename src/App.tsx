import React from 'react';
import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';
import LandingPage from './pages/LandingPage';
import UniversityPage from './pages/UniversityPage';
import SchoolPage from './pages/SchoolPage';
import PreschoolPage from './pages/PreschoolPage';
import DemoPage from './pages/DemoPage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import AuthCallback from './pages/AuthCallback';
import PricingPage from './pages/PricingPage';
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
import DashboardShell from './components/layout/DashboardShell';

// New unified platforms
import StudentPlatform from './pages/dashboard/StudentPlatform';
import TeacherPlatform from './pages/dashboard/TeacherPlatform';
import StaffPlatform from './pages/dashboard/StaffPlatform';
import AdminITPlatform from './pages/dashboard/AdminITPlatform';

// Coach (existing)
import CoachOverview from './pages/dashboard/coach/CoachOverview';
import CoachLeagues from './pages/dashboard/coach/CoachLeagues';
import CoachTeams from './pages/dashboard/coach/CoachTeams';
import CoachSchedule from './pages/dashboard/coach/CoachSchedule';
import CoachAthletes from './pages/dashboard/coach/CoachAthletes';
import CoachTraining from './pages/dashboard/coach/CoachTraining';
import CoachSettings from './pages/dashboard/coach/CoachSettings';

// Parent (existing)
import ParentOverview from './pages/dashboard/parent/ParentOverview';
import ParentChildren from './pages/dashboard/parent/ParentChildren';
import ParentReports from './pages/dashboard/parent/ParentReports';
import ParentMessages from './pages/dashboard/parent/ParentMessages';

function DashboardRedirect() {
  const { role, session } = useAuth();
  return <Navigate to={session ? getRoleDashboardPath(role) : '/login'} replace />;
}

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Public */}
        <Route path="/" element={<LandingPage />} />
        <Route path="/university" element={<UniversityPage />} />
        <Route path="/school" element={<SchoolPage />} />
        <Route path="/preschool" element={<PreschoolPage />} />
        <Route path="/demo" element={<DemoPage />} />
        <Route path="/pricing" element={<PricingPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/auth/callback" element={<AuthCallback />} />
        <Route path="/about" element={<AboutPage />} />
        <Route path="/careers" element={<CareersPage />} />
        <Route path="/blog" element={<BlogPage />} />
        <Route path="/newsletter" element={<NewsletterPage />} />
        <Route path="/resources/features" element={<FeaturesGuidePage />} />
        <Route path="/resources/api-documentation" element={<ApiDocumentationPage />} />
        <Route path="/resources/wellbeing" element={<WellbeingPage />} />
        <Route path="/resources/support" element={<SupportPage />} />

        {/* Dashboard root */}
        <Route path="/dashboard" element={<ProtectedRoute><DashboardRedirect /></ProtectedRoute>} />

        {/* Student Platform (unified: student + student_rep + club_leader) */}
        <Route path="/dashboard/student" element={<ProtectedRoute allowedRoles={['student', 'student_rep', 'club_leader']}><StudentPlatform /></ProtectedRoute>} />
        <Route path="/dashboard/student-rep" element={<Navigate to="/dashboard/student" replace />} />
        <Route path="/dashboard/club" element={<Navigate to="/dashboard/student" replace />} />

        {/* Teacher Platform */}
        <Route path="/dashboard/teacher" element={<ProtectedRoute allowedRoles={['teacher']}><TeacherPlatform /></ProtectedRoute>} />

        {/* Staff Platform */}
        <Route path="/dashboard/staff" element={<ProtectedRoute allowedRoles={['staff']}><StaffPlatform /></ProtectedRoute>} />

        {/* Admin + IT Director Platform (unified) */}
        <Route path="/dashboard/admin" element={<ProtectedRoute allowedRoles={['admin', 'it_director']}><AdminITPlatform /></ProtectedRoute>} />
        <Route path="/dashboard/it" element={<Navigate to="/dashboard/admin" replace />} />

        {/* Coach */}
        <Route path="/dashboard/coach" element={<ProtectedRoute allowedRoles={['coach']}><DashboardShell role="coach" /></ProtectedRoute>}>
          <Route index element={<Navigate to="overview" replace />} />
          <Route path="overview" element={<CoachOverview />} />
          <Route path="leagues" element={<CoachLeagues />} />
          <Route path="teams" element={<CoachTeams />} />
          <Route path="schedule" element={<CoachSchedule />} />
          <Route path="athletes" element={<CoachAthletes />} />
          <Route path="training" element={<CoachTraining />} />
          <Route path="settings" element={<CoachSettings />} />
        </Route>

        {/* Parent */}
        <Route path="/dashboard/parent" element={<ProtectedRoute allowedRoles={['parent']}><DashboardShell role="parent" /></ProtectedRoute>}>
          <Route index element={<Navigate to="overview" replace />} />
          <Route path="overview" element={<ParentOverview />} />
          <Route path="children" element={<ParentChildren />} />
          <Route path="reports" element={<ParentReports />} />
          <Route path="messages" element={<ParentMessages />} />
        </Route>

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}
