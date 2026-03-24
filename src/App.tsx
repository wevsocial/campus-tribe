import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import Landing from './pages/Landing'
import Login from './pages/Login'
import Register from './pages/Register'
import DashboardLayout from './components/DashboardLayout'
import StudentDashboard from './pages/dashboards/StudentDashboard'
import AdminDashboard from './pages/dashboards/AdminDashboard'
import ClubDashboard from './pages/dashboards/ClubDashboard'
import CoachDashboard from './pages/dashboards/CoachDashboard'
import ProtectedRoute from './components/ProtectedRoute'

const queryClient = new QueryClient()

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Landing />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />

          <Route path="/dashboard" element={
            <ProtectedRoute>
              <DashboardLayout />
            </ProtectedRoute>
          }>
            <Route path="student" element={<StudentDashboard />} />
            <Route path="student/*" element={<StudentDashboard />} />
            <Route path="admin" element={<AdminDashboard />} />
            <Route path="admin/*" element={<AdminDashboard />} />
            <Route path="club" element={<ClubDashboard />} />
            <Route path="club/*" element={<ClubDashboard />} />
            <Route path="coach" element={<CoachDashboard />} />
            <Route path="coach/*" element={<CoachDashboard />} />
            <Route index element={<Navigate to="student" replace />} />
          </Route>

          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </QueryClientProvider>
  )
}
