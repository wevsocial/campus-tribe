import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import clsx from 'clsx';
import { useAuthStore } from '../../store/authStore';
import type { UserRole } from '../../types';
import {
  LayoutDashboard, Compass, Calendar, Users, Trophy, Heart, User,
  BarChart2, Building2, Settings, Flag, List, Wallet, LogOut,
  ChevronRight, BookOpen
} from 'lucide-react';

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
    { label: 'Overview', icon: <LayoutDashboard size={18} />, path: '/dashboard/admin' },
    { label: 'Events', icon: <Calendar size={18} />, path: '/dashboard/admin#events' },
    { label: 'Reports', icon: <Flag size={18} />, path: '/dashboard/admin#reports' },
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
  activeSection?: string;
}

export const DashboardLayout: React.FC<DashboardLayoutProps> = ({ children }) => {
  const { user, logout } = useAuthStore();
  const location = useLocation();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const role = user?.role || 'student';
  const navItems = (roleNavItems[role as UserRole] || roleNavItems.student) as { label: string; icon: React.ReactNode; path: string }[];

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const initials = user?.name
    ?.split(' ')
    .map((n: string) => n[0])
    .join('')
    .toUpperCase() || 'U';

  return (
    <div className="flex h-screen bg-surface overflow-hidden">
      {/* Sidebar */}
      <aside className={clsx(
        'fixed inset-y-0 left-0 z-40 w-60 bg-surface-lowest border-r border-outline-variant/40 flex flex-col transition-transform duration-300',
        sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
      )}>
        {/* Logo */}
        <div className="px-5 py-5 border-b border-outline-variant/30">
          <Link to="/" className="font-lexend font-900 italic text-lg text-primary">Campus Tribe</Link>
          <div className={clsx('mt-2 inline-flex items-center px-2 py-0.5 rounded-full text-xs font-jakarta font-700', roleBadgeColors[role as UserRole])}>
            {roleLabels[role as UserRole]}
          </div>
        </div>

        {/* Nav */}
        <nav className="flex-1 overflow-y-auto py-4 px-3">
          {navItems.map((item: { label: string; icon: React.ReactNode; path: string }) => {
            const isActive = location.pathname === item.path.split('#')[0] &&
              (item.path === location.pathname || location.hash === `#${item.path.split('#')[1]}`);
            return (
              <Link
                key={item.label}
                to={item.path}
                className={clsx(
                  'flex items-center gap-3 px-3 py-2.5 rounded-xl mb-1 text-sm font-jakarta transition-all',
                  isActive
                    ? 'bg-primary-container text-primary font-700'
                    : 'text-on-surface-variant hover:bg-surface-low hover:text-on-surface'
                )}
              >
                {item.icon}
                {item.label}
                {isActive && <ChevronRight size={14} className="ml-auto" />}
              </Link>
            );
          })}
        </nav>

        {/* User footer */}
        <div className="px-3 py-4 border-t border-outline-variant/30">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-9 h-9 rounded-full bg-primary flex items-center justify-center text-white text-sm font-lexend font-800 flex-shrink-0">
              {initials}
            </div>
            <div className="min-w-0">
              <p className="text-sm font-jakarta font-700 text-on-surface truncate">{user?.name}</p>
              <p className="text-xs text-on-surface-variant truncate">{user?.email}</p>
            </div>
          </div>
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-2 px-3 py-2 rounded-xl text-sm font-jakarta text-on-surface-variant hover:bg-red-50 hover:text-red-600 transition-colors"
          >
            <LogOut size={16} />
            Logout
          </button>
        </div>
      </aside>

      {/* Overlay for mobile */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-30 bg-black/40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Main */}
      <main className="flex-1 lg:ml-60 overflow-y-auto h-screen">
        {/* Mobile top bar */}
        <div className="lg:hidden sticky top-0 z-20 bg-surface-lowest border-b border-outline-variant/30 px-4 h-14 flex items-center gap-3">
          <button onClick={() => setSidebarOpen(true)} className="text-on-surface-variant">
            <span className="material-symbols-outlined">menu</span>
          </button>
          <span className="font-lexend font-900 italic text-primary">Campus Tribe</span>
        </div>
        <div className="p-6">
          {children}
        </div>
      </main>
    </div>
  );
};

export default DashboardLayout;
