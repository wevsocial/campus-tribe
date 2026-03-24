import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { GraduationCap, BookOpen, Dumbbell, BarChart3, Shield, ArrowRight } from 'lucide-react'
import { authApi } from '../lib/api'
import { useAuthStore } from '../store/authStore'
import type { UserRole } from '../types'

const roles = [
  { id: 'student' as UserRole, label: 'Student', icon: <GraduationCap size={20} /> },
  { id: 'staff' as UserRole, label: 'Staff / Teacher', icon: <BookOpen size={20} /> },
  { id: 'coach' as UserRole, label: 'Coach', icon: <Dumbbell size={20} /> },
  { id: 'admin' as UserRole, label: 'Admin', icon: <BarChart3 size={20} /> },
  { id: 'it_director' as UserRole, label: 'IT Director', icon: <Shield size={20} /> },
]

const dashboardRoutes: Record<UserRole, string> = {
  student: '/dashboard/student',
  staff: '/dashboard/admin',
  coach: '/dashboard/coach',
  admin: '/dashboard/admin',
  it_director: "/dashboard/admin",
  club_leader: "/dashboard/club",
}

export default function Register() {
  const [step, setStep] = useState(1)
  const [selectedRole, setSelectedRole] = useState<UserRole | null>(null)
  const [form, setForm] = useState({ fullName: '', email: '', password: '', institution: '' })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const { setUser, setToken } = useAuthStore()
  const navigate = useNavigate()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!selectedRole) { setError('Please select your role'); return }
    setLoading(true); setError('')
    try {
      const data = await authApi.signUp(form.email, form.password, form.fullName, selectedRole)
      if (data.session) {
        setToken(data.session.access_token)
        setUser({ id: data.user!.id, email: form.email, full_name: form.fullName, role: selectedRole, created_at: new Date().toISOString() })
        navigate(dashboardRoutes[selectedRole])
      } else {
        setError('Check your email to confirm your account.')
      }
    } catch (err: any) {
      setError(err.message || 'Registration failed')
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
          <h1 className="font-headline font-900 text-3xl text-on-surface mb-2">Join Campus Tribe</h1>
          <p className="text-on-surface-variant text-sm">Create your account in seconds</p>
        </div>

        <div className="card">
          {/* Step 1: Role */}
          {step === 1 && (
            <div>
              <h2 className="font-label font-bold text-sm text-on-surface-variant mb-4">I am a...</h2>
              <div className="flex flex-col gap-3">
                {roles.map(r => (
                  <button key={r.id} onClick={() => setSelectedRole(r.id)}
                    className={`flex items-center gap-3 px-4 py-3 rounded-lg border-2 transition-all text-sm font-label font-bold
                      ${selectedRole === r.id ? 'border-primary bg-primary/5 text-primary' : 'border-surface text-on-surface-variant hover:border-primary/30'}`}>
                    {r.icon}
                    {r.label}
                  </button>
                ))}
              </div>
              <button onClick={() => selectedRole && setStep(2)} disabled={!selectedRole}
                className="btn-primary w-full mt-6 flex items-center justify-center gap-2 disabled:opacity-60">
                Continue <ArrowRight size={16} />
              </button>
            </div>
          )}

          {/* Step 2: Details */}
          {step === 2 && (
            <form onSubmit={handleSubmit} className="flex flex-col gap-4">
              <button type="button" onClick={() => setStep(1)}
                className="text-xs text-on-surface-variant font-label font-bold hover:text-primary transition-colors text-left">
                ← Back to role selection
              </button>

              {[
                { label: 'Full Name', key: 'fullName', type: 'text', placeholder: 'Alex Johnson' },
                { label: 'Institution Email', key: 'email', type: 'email', placeholder: 'alex@university.edu' },
                { label: 'Institution / University Name', key: 'institution', type: 'text', placeholder: 'Westbrook University' },
                { label: 'Password', key: 'password', type: 'password', placeholder: '••••••••' },
              ].map(f => (
                <div key={f.key}>
                  <label className="block text-xs font-label font-bold text-on-surface-variant mb-1">{f.label}</label>
                  <input type={f.type} required placeholder={f.placeholder}
                    value={(form as any)[f.key]}
                    onChange={e => setForm(prev => ({ ...prev, [f.key]: e.target.value }))}
                    className="w-full border border-surface rounded-lg px-4 py-3 text-sm bg-surface focus:outline-none focus:border-primary transition-colors" />
                </div>
              ))}

              {error && <p className="text-red-500 text-xs font-label">{error}</p>}

              <button type="submit" disabled={loading}
                className="btn-primary flex items-center justify-center gap-2 disabled:opacity-60">
                {loading ? 'Creating account...' : (<>Create Account <ArrowRight size={16} /></>)}
              </button>

              <p className="text-xs text-on-surface-variant text-center">
                By creating an account you agree to our{' '}
                <a href="#" className="text-primary hover:underline">Terms</a> and{' '}
                <a href="#" className="text-primary hover:underline">Privacy Policy</a>
              </p>
            </form>
          )}

          <div className="mt-4 text-center text-sm text-on-surface-variant">
            Already have an account?{' '}
            <Link to="/login" className="text-primary font-label font-bold hover:underline">Sign in</Link>
          </div>
        </div>
      </div>
    </div>
  )
}
