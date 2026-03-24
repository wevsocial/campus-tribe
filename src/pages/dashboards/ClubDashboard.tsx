import { useState } from 'react'
import { Users, Calendar, BarChart3, DollarSign, Plus, Edit2, Trash2 } from 'lucide-react'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'

const memberData = [
  { month: 'Sep', members: 12 },
  { month: 'Oct', members: 18 },
  { month: 'Nov', members: 22 },
  { month: 'Dec', members: 19 },
  { month: 'Jan', members: 28 },
  { month: 'Feb', members: 35 },
  { month: 'Mar', members: 42 },
]

const members = [
  { name: 'Alex Johnson', role: 'President', joined: 'Sep 2025', email: 'alex@uni.edu' },
  { name: 'Sarah Kim', role: 'Vice President', joined: 'Sep 2025', email: 'sarah@uni.edu' },
  { name: 'Jordan Lee', role: 'Treasurer', joined: 'Oct 2025', email: 'jordan@uni.edu' },
  { name: 'Priya Patel', role: 'Member', joined: 'Jan 2026', email: 'priya@uni.edu' },
  { name: 'Marcus Chen', role: 'Member', joined: 'Feb 2026', email: 'marcus@uni.edu' },
]

const budget = {
  allocated: 5000,
  spent: 2340,
  requested: 800,
}

const events = [
  { title: 'Photography Walk', date: 'Mar 28', attendees: 18, capacity: 25, status: 'upcoming' },
  { title: 'Portfolio Review Night', date: 'Apr 5', attendees: 0, capacity: 40, status: 'upcoming' },
  { title: 'Spring Exhibition', date: 'Apr 20', attendees: 0, capacity: 100, status: 'upcoming' },
]

