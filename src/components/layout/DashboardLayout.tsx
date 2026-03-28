import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import clsx from 'clsx';
import type { UserRole } from '../../types';
import {
  LayoutDashboard, Compass, Calendar, Users, Trophy, Heart, User,
  BarChart2, Building2, Settings, Flag, List, Wallet, LogOut,
  ChevronRight, BookOpen
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import NotificationBell from '../dashboard/NotificationBell';

const roleNavItems: Record<UserRole, { label: string; icon: React.ReactNode; path: string }[]> = {
  student: [
    { label: 'Dashboard', icon: <LayoutDashboard size={18} />, path: '/dashboard/student' },
    { label: 'Discover', icon: <Compass size={18} />, path: '/dashboard/student#discover' },
    { label: 'Events', icon: <Calendar size={18} />, path: '/dashboard/student#events' },
    { label: 'My Clubs', icon: <Users size={18} />, path: '/dashboard/student#clubs' },
    { label: 'Sports', icon: <Trophy size={18} />, path: '/dashboard/student#sports' },
    { label: 'Wellness', icon: <Heart size={18} />, path: '/dashboard/student#wellness' },
    { label: 'Profile', icon: <User size={18} />, path: '/dashboard/student#profile' },
  ],
  student_rep: [
    { label: 'Dashboard', icon: <LayoutDashboard size={18} />, path: '/dashboard/student-rep' },
    { label: 'Venue Booking', icon: <Building2 size={18} />, path: '/dashboard/student-rep#venues' },
    { label: 'Event Planning', icon: <Calendar size={18} />, path: '/dashboard/student-rep#events' },
    { label: 'Clubs', icon: <Users size={18} />, path: '/dashboard/student-rep#clubs' },
    { label: 'Budget', icon: <Wallet size={18} />, path: '/dashboard/student-rep#budget' },
    { label: 'Applications', icon: <List size={18} />, path: '/dashboard/student-rep#applications' },
  ],
  admin: [
    { label: 'Overview', icon: <LayoutDashboard size={18} />, path: '/dashboard/admin' },
    { label: 'Engagement', icon: <BarChart2 size={18} />, path: '/dashboard/admin#engagement' },
    { label: 'Clubs', icon: <Users size={18} />, path: '/dashboard/admin#clubs' },
    { label: 'Events', icon: <Calendar size={18} />, path: '/dashboard/admin#events' },
    { label: 'Venues', icon: <Building2 size={18} />, path: '/dashboard/admin#venues' },
    { label: 'Sports', icon: <Trophy size={18} />, path: '/dashboard/admin#sports' },
    { label: 'Reports', icon: <Flag size={18} />, path: '/dashboard/admin#reports' },
    { label: 'Settings', icon: <Settings size={18} />, path: '/dashboard/admin#settings' },
  ],
  club_leader: [
    { label: 'Overview', icon: <LayoutDashboard size={18} />, path: '/dashboard/club' },
    { label: 'Members', icon: <Users size={18} />, path: '/dashboard/club#members' },
    { label: 'Events', icon: <Calendar size={18} />, path: '/dashboard/club#events' },
    { label: 'Venue Booking', icon: <Building2 size={18} />, path: '/dashboard/club#venues' },
    { label: 'Budget', icon: <Wallet size={18} />, path: '/dashboard/club#budget' },
    { label: 'Analytics', icon: <BarChart2 size={18} />, path: '/dashboard/club#analytics' },
  ],
  coach: [
    { label: 'Overview', icon: <LayoutDashboard size={18} />, path: '/dashboard/coach' },
    { label: 'Leagues', icon: <Trophy size={18} />, path: '/dashboard/coach#leagues' },
    { label: 'Schedule', icon: <Calendar size={18} />, path: '/dashboard/coach#schedule' },
    { label: 'Teams', icon: <Users size={18} />, path: '/dashboard/coach#teams' },
    { label: 'Scoreboard', icon: <List size={18} />, path: '/dashboard/coach#scoreboard' },
    { label: 'Analytics', icon: <BarChart2 size={18} />, path: '/dashboard/coach#analytics' },
  ],
  staff: [
    { label: 'Overview', icon: <LayoutDashboard size={18} />, path: '/dashboard/staff' },
    { label: 'Daily Reports', icon: <Flag size={18} />, path: '/dashboard/staff#reports' },
    { label: 'Classes', icon: <BookOpen size={18} />, path: '/dashboard/staff#classes' },
  ],
  it_director: [
    { label: 'Overview', icon: <LayoutDashboard size={18} />, path: '/dashboard/it' },
    { label: 'Users', icon: <Users size={18} />, path: '/dashboard/it#users' },
    { label: 'Settings', icon: <Settings size={18} />, path: '/dashboard/it#settings' },
  ],
  teacher: [
    { label: 'Dashboard', icon: <LayoutDashboard size={18} />, path: '/dashboard/teacher' },
    { label: 'Classes', icon: <BookOpen size={18} />, path: '/dashboard/teacher#classes' },
    { label: 'Assignments', icon: <List size={18} />, path: '/dashboard/teacher#assignments' },
    { label: 'Analytics', icon: <BarChart2 size={18} />, path: '/dashboard/teacher#analytics' },
  ],
  parent: [
    { label: 'Dashboard', icon: <LayoutDashboard size={18} />, path: '/dashboard/parent' },
    { label: 'Reports', icon: <Flag size={18} />, path: '/dashboard/parent#reports' },
    { label: 'Messages', icon: <Calendar size={18} />, path: '/dashboard/parent#messages' },
  ],
};

const roleBadgeColors: Record<UserRole, string> = {
  student: 'bg-primary-container text-primary',
  student_rep: 'bg-indigo-100 text-indigo-700',
  admin: 'bg-secondary-container text-secondary-dim',
  coach: 'bg-tertiary-container text-tertiary-dim',
  club_leader: 'bg-purple-100 text-purple-700',
  staff: 'bg-amber-100 text-amber-700',
  it_director: 'bg-gray-100 text-gray-600',
  teacher: 'bg-blue-100 text-blue-700',
  parent: 'bg-pink-100 text-pink-700',
};

const roleLabels: Record<UserRole, string> = {
  student: 'Student',
  student_rep: 'Student Rep',
  admin: 'Administrator',
  coach: 'Coach',
  club_leader: 'Club Leader',
  staff: 'Staff',
  it_director: 'IT Director',
  teacher: 'Teacher',
  parent: 'Parent',
};

interface DashboardLayoutProps {
  children: React.ReactNode;
}

export const DashboardLayout: React.FC<DashboardLayoutProps> = ({ children }) => {
  const { profile, signOut } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const role = (profile?.role || 'student') as UserRole;
  const navItems = roleNavItems[role] || roleNavItems.student;

  const handleLogout = async () => {
    await signOut();
    navigate('/');
  };

  const initials = (profile?.full_name || profile?.email || 'U')
    .split(' ')
    .map((segment: string) => segment[0])
    .join('')
    .slice(0, 2)
    .toUpperCase();

  return (
    <div className="flex h-screen bg-surface overflow-hidden">
      <aside className={clsx('fixed inset-y-0 left-0 z-40 w-64 bg-surface-lowest flex flex-col transition-transform duration-300', sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0')}>
        <div className="px-5 py-5 bg-surface">
          <Link to="/" className="font-lexend font-900 italic text-lg text-primary">Campus Tribe</Link>
          <div className={clsx('mt-3 inline-flex items-center px-3 py-1 rounded-full text-xs font-jakarta font-700', roleBadgeColors[role])}>
            {roleLabels[role]}
          </div>
        </div>

        <nav className="flex-1 overflow-y-auto py-4 px-3">
          {navItems.map((item) => {
            const isActive = location.pathname === item.path.split('#')[0] && (item.path === location.pathname || location.hash === `#${item.path.split('#')[1]}`);
            return (
              <Link
                key={item.label}
                to={item.path}
                className={clsx('flex items-center gap-3 px-4 py-3 rounded-[1rem] mb-1 text-sm font-jakarta transition-all', isActive ? 'bg-primary-container text-primary font-700' : 'text-on-surface-variant hover:bg-surface hover:text-on-surface')}
              >
                {item.icon}
                {item.label}
                {isActive && <ChevronRight size={14} className="ml-auto" />}
              </Link>
            );
          })}
        </nav>

        <div className="px-3 py-4 bg-surface">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 rounded-full bg-primary flex items-center justify-center text-white text-sm font-lexend font-800 flex-shrink-0">
              {initials}
            </div>
            <div className="min-w-0">
              <p className="text-sm font-jakarta font-700 text-on-surface truncate">{profile?.full_name || 'Campus User'}</p>
              <p className="text-xs text-on-surface-variant truncate">{profile?.email}</p>
            </div>
          </div>
          <button onClick={handleLogout} className="w-full flex items-center gap-2 px-3 py-2 rounded-full text-sm font-jakarta text-on-surface-variant hover:bg-red-50 hover:text-red-600 transition-colors">
            <LogOut size={16} />
            Logout
          </button>
        </div>
      </aside>

      {sidebarOpen && <div className="fixed inset-0 z-30 bg-black/40 lg:hidden" onClick={() => setSidebarOpen(false)} />}

      <main className="flex-1 lg:ml-64 overflow-y-auto h-screen">
        <div className="sticky top-0 z-20 flex items-center justify-between bg-surface-lowest/90 backdrop-blur px-4 lg:px-6 h-16">
          <div className="flex items-center gap-3">
            <button onClick={() => setSidebarOpen(true)} className="text-on-surface-variant lg:hidden">
              <span className="material-symbols-outlined">menu</span>
            </button>
            <span className="font-lexend font-900 italic text-primary lg:hidden">Campus Tribe</span>
          </div>
          <NotificationBell />
        </div>
        <div className="p-6">{children}</div>
      </main>
    </div>
  );
};

export default DashboardLayout;
