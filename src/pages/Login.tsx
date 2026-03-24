import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { GraduationCap, BookOpen, Dumbbell, BarChart3, Shield, ArrowRight, Eye, EyeOff } from 'lucide-react'
import { authApi, usersApi } from '../lib/api'
import { useAuthStore } from '../store/authStore'
import type { UserRole } from '../types'

const roles = [
  { id: 'student' as UserRole, label: 'Student', icon: <GraduationCap size={24} />, color: 'text-primary' },
  { id: 'staff' as UserRole, label: 'Staff / Teacher', icon: <BookOpen size={24} />, color: 'text-tertiary' },
  { id: 'coach' as UserRole, label: 'Coach', icon: <Dumbbell size={24} />, color: 'text-secondary' },
  { id: 'admin' as UserRole, label: 'Admin', icon: <BarChart3 size={24} />, color: 'text-on-surface' },
  { id: 'it_director' as UserRole, label: 'IT Director', icon: <Shield size={24} />, color: 'text-primary' },
]

const dashboardRoutes: Record<UserRole, string> = {
  student: '/dashboard/student',
  staff: '/dashboard/admin',
  coach: '/dashboard/coach',
  admin: '/dashboard/admin',
  it_director: "/dashboard/admin",
  club_leader: "/dashboard/club",
}

export default function Login() {
  const [selectedRole, setSelectedRole] = useState<UserRole | null>(null)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPw, setShowPw] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const { setUser, setToken, setSelectedRole: storeSetRole } = useAuthStore()
  const navigate = useNavigate()

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!selectedRole) { setError('Please select your role'); return }
    setLoading(true); setError('')
    try {
      const data = await authApi.signIn(email, password)
      if (data.session) {
        setToken(data.session.access_token)
        storeSetRole(selectedRole)
        const profile = await usersApi.getProfile(data.user.id)
        if (profile) setUser(profile)
        else setUser({ id: data.user.id, email: data.user.email!, full_name: data.user.user_metadata.full_name || '', role: selectedRole, created_at: new Date().toISOString() })
        navigate(dashboardRoutes[selectedRole])
      }
    } catch (err: any) {
      setError(err.message || 'Login failed')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-surface flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <Link to="/" className="inline-flex items-center gap-2 mb-6">
            <div className="w-10 h-10 rounded-xl bg-hero-gradient flex items-center justify-center">
              <span className="text-white font-headline font-black text-base">CT</span>
            </div>
            <span className="font-headline font-800 text-xl text-on-surface">Campus Tribe</span>
          </Link>
          <h1 className="font-headline font-900 text-3xl text-on-surface mb-2">Welcome back</h1>
          <p className="text-on-surface-variant text-sm">Select your role to continue</p>
        </div>

        <div className="card">
          {/* Role selector */}
          <div className="grid grid-cols-5 gap-2 mb-6">
            {roles.map(r => (
              <button key={r.id} onClick={() => setSelectedRole(r.id)}
                className={`flex flex-col items-center gap-1 p-2 rounded-lg border-2 transition-all text-xs font-label font-bold
                  ${selectedRole === r.id ? 'border-primary bg-primary/5 text-primary' : 'border-surface text-on-surface-variant hover:border-primary/30'}`}>
                <span className={selectedRole === r.id ? 'text-primary' : r.color}>{r.icon}</span>
                <span className="text-center leading-tight text-[10px]">{r.label}</span>
              </button>
            ))}
          </div>

          <form onSubmit={handleLogin} className="flex flex-col gap-4">
            <div>
              <label className="block text-xs font-label font-bold text-on-surface-variant mb-1">Email</label>
              <input type="email" value={email} onChange={e => setEmail(e.target.value)} required
                className="w-full border border-surface rounded-lg px-4 py-3 text-sm bg-surface focus:outline-none focus:border-primary transition-colors"
                placeholder="you@university.edu" />
            </div>
            <div>
              <label className="block text-xs font-label font-bold text-on-surface-variant mb-1">Password</label>
              <div className="relative">
                <input type={showPw ? 'text' : 'password'} value={password} onChange={e => setPassword(e.target.value)} required
                  className="w-full border border-surface rounded-lg px-4 py-3 text-sm bg-surface focus:outline-none focus:border-primary transition-colors pr-10"
                  placeholder="••••••••" />
                <button type="button" onClick={() => setShowPw(!showPw)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-on-surface-variant">
                  {showPw ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            {error && <p className="text-red-500 text-xs font-label">{error}</p>}

            <button type="submit" disabled={loading}
              className="btn-primary flex items-center justify-center gap-2 disabled:opacity-60">
              {loading ? 'Signing in...' : (<>Sign In <ArrowRight size={16} /></>)}
            </button>
          </form>

          <div className="mt-4 text-center text-sm text-on-surface-variant">
            Don't have an account?{' '}
            <Link to="/register" className="text-primary font-label font-bold hover:underline">Sign up</Link>
          </div>
        </div>
      </div>
    </div>
  )
}
