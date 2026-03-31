import React, { useState } from 'react';
import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import {
  LayoutDashboard, Home, Users, Calendar, MapPin, Trophy, BarChart2, Settings,
  Compass, Heart, ClipboardList, UserCog, Key, History, Puzzle, Award,
  CalendarDays, User, GraduationCap, Wallet, Megaphone, Baby, FileText,
  MessageSquare, Bell, LogOut, Menu
} from 'lucide-react';

type Role =
  | 'admin'
  | 'student'
  | 'it_director'
  | 'coach'
  | 'teacher'
  | 'club_leader'
  | 'student_rep'
  | 'parent'
  | 'staff';

interface NavItem {
  label: string;
  path: string;
  icon: React.ReactNode;
}

const navConfig: Record<Role, NavItem[]> = {
  admin: [
    { label: 'Overview', path: '/dashboard/admin/overview', icon: <LayoutDashboard size={18} /> },
    { label: 'Clubs', path: '/dashboard/admin/clubs', icon: <Users size={18} /> },
    { label: 'Events', path: '/dashboard/admin/events', icon: <Calendar size={18} /> },
    { label: 'Venues', path: '/dashboard/admin/venues', icon: <MapPin size={18} /> },
    { label: 'Sports', path: '/dashboard/admin/sports', icon: <Trophy size={18} /> },
    { label: 'Reports', path: '/dashboard/admin/reports', icon: <BarChart2 size={18} /> },
    { label: 'Settings', path: '/dashboard/admin/settings', icon: <Settings size={18} /> },
  ],
  student: [
    { label: 'Home', path: '/dashboard/student/home', icon: <Home size={18} /> },
    { label: 'Discover', path: '/dashboard/student/discover', icon: <Compass size={18} /> },
    { label: 'Events', path: '/dashboard/student/events', icon: <Calendar size={18} /> },
    { label: 'Sports', path: '/dashboard/student/sports', icon: <Trophy size={18} /> },
    { label: 'Wellness', path: '/dashboard/student/wellness', icon: <Heart size={18} /> },
    { label: 'Surveys', path: '/dashboard/student/surveys', icon: <ClipboardList size={18} /> },
  ],
  it_director: [
    { label: 'Overview', path: '/dashboard/it/overview', icon: <LayoutDashboard size={18} /> },
    { label: 'Users', path: '/dashboard/it/users', icon: <UserCog size={18} /> },
    { label: 'API Keys', path: '/dashboard/it/api-keys', icon: <Key size={18} /> },
    { label: 'Audit', path: '/dashboard/it/audit', icon: <History size={18} /> },
    { label: 'Integrations', path: '/dashboard/it/integrations', icon: <Puzzle size={18} /> },
    { label: 'Settings', path: '/dashboard/it/settings', icon: <Settings size={18} /> },
  ],
  coach: [
    { label: 'Overview', path: '/dashboard/coach/overview', icon: <LayoutDashboard size={18} /> },
    { label: 'Leagues', path: '/dashboard/coach/leagues', icon: <Award size={18} /> },
    { label: 'Teams', path: '/dashboard/coach/teams', icon: <Users size={18} /> },
    { label: 'Schedule', path: '/dashboard/coach/schedule', icon: <CalendarDays size={18} /> },
    { label: 'Athletes', path: '/dashboard/coach/athletes', icon: <User size={18} /> },
    { label: 'Training', path: '/dashboard/coach/training', icon: <LayoutDashboard size={18} /> },
    { label: 'Settings', path: '/dashboard/coach/settings', icon: <Settings size={18} /> },
  ],
  teacher: [
    { label: 'Overview', path: '/dashboard/teacher/overview', icon: <LayoutDashboard size={18} /> },
    { label: 'Courses', path: '/dashboard/teacher/courses', icon: <GraduationCap size={18} /> },
    { label: 'Surveys', path: '/dashboard/teacher/surveys', icon: <ClipboardList size={18} /> },
  ],
  club_leader: [
    { label: 'Overview', path: '/dashboard/club/overview', icon: <LayoutDashboard size={18} /> },
    { label: 'Members', path: '/dashboard/club/members', icon: <Users size={18} /> },
    { label: 'Events', path: '/dashboard/club/events', icon: <Calendar size={18} /> },
    { label: 'Budget', path: '/dashboard/club/budget', icon: <Wallet size={18} /> },
  ],
  student_rep: [
    { label: 'Overview', path: '/dashboard/student-rep/overview', icon: <LayoutDashboard size={18} /> },
    { label: 'Venues', path: '/dashboard/student-rep/venues', icon: <MapPin size={18} /> },
    { label: 'Events', path: '/dashboard/student-rep/events', icon: <Calendar size={18} /> },
    { label: 'Announcements', path: '/dashboard/student-rep/announcements', icon: <Megaphone size={18} /> },
  ],
  parent: [
    { label: 'Overview', path: '/dashboard/parent/overview', icon: <LayoutDashboard size={18} /> },
    { label: 'Children', path: '/dashboard/parent/children', icon: <Baby size={18} /> },
    { label: 'Reports', path: '/dashboard/parent/reports', icon: <FileText size={18} /> },
    { label: 'Messages', path: '/dashboard/parent/messages', icon: <MessageSquare size={18} /> },
  ],
  staff: [
    { label: 'Overview', path: '/dashboard/staff/overview', icon: <LayoutDashboard size={18} /> },
    { label: 'Reports', path: '/dashboard/staff/reports', icon: <FileText size={18} /> },
    { label: 'Updates', path: '/dashboard/staff/updates', icon: <Bell size={18} /> },
  ],
};

