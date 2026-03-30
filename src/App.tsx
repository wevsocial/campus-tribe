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

// Admin
import AdminOverview from './pages/dashboard/admin/AdminOverview';
import AdminClubs from './pages/dashboard/admin/AdminClubs';
import AdminEvents from './pages/dashboard/admin/AdminEvents';
import AdminVenues from './pages/dashboard/admin/AdminVenues';
import AdminSports from './pages/dashboard/admin/AdminSports';
import AdminReports from './pages/dashboard/admin/AdminReports';
import AdminSettings from './pages/dashboard/admin/AdminSettings';

// Student
import StudentHome from './pages/dashboard/student/StudentHome';
import StudentDiscover from './pages/dashboard/student/StudentDiscover';
import StudentEvents from './pages/dashboard/student/StudentEvents';
import StudentSports from './pages/dashboard/student/StudentSports';
import StudentWellness from './pages/dashboard/student/StudentWellness';
import StudentSurveys from './pages/dashboard/student/StudentSurveys';

// IT
import ITOverview from './pages/dashboard/it/ITOverview';
import ITUsers from './pages/dashboard/it/ITUsers';
import ITApiKeys from './pages/dashboard/it/ITApiKeys';
import ITAudit from './pages/dashboard/it/ITAudit';
import ITIntegrations from './pages/dashboard/it/ITIntegrations';
import ITSettings from './pages/dashboard/it/ITSettings';

// Coach
import CoachOverview from './pages/dashboard/coach/CoachOverview';
import CoachLeagues from './pages/dashboard/coach/CoachLeagues';
import CoachTeams from './pages/dashboard/coach/CoachTeams';
import CoachSchedule from './pages/dashboard/coach/CoachSchedule';
import CoachAthletes from './pages/dashboard/coach/CoachAthletes';

// Teacher
import TeacherOverview from './pages/dashboard/teacher/TeacherOverview';
import TeacherCourses from './pages/dashboard/teacher/TeacherCourses';
import TeacherSurveys from './pages/dashboard/teacher/TeacherSurveys';

// Club Leader
import ClubLeaderOverview from './pages/dashboard/club/ClubLeaderOverview';
import ClubLeaderMembers from './pages/dashboard/club/ClubLeaderMembers';
import ClubLeaderEvents from './pages/dashboard/club/ClubLeaderEvents';
import ClubLeaderBudget from './pages/dashboard/club/ClubLeaderBudget';

// Student Rep
import StudentRepOverview from './pages/dashboard/student-rep/StudentRepOverview';
import StudentRepVenues from './pages/dashboard/student-rep/StudentRepVenues';
import StudentRepEvents from './pages/dashboard/student-rep/StudentRepEvents';
import StudentRepAnnouncements from './pages/dashboard/student-rep/StudentRepAnnouncements';

// Parent
import ParentOverview from './pages/dashboard/parent/ParentOverview';
import ParentChildren from './pages/dashboard/parent/ParentChildren';
import ParentReports from './pages/dashboard/parent/ParentReports';
import ParentMessages from './pages/dashboard/parent/ParentMessages';

