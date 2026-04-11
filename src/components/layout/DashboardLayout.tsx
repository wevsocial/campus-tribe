import React, { useCallback, useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import clsx from 'clsx';
import type { UserRole } from '../../types';
import {
  LayoutDashboard, Compass, Calendar, Users, Trophy, Heart, User,
  BarChart2, Building2, Settings, Flag, List, Wallet, LogOut,
  BookOpen, Menu, X, Bell, CreditCard, ShieldCheck,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import NotificationBell from '../dashboard/NotificationBell';
import CampusTribeLogo from '../ui/CampusTribeLogo';
import StealthBanner from './StealthBanner';
import PaywallGate from '../billing/PaywallGate';

const roleNavItems: Record<UserRole, { label: string; icon: React.ReactNode; hash: string }[]> = {
  student: [
    { label: 'Overview', icon: <LayoutDashboard size={18} />, hash: '' },
    { label: 'Discover', icon: <Compass size={18} />, hash: 'discover' },
    { label: 'Events', icon: <Calendar size={18} />, hash: 'events' },
    { label: 'My Clubs', icon: <Users size={18} />, hash: 'clubs' },
    { label: 'Sports', icon: <Trophy size={18} />, hash: 'sports' },
    { label: 'Wellness', icon: <Heart size={18} />, hash: 'wellness' },
    { label: 'Surveys', icon: <List size={18} />, hash: 'surveys' },
  ],
  student_rep: [
    { label: 'Overview', icon: <LayoutDashboard size={18} />, hash: '' },
    { label: 'Venue Booking', icon: <Building2 size={18} />, hash: 'venues' },
    { label: 'Events', icon: <Calendar size={18} />, hash: 'events' },
    { label: 'Announcements', icon: <Flag size={18} />, hash: 'announcements' },
    { label: 'Budget', icon: <Wallet size={18} />, hash: 'budget' },
  ],
  admin: [
    { label: 'Overview', icon: <LayoutDashboard size={18} />, hash: '' },
    { label: 'Engagement', icon: <BarChart2 size={18} />, hash: 'engagement' },
    { label: 'Clubs', icon: <Users size={18} />, hash: 'clubs' },
    { label: 'Events', icon: <Calendar size={18} />, hash: 'events' },
    { label: 'Venues', icon: <Building2 size={18} />, hash: 'venues' },
    { label: 'Sports', icon: <Trophy size={18} />, hash: 'sports' },
    { label: 'Reports', icon: <Flag size={18} />, hash: 'reports' },
    { label: 'Settings', icon: <Settings size={18} />, hash: 'settings' },
  ],
  club_leader: [
    { label: 'Overview', icon: <LayoutDashboard size={18} />, hash: '' },
    { label: 'Members', icon: <Users size={18} />, hash: 'members' },
    { label: 'Events', icon: <Calendar size={18} />, hash: 'events' },
    { label: 'Venue Booking', icon: <Building2 size={18} />, hash: 'venues' },
    { label: 'Budget', icon: <Wallet size={18} />, hash: 'budget' },
    { label: 'Funding', icon: <Wallet size={18} />, hash: 'funding' },
  ],
  coach: [
    { label: 'Overview', icon: <LayoutDashboard size={18} />, hash: '' },
    { label: 'Leagues', icon: <Trophy size={18} />, hash: 'leagues' },
    { label: 'Teams', icon: <Users size={18} />, hash: 'teams' },
    { label: 'Schedule', icon: <Calendar size={18} />, hash: 'schedule' },
    { label: 'Athletes', icon: <User size={18} />, hash: 'athletes' },
    { label: 'Training', icon: <List size={18} />, hash: 'training' },
  ],
  staff: [
    { label: 'Overview', icon: <LayoutDashboard size={18} />, hash: '' },
    { label: 'Daily Reports', icon: <Flag size={18} />, hash: 'reports' },
    { label: 'Parent Updates', icon: <Bell size={18} />, hash: 'updates' },
    { label: 'Classes', icon: <BookOpen size={18} />, hash: 'classes' },
  ],
  it_director: [
    { label: 'Overview', icon: <LayoutDashboard size={18} />, hash: '' },
    { label: 'Users', icon: <Users size={18} />, hash: 'users' },
    { label: 'API Keys', icon: <Settings size={18} />, hash: 'api-keys' },
    { label: 'Audit Log', icon: <List size={18} />, hash: 'audit' },
    { label: 'Integrations', icon: <BarChart2 size={18} />, hash: 'integrations' },
    { label: 'Settings', icon: <Settings size={18} />, hash: 'settings' },
  ],
  teacher: [
    { label: 'Overview', icon: <LayoutDashboard size={18} />, hash: '' },
    { label: 'Courses', icon: <BookOpen size={18} />, hash: 'courses' },
    { label: 'Assignments', icon: <List size={18} />, hash: 'assignments' },
    { label: 'Surveys', icon: <Flag size={18} />, hash: 'surveys' },
    { label: 'Analytics', icon: <BarChart2 size={18} />, hash: 'analytics' },
  ],
  parent: [
    { label: 'Overview', icon: <LayoutDashboard size={18} />, hash: '' },
    { label: 'Children', icon: <Users size={18} />, hash: 'children' },
    { label: 'Daily Reports', icon: <Flag size={18} />, hash: 'reports' },
    { label: 'Messages', icon: <Bell size={18} />, hash: 'messages' },
    { label: 'Events', icon: <Calendar size={18} />, hash: 'events' },
  ],
  athlete: [
    { label: 'Overview', icon: <LayoutDashboard size={18} />, hash: '' },
    { label: 'My Team', icon: <Users size={18} />, hash: 'team' },
    { label: 'Schedule', icon: <Calendar size={18} />, hash: 'schedule' },
    { label: 'Training', icon: <Trophy size={18} />, hash: 'training' },
  ],
};

const roleBadge: Record<UserRole, string> = {
  student: 'bg-primary-container text-primary',
  student_rep: 'bg-primary-container text-primary',
  admin: 'bg-secondary-container text-secondary',
  coach: 'bg-tertiary-container text-tertiary',
  club_leader: 'bg-primary-container text-primary',
  staff: 'bg-secondary-container text-secondary',
  it_director: 'bg-surface-container-high text-on-surface',
  teacher: 'bg-primary-container text-primary',
  parent: 'bg-tertiary-container text-tertiary',
  athlete: 'bg-tertiary-container text-tertiary',
};

const roleLabel: Record<UserRole, string> = {
  student: 'Student',
  student_rep: 'Student Rep',
  admin: 'Administrator',
  coach: 'Coach',
  club_leader: 'Club Leader',
  staff: 'Staff',
  it_director: 'IT Director',
  teacher: 'Teacher',
  parent: 'Parent',
  athlete: 'Student Athlete',
};

interface DashboardLayoutProps {
  children: React.ReactNode;
}

export const DashboardLayout: React.FC<DashboardLayoutProps> = ({ children }) => {
  const { profile, institution, signOut, needsPayment } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [activeHash, setActiveHash] = useState(location.hash.replace('#', ''));

  const role = (profile?.role || 'student') as UserRole;
  const navItems = roleNavItems[role] || roleNavItems.student;

  // Keep activeHash in sync with actual URL hash (handles browser back/forward)
  useEffect(() => {
    setActiveHash(location.hash.replace('#', ''));
  }, [location.hash]);

  const handleNavClick = useCallback((hash: string) => {
    // 1. Close sidebar on mobile
    setSidebarOpen(false);

    // 2. Update URL hash without full navigation
    const basePath = location.pathname;
    const newUrl = hash ? `${basePath}#${hash}` : basePath;
    window.history.replaceState({}, '', newUrl);
    setActiveHash(hash);

    // 3. Scroll to section with a short delay so sidebar close animation doesn't interfere
    requestAnimationFrame(() => {
      setTimeout(() => {
        const targetId = hash || 'overview';
        const el = document.getElementById(targetId);
        if (el) {
          el.scrollIntoView({ behavior: 'smooth', block: 'start' });
        } else {
          // Fallback: scroll to top of main content
          document.querySelector('main')?.scrollTo({ top: 0, behavior: 'smooth' });
        }
      }, 100);
    });
  }, [location.pathname]);

  const handleLogout = async () => {
    await signOut();
    navigate('/');
  };

  const initials = (profile?.full_name || profile?.email || 'U')
    .split(' ')
    .map((s: string) => s[0] || '')
    .join('')
    .slice(0, 2)
    .toUpperCase();

  return (
    <>
    <div className="flex h-screen bg-surface overflow-hidden">
      {/* Sidebar */}
      <aside
        className={clsx(
          'fixed inset-y-0 left-0 z-40 w-64 bg-surface-lowest flex flex-col shadow-lift transition-transform duration-300 ease-in-out',
          sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        )}
      >
        {/* Brand */}
        <div className="flex items-center justify-between px-4 py-4 bg-surface border-b border-surface-container-low">
          <div className="min-w-0 flex-1">
            <CampusTribeLogo className="w-8 h-8" animated={true} showText={true} />
            {/* Institution name ribbon */}
            {institution?.name && (
              <div className="mt-1.5 flex items-center gap-1.5 min-w-0">
                <Building2 size={11} className="text-primary shrink-0" />
                <span className="text-[11px] font-jakarta font-700 text-primary truncate leading-tight max-w-[140px]" title={institution.name}>
                  {institution.short_name || institution.name}
                </span>
              </div>
            )}
            <div className={clsx('mt-1 inline-flex px-2 py-0.5 rounded-full text-xs font-jakarta font-700', roleBadge[role])}>
              {roleLabel[role]}
            </div>
          </div>
          <button
            onClick={() => setSidebarOpen(false)}
            className="lg:hidden text-on-surface-variant p-1 rounded-full hover:bg-surface shrink-0"
          >
            <X size={18} />
          </button>
        </div>

        {/* Nav items */}
        <nav className="flex-1 overflow-y-auto py-3 px-3 space-y-0.5">
          {navItems.map((item) => {
            const isActive = activeHash === item.hash;
            return (
              <button
                key={item.hash || 'root'}
                onClick={() => handleNavClick(item.hash)}
                className={clsx(
                  'w-full flex items-center gap-3 px-4 py-3 rounded-[1rem] text-sm font-jakarta font-600 transition-all text-left',
                  isActive
                    ? 'bg-primary-container text-primary font-700'
                    : 'text-on-surface-variant hover:bg-surface hover:text-on-surface'
                )}
              >
                <span className="shrink-0">{item.icon}</span>
                <span className="flex-1">{item.label}</span>
                {isActive && <span className="text-primary text-xs ml-auto">›</span>}
              </button>
            );
          })}
          {/* Bills & Payments nav item for paid roles */}
          {['admin','it_director','teacher','coach','staff','student_rep','parent'].includes(role) && (
            <button
              onClick={() => handleNavClick('billing')}
              className={clsx(
                'w-full flex items-center gap-3 px-4 py-3 rounded-[1rem] text-sm font-jakarta font-600 transition-all text-left mt-1',
                activeHash === 'billing'
                  ? 'bg-primary-container text-primary font-700'
                  : needsPayment
                    ? 'text-red-500 bg-red-50 dark:bg-red-900/20 hover:bg-red-100'
                    : 'text-on-surface-variant hover:bg-surface hover:text-on-surface'
              )}
            >
              <CreditCard size={18} className="shrink-0" />
              <span className="flex-1">Bills & Payments</span>
              {needsPayment && <span className="w-2 h-2 rounded-full bg-red-500 shrink-0" />}
            </button>
          )}
        </nav>

        {/* User footer */}
        <div className="px-3 py-4 bg-surface border-t border-surface-container-low">
          <div className="flex items-center gap-3 mb-3 px-1">
            <div className="w-10 h-10 rounded-full bg-primary flex items-center justify-center text-white text-sm font-lexend font-800 shrink-0">
              {initials}
            </div>
            <div className="min-w-0">
              <p className="text-sm font-jakarta font-700 text-on-surface truncate">{profile?.full_name || 'Campus User'}</p>
              <p className="text-xs text-on-surface-variant truncate">{profile?.email}</p>
            </div>
          </div>
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-2 px-3 py-2 rounded-full text-sm font-jakarta text-on-surface-variant hover:bg-red-50 hover:text-red-600 transition-colors"
          >
            <LogOut size={16} />
            Logout
          </button>
        </div>
      </aside>

      {/* Mobile overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-30 bg-black/50 lg:hidden backdrop-blur-sm"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Main content */}
      <main className="flex-1 lg:ml-64 overflow-y-auto h-screen">
        {/* Top bar */}
        <div className="sticky top-0 z-20 flex items-center justify-between bg-surface-lowest/95 backdrop-blur border-b border-surface-container-low px-4 lg:px-6 h-14">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setSidebarOpen(true)}
              className="lg:hidden p-2 rounded-full text-on-surface-variant hover:bg-surface transition-colors"
            >
              <Menu size={20} />
            </button>
            <span className="font-lexend font-900 italic text-primary lg:hidden"><CampusTribeLogo className="w-7 h-7" animated={true} showText={true} /></span>
          </div>
          <NotificationBell />
        </div>

        <div className="p-4 lg:p-6 pb-16">
          <PaywallGate onGoToBilling={() => handleNavClick('billing')}>
            {children}
          </PaywallGate>
        </div>
      </main>
    </div>
    <StealthBanner />
    </>
  );
};

export default DashboardLayout;