export default function ClubDashboard() {
  const [showNewEvent, setShowNewEvent] = useState(false)

  return (
    <div className="p-6 max-w-7xl">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="font-headline font-900 text-2xl text-on-surface">Photography Club</h1>
          <p className="text-on-surface-variant text-sm">42 members · Arts · Active</p>
        </div>
        <button className="btn-primary flex items-center gap-2">
          <Plus size={16} /> Create Event
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {[
          { label: 'Total Members', value: '42', icon: <Users size={18} />, color: 'text-primary bg-primary/10' },
          { label: 'Events Hosted', value: '8', icon: <Calendar size={18} />, color: 'text-tertiary bg-tertiary/10' },
          { label: 'Avg Attendance', value: '76%', icon: <BarChart3 size={18} />, color: 'text-secondary bg-secondary/10' },
          { label: 'Budget Remaining', value: `$${(budget.allocated - budget.spent).toLocaleString()}`, icon: <DollarSign size={18} />, color: 'text-tertiary bg-tertiary/10' },
        ].map(s => (
          <div key={s.label} className="card">
            <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${s.color} mb-3`}>{s.icon}</div>
            <div className="font-headline font-900 text-2xl text-on-surface">{s.value}</div>
            <div className="text-on-surface-variant text-xs font-label">{s.label}</div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Membership Growth */}
        <div className="lg:col-span-2 card">
          <h2 className="font-headline font-800 text-base text-on-surface mb-4">Membership Growth</h2>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={memberData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#F7F8FC" />
              <XAxis dataKey="month" tick={{ fontSize: 11, fill: '#4A4E63' }} />
              <YAxis tick={{ fontSize: 11, fill: '#4A4E63' }} />
              <Tooltip contentStyle={{ fontSize: 11, borderRadius: 8 }} />
              <Bar dataKey="members" fill="#0047AB" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Budget Tracker */}
        <div className="card">
          <h2 className="font-headline font-800 text-base text-on-surface mb-4">Budget Tracker</h2>
          <div className="flex flex-col gap-4">
            {[
              { label: 'Allocated', amount: budget.allocated, color: 'bg-primary', pct: 100 },
              { label: 'Spent', amount: budget.spent, color: 'bg-secondary', pct: (budget.spent / budget.allocated) * 100 },
              { label: 'Requested', amount: budget.requested, color: 'bg-yellow-400', pct: (budget.requested / budget.allocated) * 100 },
            ].map(b => (
              <div key={b.label}>
                <div className="flex justify-between text-xs mb-1">
                  <span className="font-label font-bold text-on-surface-variant">{b.label}</span>
                  <span className="font-label font-bold text-on-surface">${b.amount.toLocaleString()}</span>
                </div>
                <div className="h-2 bg-surface rounded-full overflow-hidden">
                  <div className={`h-full ${b.color} rounded-full`} style={{ width: `${b.pct}%` }} />
                </div>
              </div>
            ))}
          </div>

          <div className="mt-4 pt-4 border-t border-surface">
            <button className="w-full text-xs px-3 py-2 border-2 border-primary/30 text-primary rounded-lg font-label font-bold hover:bg-primary/10 transition-colors">
              Request Additional Budget
            </button>
          </div>
        </div>
      </div>

      {/* Member Roster */}
      <div className="card mt-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-headline font-800 text-base text-on-surface">Member Roster</h2>
          <button className="btn-outline text-xs px-4 py-2 flex items-center gap-1">
            <Plus size={12} /> Add Member
          </button>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-surface text-left">
                <th className="pb-3 font-label font-bold text-on-surface-variant text-xs">Name</th>
                <th className="pb-3 font-label font-bold text-on-surface-variant text-xs">Role</th>
                <th className="pb-3 font-label font-bold text-on-surface-variant text-xs">Email</th>
                <th className="pb-3 font-label font-bold text-on-surface-variant text-xs">Joined</th>
                <th className="pb-3"></th>
              </tr>
            </thead>
            <tbody>
              {members.map((m, i) => (
                <tr key={i} className="border-b border-surface/50 hover:bg-surface/50 transition-colors">
                  <td className="py-3">
                    <div className="flex items-center gap-2">
                      <div className="w-7 h-7 rounded-full bg-hero-gradient flex items-center justify-center text-white text-xs font-label font-bold">
                        {m.name.charAt(0)}
                      </div>
                      <span className="font-label font-bold text-sm text-on-surface">{m.name}</span>
                    </div>
                  </td>
                  <td className="py-3">
                    <span className={`text-xs px-2 py-1 rounded-full font-label font-bold
                      ${m.role === 'President' ? 'bg-primary/10 text-primary' : m.role === 'Vice President' ? 'bg-tertiary/10 text-tertiary' : m.role === 'Treasurer' ? 'bg-secondary/10 text-secondary' : 'bg-surface text-on-surface-variant'}`}>
                      {m.role}
                    </span>
                  </td>
                  <td className="py-3 text-xs text-on-surface-variant">{m.email}</td>
                  <td className="py-3 text-xs text-on-surface-variant">{m.joined}</td>
                  <td className="py-3">
                    <div className="flex items-center gap-2">
                      <button className="text-on-surface-variant hover:text-primary transition-colors"><Edit2 size={14} /></button>
                      <button className="text-on-surface-variant hover:text-red-500 transition-colors"><Trash2 size={14} /></button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Events */}
      <div className="card mt-6">
        <h2 className="font-headline font-800 text-base text-on-surface mb-4">Upcoming Events</h2>
        <div className="flex flex-col gap-3">
          {events.map((ev, i) => (
            <div key={i} className="flex items-center justify-between p-3 bg-surface rounded-lg">
              <div>
                <div className="font-label font-bold text-sm text-on-surface">{ev.title}</div>
                <div className="text-xs text-on-surface-variant">{ev.date} · {ev.attendees > 0 ? `${ev.attendees} RSVPs` : 'No RSVPs yet'} / {ev.capacity} cap</div>
              </div>
              <div className="flex gap-2">
                <button className="text-xs px-3 py-1.5 border border-primary/30 text-primary rounded-lg font-label font-bold hover:bg-primary/10 transition-colors">
                  Edit
                </button>
                <button className="text-xs px-3 py-1.5 bg-primary text-white rounded-lg font-label font-bold hover:bg-primary/90 transition-colors">
                  View
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
