import { NavLink, Outlet, useNavigate } from 'react-router-dom'
import { Home, Users, Calendar, Trophy, MapPin, Heart, Bell, Settings, LogOut, BarChart3, ClipboardList, Dumbbell } from 'lucide-react'
import { useAuthStore } from '../store/authStore'
import clsx from 'clsx'

interface NavItem {
  to: string
  icon: React.ReactNode
  label: string
}

const studentNav: NavItem[] = [
  { to: '/dashboard/student', icon: <Home size={18} />, label: 'Home' },
  { to: '/dashboard/student/clubs', icon: <Users size={18} />, label: 'Clubs' },
  { to: '/dashboard/student/events', icon: <Calendar size={18} />, label: 'Events' },
  { to: '/dashboard/student/sports', icon: <Trophy size={18} />, label: 'Sports' },
  { to: '/dashboard/student/wellness', icon: <Heart size={18} />, label: 'Wellness' },
]

const adminNav: NavItem[] = [
  { to: '/dashboard/admin', icon: <BarChart3 size={18} />, label: 'Analytics' },
  { to: '/dashboard/admin/clubs', icon: <ClipboardList size={18} />, label: 'Club Approvals' },
  { to: '/dashboard/admin/venues', icon: <MapPin size={18} />, label: 'Venues' },
  { to: '/dashboard/admin/alerts', icon: <Bell size={18} />, label: 'At-Risk Alerts' },
]

const clubNav: NavItem[] = [
  { to: '/dashboard/club', icon: <Home size={18} />, label: 'Overview' },
  { to: '/dashboard/club/members', icon: <Users size={18} />, label: 'Members' },
  { to: '/dashboard/club/events', icon: <Calendar size={18} />, label: 'Events' },
  { to: '/dashboard/club/budget', icon: <BarChart3 size={18} />, label: 'Budget' },
]

const coachNav: NavItem[] = [
  { to: '/dashboard/coach', icon: <Trophy size={18} />, label: 'Leagues' },
  { to: '/dashboard/coach/games', icon: <Dumbbell size={18} />, label: 'Games' },
  { to: '/dashboard/coach/teams', icon: <Users size={18} />, label: 'Teams' },
  { to: '/dashboard/coach/schedule', icon: <Calendar size={18} />, label: 'Schedule' },
]

function getNav(role: string) {
  if (role === 'student') return studentNav
  if (role === 'coach') return coachNav
  if (role === 'admin' || role === 'staff' || role === 'it_director') return adminNav
  return clubNav
}

export default function DashboardLayout() {
  const { user, logout } = useAuthStore()
  const navigate = useNavigate()
  const nav = getNav(user?.role || 'student')

  const handleLogout = () => {
    logout()
    navigate('/login')
  }

  return (
    <div className="flex h-screen bg-surface overflow-hidden">
      {/* Sidebar */}
      <aside className="w-60 bg-surface-lowest border-r border-surface flex flex-col flex-shrink-0">
        <div className="p-4 border-b border-surface">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-hero-gradient flex items-center justify-center">
              <span className="text-white font-headline font-black text-sm">CT</span>
            </div>
            <span className="font-headline font-800 text-on-surface text-base">Campus Tribe</span>
          </div>
        </div>

        <nav className="flex-1 p-4 flex flex-col gap-1">
          {nav.map(item => (
            <NavLink key={item.to} to={item.to} end={item.to === nav[0].to}
              className={({ isActive }) => clsx('sidebar-link', isActive && 'active')}>
              {item.icon}
              {item.label}
            </NavLink>
          ))}
        </nav>

        <div className="p-4 border-t border-surface">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-8 h-8 rounded-full bg-hero-gradient flex items-center justify-center text-white text-xs font-label font-bold">
              {user?.full_name?.charAt(0) || 'U'}
            </div>
            <div className="min-w-0">
              <div className="text-xs font-label font-bold text-on-surface truncate">{user?.full_name || 'User'}</div>
              <div className="text-xs text-on-surface-variant capitalize">{user?.role?.replace('_', ' ')}</div>
            </div>
          </div>
          <button onClick={handleLogout}
            className="flex items-center gap-2 text-xs text-on-surface-variant hover:text-red-500 transition-colors font-label">
            <LogOut size={14} />
            Sign out
          </button>
        </div>
      </aside>

      {/* Main */}
      <main className="flex-1 overflow-y-auto">
        <Outlet />
      </main>
    </div>
  )
}