// Staff
import StaffOverview from './pages/dashboard/staff/StaffOverview';
import StaffReports from './pages/dashboard/staff/StaffReports';
import StaffUpdates from './pages/dashboard/staff/StaffUpdates';

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

        {/* Admin */}
        <Route path="/dashboard/admin" element={<ProtectedRoute allowedRoles={['admin']}><DashboardShell role="admin" /></ProtectedRoute>}>
          <Route index element={<Navigate to="overview" replace />} />
          <Route path="overview" element={<AdminOverview />} />
          <Route path="clubs" element={<AdminClubs />} />
          <Route path="events" element={<AdminEvents />} />
          <Route path="venues" element={<AdminVenues />} />
          <Route path="sports" element={<AdminSports />} />
          <Route path="reports" element={<AdminReports />} />
          <Route path="settings" element={<AdminSettings />} />
        </Route>

        {/* Student */}
        <Route path="/dashboard/student" element={<ProtectedRoute allowedRoles={['student']}><DashboardShell role="student" /></ProtectedRoute>}>
          <Route index element={<Navigate to="home" replace />} />
          <Route path="home" element={<StudentHome />} />
          <Route path="discover" element={<StudentDiscover />} />
          <Route path="events" element={<StudentEvents />} />
          <Route path="sports" element={<StudentSports />} />
          <Route path="wellness" element={<StudentWellness />} />
          <Route path="surveys" element={<StudentSurveys />} />
        </Route>

        {/* IT Director */}
        <Route path="/dashboard/it" element={<ProtectedRoute allowedRoles={['it_director']}><DashboardShell role="it_director" /></ProtectedRoute>}>
          <Route index element={<Navigate to="overview" replace />} />
          <Route path="overview" element={<ITOverview />} />
          <Route path="users" element={<ITUsers />} />
          <Route path="api-keys" element={<ITApiKeys />} />
          <Route path="audit" element={<ITAudit />} />
          <Route path="integrations" element={<ITIntegrations />} />
          <Route path="settings" element={<ITSettings />} />
        </Route>

        {/* Coach */}
        <Route path="/dashboard/coach" element={<ProtectedRoute allowedRoles={['coach']}><DashboardShell role="coach" /></ProtectedRoute>}>
          <Route index element={<Navigate to="overview" replace />} />
          <Route path="overview" element={<CoachOverview />} />
          <Route path="leagues" element={<CoachLeagues />} />
          <Route path="teams" element={<CoachTeams />} />
          <Route path="schedule" element={<CoachSchedule />} />
          <Route path="athletes" element={<CoachAthletes />} />
        </Route>

        {/* Teacher */}
        <Route path="/dashboard/teacher" element={<ProtectedRoute allowedRoles={['teacher']}><DashboardShell role="teacher" /></ProtectedRoute>}>
          <Route index element={<Navigate to="overview" replace />} />
          <Route path="overview" element={<TeacherOverview />} />
          <Route path="courses" element={<TeacherCourses />} />
          <Route path="surveys" element={<TeacherSurveys />} />
        </Route>

        {/* Club Leader */}
        <Route path="/dashboard/club" element={<ProtectedRoute allowedRoles={['club_leader']}><DashboardShell role="club_leader" /></ProtectedRoute>}>
          <Route index element={<Navigate to="overview" replace />} />
          <Route path="overview" element={<ClubLeaderOverview />} />
          <Route path="members" element={<ClubLeaderMembers />} />
          <Route path="events" element={<ClubLeaderEvents />} />
          <Route path="budget" element={<ClubLeaderBudget />} />
        </Route>

        {/* Student Rep */}
        <Route path="/dashboard/student-rep" element={<ProtectedRoute allowedRoles={['student_rep']}><DashboardShell role="student_rep" /></ProtectedRoute>}>
          <Route index element={<Navigate to="overview" replace />} />
          <Route path="overview" element={<StudentRepOverview />} />
          <Route path="venues" element={<StudentRepVenues />} />
          <Route path="events" element={<StudentRepEvents />} />
          <Route path="announcements" element={<StudentRepAnnouncements />} />
        </Route>

        {/* Parent */}
        <Route path="/dashboard/parent" element={<ProtectedRoute allowedRoles={['parent']}><DashboardShell role="parent" /></ProtectedRoute>}>
          <Route index element={<Navigate to="overview" replace />} />
          <Route path="overview" element={<ParentOverview />} />
          <Route path="children" element={<ParentChildren />} />
          <Route path="reports" element={<ParentReports />} />
          <Route path="messages" element={<ParentMessages />} />
        </Route>

        {/* Staff */}
        <Route path="/dashboard/staff" element={<ProtectedRoute allowedRoles={['staff']}><DashboardShell role="staff" /></ProtectedRoute>}>
          <Route index element={<Navigate to="overview" replace />} />
          <Route path="overview" element={<StaffOverview />} />
          <Route path="reports" element={<StaffReports />} />
          <Route path="updates" element={<StaffUpdates />} />
        </Route>

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}