const roleLabels: Record<Role, string> = {
  admin: 'Administrator',
  student: 'Student',
  it_director: 'IT Director',
  coach: 'Coach',
  teacher: 'Teacher',
  club_leader: 'Club Leader',
  student_rep: 'Student Rep',
  parent: 'Parent',
  staff: 'Staff',
};

interface DashboardShellProps {
  role: Role;
}

export default function DashboardShell({ role }: DashboardShellProps) {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();
  const [mobileOpen, setMobileOpen] = useState(false);

  const items = navConfig[role] || [];
  const mobileItems = items.slice(0, 5);

  const handleSignOut = async () => {
    await signOut();
    navigate('/login');
  };

  const userName = (user as { user_metadata?: { full_name?: string } })?.user_metadata?.full_name
    || user?.email?.split('@')[0]
    || 'User';
  const initials = userName.split(' ').map((n: string) => n[0]).join('').toUpperCase().slice(0, 2);

  return (
    <div className="min-h-screen bg-surface-low flex">
      {/* Sidebar — desktop */}
      <aside className="hidden lg:flex flex-col w-64 bg-surface-lowest fixed top-0 left-0 h-full z-30 shadow-float">
        {/* Logo */}
        <div className="flex items-center gap-3 px-6 py-5 border-b border-outline-variant/30">
          <div className="w-8 h-8 rounded-xl bg-primary flex items-center justify-center">
            <span className="text-white text-xs font-lexend font-900">CT</span>
          </div>
          <div>
            <p className="font-lexend font-900 text-on-surface text-sm">Campus Tribe</p>
            <p className="text-xs font-jakarta text-on-surface-variant">{roleLabels[role]}</p>
          </div>
        </div>
        {/* Nav */}
        <nav className="flex-1 px-3 py-4 overflow-y-auto">
          <ul className="space-y-1">
            {items.map((item) => (
              <li key={item.path}>
                <NavLink
                  to={item.path}
                  className={({ isActive }) =>
                    `flex items-center gap-3 px-3 py-2.5 rounded-xl font-jakarta text-sm font-700 transition-all ${
                      isActive
                        ? 'bg-primary-container text-primary'
                        : 'text-on-surface-variant hover:bg-surface-low hover:text-on-surface'
                    }`
                  }
                >
                  {item.icon}
                  {item.label}
                </NavLink>
              </li>
            ))}
          </ul>
        </nav>
        {/* User area */}
        <div className="px-3 py-4 border-t border-outline-variant/30">
          <div className="flex items-center gap-3 px-3 py-2 rounded-xl">
            <div className="w-8 h-8 rounded-full bg-primary-container flex items-center justify-center flex-shrink-0">
              <span className="text-primary text-xs font-jakarta font-900">{initials}</span>
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-jakarta font-700 text-on-surface text-sm truncate">{userName}</p>
              <p className="text-xs text-on-surface-variant truncate">{user?.email}</p>
            </div>
          </div>
          <button
            onClick={handleSignOut}
            className="mt-2 w-full flex items-center gap-2 px-3 py-2 rounded-xl text-sm font-jakarta text-on-surface-variant hover:bg-red-50 hover:text-red-600 transition-colors"
          >
            <LogOut size={18} />
            Sign out
          </button>
        </div>
      </aside>

      {/* Mobile header */}
      <div className="lg:hidden fixed top-0 left-0 right-0 z-30 bg-surface-lowest border-b border-outline-variant/30 flex items-center gap-3 px-4 py-3">
        <button onClick={() => setMobileOpen(!mobileOpen)} className="p-1">
          <Menu size={22} className="text-on-surface" />
        </button>
        <div className="w-7 h-7 rounded-lg bg-primary flex items-center justify-center">
          <span className="text-white text-xs font-lexend font-900">CT</span>
        </div>
        <p className="font-lexend font-900 text-on-surface text-sm flex-1">Campus Tribe</p>
        <div className="w-7 h-7 rounded-full bg-primary-container flex items-center justify-center">
          <span className="text-primary text-xs font-jakarta font-900">{initials}</span>
        </div>
      </div>

      {/* Mobile menu overlay */}
      {mobileOpen && (
        <div className="lg:hidden fixed inset-0 z-40">
          <div className="absolute inset-0 bg-black/50" onClick={() => setMobileOpen(false)} />
          <aside className="absolute left-0 top-0 bottom-0 w-64 bg-surface-lowest shadow-xl flex flex-col">
            <div className="flex items-center gap-3 px-6 py-5 border-b border-outline-variant/30">
              <div className="w-8 h-8 rounded-xl bg-primary flex items-center justify-center">
                <span className="text-white text-xs font-lexend font-900">CT</span>
              </div>
              <p className="font-lexend font-900 text-on-surface text-sm">{roleLabels[role]}</p>
            </div>
            <nav className="flex-1 px-3 py-4 overflow-y-auto">
              <ul className="space-y-1">
                {items.map((item) => (
                  <li key={item.path}>
                    <NavLink
                      to={item.path}
                      onClick={() => setMobileOpen(false)}
                      className={({ isActive }) =>
                        `flex items-center gap-3 px-3 py-2.5 rounded-xl font-jakarta text-sm font-700 transition-all ${
                          isActive
                            ? 'bg-primary-container text-primary'
                            : 'text-on-surface-variant hover:bg-surface-low hover:text-on-surface'
                        }`
                      }
                    >
                      {item.icon}
                      {item.label}
                    </NavLink>
                  </li>
                ))}
              </ul>
            </nav>
            <button
              onClick={handleSignOut}
              className="m-3 flex items-center gap-2 px-3 py-2 rounded-xl text-sm font-jakarta text-on-surface-variant hover:bg-red-50 hover:text-red-600 transition-colors"
            >
              <LogOut size={18} />
              Sign out
            </button>
          </aside>
        </div>
      )}

      {/* Main content */}
      <main className="flex-1 lg:ml-64 pt-16 lg:pt-0 pb-20 lg:pb-0 min-h-screen">
        <div className="max-w-6xl mx-auto px-4 lg:px-8 py-6 lg:py-8">
          <Outlet />
        </div>
      </main>

      {/* Mobile bottom tab bar */}
      <nav className="lg:hidden fixed bottom-0 left-0 right-0 z-30 bg-surface-lowest border-t border-outline-variant/30 flex">
        {mobileItems.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            className={({ isActive }) =>
              `flex-1 flex flex-col items-center py-2 gap-0.5 text-xs font-jakarta font-700 transition-colors ${
                isActive ? 'text-primary' : 'text-on-surface-variant'
              }`
            }
          >
            {React.cloneElement(item.icon as React.ReactElement<{ size?: number }>, { size: 20 })}
            <span className="truncate text-center w-full px-1" style={{ fontSize: '10px' }}>{item.label}</span>
          </NavLink>
        ))}
      </nav>
    </div>
  );
}
