import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import clsx from 'clsx';
import { GraduationCap, Users, Trophy, Settings, Monitor, ChevronRight, ChevronLeft } from 'lucide-react';

const ROLES = [
  { id: 'student', label: 'Student', icon: <GraduationCap size={24} />, desc: 'Join clubs, events, and sports leagues.' },
  { id: 'staff', label: 'Staff', icon: <Users size={24} />, desc: 'Manage student activities and venues.' },
  { id: 'coach', label: 'Coach', icon: <Trophy size={24} />, desc: 'Run sports leagues and track standings.' },
  { id: 'admin', label: 'Administrator', icon: <Settings size={24} />, desc: 'Oversee campus-wide engagement.' },
  { id: 'it_director', label: 'IT Director', icon: <Monitor size={24} />, desc: 'Configure integrations and system settings.' },
];

const INTERESTS = [
  'Photography', 'Robotics', 'Basketball', 'Soccer', 'Coding', 'Film', 'Sustainability',
  'Debate', 'Tennis', 'Music', 'Art', 'Gaming', 'Yoga', 'Running', 'Cooking', 'Travel',
];

const RegisterPage: React.FC = () => {
  const navigate = useNavigate();
  const [step, setStep] = useState(0);
  const [selectedRole, setSelectedRole] = useState('');
  const [form, setForm] = useState({ name: '', email: '', institution: '', password: '' });
  const [interests, setInterests] = useState<string[]>([]);
  const [bio, setBio] = useState('');

  const steps = ['Choose Role', 'Basic Info', 'Role Details', 'Profile'];

  const next = () => setStep((s) => Math.min(s + 1, 3));
  const prev = () => setStep((s) => Math.max(s - 1, 0));

  const toggleInterest = (interest: string) => {
    setInterests((prev) =>
      prev.includes(interest) ? prev.filter((i) => i !== interest) : [...prev, interest]
    );
  };

  const handleSubmit = () => {
    navigate('/login');
  };

  return (
    <div className="min-h-screen bg-surface flex flex-col items-center justify-center p-6">
      <Link to="/" className="font-lexend font-900 italic text-2xl text-primary mb-8">Campus Tribe</Link>

      <div className="w-full max-w-2xl bg-surface-lowest rounded-2xl shadow-rise overflow-hidden">
        {/* Progress bar */}
        <div className="h-1 bg-surface-high">
          <div
            className="h-full bg-primary transition-all duration-500"
            style={{ width: `${((step + 1) / 4) * 100}%` }}
          />
        </div>

        {/* Steps header */}
        <div className="flex border-b border-outline-variant/30">
          {steps.map((s, i) => (
            <div
              key={s}
              className={clsx(
                'flex-1 py-3 text-center text-xs font-jakarta font-700 transition-colors',
                i === step ? 'text-primary bg-primary-container/40' : i < step ? 'text-tertiary' : 'text-on-surface-variant'
              )}
            >
              {i < step ? '✓ ' : ''}{s}
            </div>
          ))}
        </div>

        <div className="p-8">
          {/* Step 0: Choose Role */}
          {step === 0 && (
            <div>
              <h2 className="font-lexend font-900 text-2xl text-on-surface mb-2">Choose your role</h2>
              <p className="text-on-surface-variant text-sm mb-6">Select the role that best describes you on campus.</p>
              <div className="grid gap-3">
                {ROLES.map((role) => (
                  <button
                    key={role.id}
                    onClick={() => setSelectedRole(role.id)}
                    className={clsx(
                      'flex items-center gap-4 p-4 rounded-xl border-2 text-left transition-all',
                      selectedRole === role.id
                        ? 'border-primary bg-primary-container/30'
                        : 'border-outline-variant/40 hover:border-primary/40 hover:bg-surface-low'
                    )}
                  >
                    <span className={clsx('p-2 rounded-xl', selectedRole === role.id ? 'bg-primary text-white' : 'bg-surface-high text-on-surface-variant')}>
                      {role.icon}
                    </span>
                    <div>
                      <p className="font-jakarta font-700 text-on-surface">{role.label}</p>
                      <p className="text-sm text-on-surface-variant">{role.desc}</p>
                    </div>
                    {selectedRole === role.id && <ChevronRight className="ml-auto text-primary" size={18} />}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Step 1: Basic Info */}
          {step === 1 && (
            <div>
              <h2 className="font-lexend font-900 text-2xl text-on-surface mb-2">Basic information</h2>
              <p className="text-on-surface-variant text-sm mb-6">Tell us about yourself to set up your account.</p>
              <div className="flex flex-col gap-4">
                <Input label="Full Name" placeholder="Alex Kim" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
                <Input label="Email" type="email" placeholder="you@utoronto.ca" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
                <Input label="Institution" placeholder="University of Toronto" value={form.institution} onChange={(e) => setForm({ ...form, institution: e.target.value })} hint="Search for your campus" />
                <Input label="Password" type="password" placeholder="Min 8 characters" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} />
              </div>
            </div>
          )}

          {/* Step 2: Role-specific */}
          {step === 2 && (
            <div>
              <h2 className="font-lexend font-900 text-2xl text-on-surface mb-2">Role details</h2>
              <p className="text-on-surface-variant text-sm mb-6">A few more details to personalize your experience.</p>
              <div className="flex flex-col gap-4">
                {selectedRole === 'student' && (
                  <>
                    <Input label="Student ID" placeholder="1234567890" />
                    <Input label="Program" placeholder="Computer Science" />
                    <Input label="Year of Study" placeholder="2nd Year" />
                  </>
                )}
                {(selectedRole === 'admin' || selectedRole === 'staff') && (
                  <>
                    <Input label="Department" placeholder="Student Life Office" />
                    <Input label="Job Title" placeholder="Student Affairs Coordinator" />
                    <Input label="Employee ID" placeholder="EMP-0042" />
                  </>
                )}
                {selectedRole === 'coach' && (
                  <>
                    <Input label="Sport" placeholder="Basketball, Soccer…" />
                    <Input label="Years Coaching" placeholder="5" />
                    <Input label="Coaching License #" placeholder="Optional" />
                  </>
                )}
                {selectedRole === 'it_director' && (
                  <>
                    <Input label="Department" placeholder="Information Technology" />
                    <Input label="Employee ID" placeholder="IT-0012" />
                  </>
                )}
              </div>
            </div>
          )}

          {/* Step 3: Profile */}
          {step === 3 && (
            <div>
              <h2 className="font-lexend font-900 text-2xl text-on-surface mb-2">Your profile</h2>
              <p className="text-on-surface-variant text-sm mb-6">Customize your profile to connect with the right people and clubs.</p>
              <div className="mb-6">
                <p className="text-sm font-jakarta font-700 text-on-surface mb-3">Interests</p>
                <div className="flex flex-wrap gap-2">
                  {INTERESTS.map((interest) => (
                    <button
                      key={interest}
                      onClick={() => toggleInterest(interest)}
                      className={clsx(
                        'px-3 py-1.5 rounded-full text-sm font-jakarta transition-all',
                        interests.includes(interest)
                          ? 'bg-primary text-white'
                          : 'bg-surface-high text-on-surface-variant hover:bg-surface-highest'
                      )}
                    >
                      {interest}
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <p className="text-sm font-jakarta font-700 text-on-surface mb-2">Bio</p>
                <textarea
                  className="w-full rounded-xl border border-outline-variant bg-surface-lowest p-3 text-sm text-on-surface placeholder:text-outline-variant focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary resize-none"
                  rows={4}
                  placeholder="Tell the campus about yourself..."
                  value={bio}
                  onChange={(e) => setBio(e.target.value)}
                />
              </div>
            </div>
          )}

          {/* Navigation */}
          <div className="flex items-center justify-between mt-8">
            <Button variant="outline" onClick={prev} disabled={step === 0} icon={<ChevronLeft size={16} />}>
              Back
            </Button>
            {step < 3 ? (
              <Button variant="primary" onClick={next} disabled={step === 0 && !selectedRole} icon={<ChevronRight size={16} />} iconPosition="right">
                Continue
              </Button>
            ) : (
              <Button variant="primary" onClick={handleSubmit}>
                Create Account
              </Button>
            )}
          </div>
        </div>
      </div>

      <p className="text-sm text-on-surface-variant mt-6">
        Already have an account?{' '}
        <Link to="/login" className="text-primary font-jakarta font-700 hover:underline">Sign in</Link>
      </p>
    </div>
  );
};

export default RegisterPage;
