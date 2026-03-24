import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';
import { Input } from '../components/ui/Input';
import { Button } from '../components/ui/Button';
import { Eye, EyeOff, Mail, Lock, GraduationCap, Users, Trophy, Settings, Monitor } from 'lucide-react';
import clsx from 'clsx';

const roles = [
  { id: 'student', label: 'Student', icon: <GraduationCap size={16} />, email: 'student@demo.com', password: 'student' },
  { id: 'staff', label: 'Staff', icon: <Users size={16} />, email: 'admin@demo.com', password: 'admin' },
  { id: 'coach', label: 'Coach', icon: <Trophy size={16} />, email: 'coach@demo.com', password: 'coach' },
  { id: 'admin', label: 'Admin', icon: <Settings size={16} />, email: 'admin@demo.com', password: 'admin' },
  { id: 'it', label: 'IT Director', icon: <Monitor size={16} />, email: 'admin@demo.com', password: 'admin' },
];

const LoginPage: React.FC = () => {
  const navigate = useNavigate();
  const { login, isLoading } = useAuthStore();
  const [selectedRole, setSelectedRole] = useState(0);
  const [email, setEmail] = useState('student@demo.com');
  const [password, setPassword] = useState('student');
  const [showPw, setShowPw] = useState(false);
  const [error, setError] = useState('');

  const handleRoleSelect = (i: number) => {
    setSelectedRole(i);
    setEmail(roles[i].email);
    setPassword(roles[i].password);
    setError('');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    const result = await login(email, password);
    if (result.success) {
      const user = useAuthStore.getState().user;
      const roleMap: Record<string, string> = {
        student: '/dashboard/student',
        admin: '/dashboard/admin',
        staff: '/dashboard/admin',
        it_director: '/dashboard/admin',
        coach: '/dashboard/coach',
        club_leader: '/dashboard/club',
      };
      navigate(user ? roleMap[user.role] || '/dashboard/student' : '/dashboard/student');
    } else {
      setError(result.error || 'Login failed.');
    }
  };

  return (
    <div className="min-h-screen grid lg:grid-cols-2">
      {/* Left hero panel */}
      <div className="hidden lg:flex flex-col justify-between p-12 bg-hero-gradient">
        <div>
          <Link to="/" className="font-lexend font-900 italic text-2xl text-white">Campus Tribe</Link>
          <p className="text-white/60 text-xs mt-1">by WevSocial</p>
        </div>
        <div>
          <blockquote className="text-white text-2xl font-lexend font-800 leading-relaxed mb-6">
            "Campus Tribe transformed how our students connect. Engagement is up 47% since launch."
          </blockquote>
          <p className="text-white/80 text-sm font-jakarta">to Dr. Sarah Patel, Dean of Student Life, University of Toronto</p>
          <div className="mt-12 grid grid-cols-3 gap-6">
            {[
              { v: '19.9M', l: 'Students' },
              { v: '97%', l: 'Satisfaction' },
              { v: '8+', l: 'Countries' },
            ].map((s) => (
              <div key={s.l}>
                <p className="font-lexend font-900 text-3xl text-white">{s.v}</p>
                <p className="text-white/70 text-sm">{s.l}</p>
              </div>
            ))}
          </div>
        </div>
        <p className="text-white/40 text-xs">© 2026 WevSocial Inc.</p>
      </div>

      {/* Right form */}
      <div className="flex items-center justify-center p-8 bg-surface-lowest">
        <div className="w-full max-w-md">
          <div className="mb-2">
            <Link to="/" className="font-lexend font-900 italic text-xl text-primary lg:hidden">Campus Tribe</Link>
          </div>
          <h1 className="font-lexend font-900 text-3xl text-on-surface mb-1">Welcome back</h1>
          <p className="text-on-surface-variant text-sm mb-8">Sign in to your Campus Tribe account.</p>

          {/* Role tabs */}
          <div className="flex flex-wrap gap-2 mb-6">
            {roles.map((role, i) => (
              <button
                key={role.id}
                onClick={() => handleRoleSelect(i)}
                className={clsx(
                  'flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-jakarta font-700 transition-all',
                  selectedRole === i
                    ? 'bg-primary text-white'
                    : 'bg-surface-low text-on-surface-variant hover:bg-surface-high'
                )}
              >
                {role.icon}
                {role.label}
              </button>
            ))}
          </div>

          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            <Input
              label="Email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@utoronto.ca"
              icon={<Mail size={16} />}
              required
            />
            <Input
              label="Password"
              type={showPw ? 'text' : 'password'}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              icon={
                <button type="button" onClick={() => setShowPw(!showPw)} className="text-on-surface-variant">
                  {showPw ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              }
              iconPosition="right"
              required
            />

            {error && (
              <div className="bg-red-50 border border-red-200 text-red-600 text-sm px-4 py-3 rounded-xl font-jakarta">
                {error}
              </div>
            )}

            <Button type="submit" variant="primary" size="lg" isLoading={isLoading} className="w-full mt-2">
              Sign In
            </Button>

            <div className="relative flex items-center gap-3">
              <div className="flex-1 border-t border-outline-variant/40" />
              <span className="text-xs text-on-surface-variant font-jakarta">or</span>
              <div className="flex-1 border-t border-outline-variant/40" />
            </div>

            <button
              type="button"
              className="w-full flex items-center justify-center gap-3 border border-outline-variant rounded-xl py-3 text-sm font-jakarta text-on-surface hover:bg-surface-low transition-colors"
            >
              <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
                <path d="M17.64 9.2c0-.637-.057-1.251-.164-1.84H9v3.481h4.844a4.14 4.14 0 01-1.796 2.716v2.259h2.908c1.702-1.567 2.684-3.875 2.684-6.615z" fill="#4285F4"/>
                <path d="M9 18c2.43 0 4.467-.806 5.956-2.18l-2.908-2.259c-.806.54-1.837.86-3.048.86-2.344 0-4.328-1.584-5.036-3.711H.957v2.332A8.997 8.997 0 009 18z" fill="#34A853"/>
                <path d="M3.964 10.71A5.41 5.41 0 013.682 9c0-.593.102-1.17.282-1.71V4.958H.957A8.996 8.996 0 000 9c0 1.452.348 2.827.957 4.042l3.007-2.332z" fill="#FBBC05"/>
                <path d="M9 3.58c1.321 0 2.508.454 3.44 1.345l2.582-2.58C13.463.891 11.426 0 9 0A8.997 8.997 0 00.957 4.958L3.964 7.29C4.672 5.163 6.656 3.58 9 3.58z" fill="#EA4335"/>
              </svg>
              Continue with Google
            </button>
          </form>

          <p className="text-center text-sm text-on-surface-variant mt-6">
            Don't have an account?{' '}
            <Link to="/register" className="text-primary font-jakarta font-700 hover:underline">Register</Link>
          </p>

          <p className="text-center text-xs text-on-surface-variant mt-4 opacity-60">
            Demo: student@demo.com / student
          </p>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
