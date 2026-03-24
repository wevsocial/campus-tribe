import { AreaChart, Area, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts'
import { AlertTriangle, CheckCircle, Clock, Users, Calendar, Building, ClipboardList } from 'lucide-react'

const engagementData = [
  { month: 'Sep', clubs: 65, events: 80, sports: 45 },
  { month: 'Oct', clubs: 72, events: 88, sports: 60 },
  { month: 'Nov', clubs: 68, events: 75, sports: 55 },
  { month: 'Dec', clubs: 45, events: 50, sports: 30 },
  { month: 'Jan', clubs: 78, events: 90, sports: 70 },
  { month: 'Feb', clubs: 85, events: 92, sports: 75 },
  { month: 'Mar', clubs: 88, events: 95, sports: 80 },
]

const pieData = [
  { name: 'Clubs', value: 38, color: '#0047AB' },
  { name: 'Sports', value: 27, color: '#FF7F50' },
  { name: 'Events', value: 35, color: '#00A86B' },
]

const atRiskStudents = [
  { name: 'Jordan Lee', issue: 'No activity in 21 days', severity: 'high', dept: 'Business' },
  { name: 'Maya Patel', issue: 'Missed 3 club meetings', severity: 'medium', dept: 'Engineering' },
  { name: 'Chris Wong', issue: 'Wellness score declining', severity: 'high', dept: 'Liberal Arts' },
  { name: 'Amara Diallo', issue: 'Low event attendance', severity: 'low', dept: 'Sciences' },
]

const clubApprovals = [
  { name: 'Anime & Manga Society', leader: 'Sarah Kim', members: 23, submitted: '2 days ago' },
  { name: 'Sustainability Hub', leader: 'Marcus T.', members: 12, submitted: '4 days ago' },
  { name: 'Pre-Law Network', leader: 'Diana Ross', members: 18, submitted: '1 week ago' },
]

const venues = [
  { name: 'Student Union A', capacity: 200, booked: 14, total: 30 },
  { name: 'Engineering Hall B3', capacity: 80, booked: 22, total: 30 },
  { name: 'Sports Field A', capacity: 500, booked: 8, total: 30 },
  { name: 'Auditorium', capacity: 1200, booked: 5, total: 30 },
]

export default function AdminDashboard() {
  return (
    <div className="p-6 max-w-7xl">
      <div className="mb-6">
        <h1 className="font-headline font-900 text-2xl text-on-surface">Campus Analytics</h1>
        <p className="text-on-surface-variant text-sm">Institution-wide engagement overview</p>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {[
          { label: 'Active Students', value: '3,847', change: '+12%', icon: <Users size={18} />, color: 'text-primary bg-primary/10' },
          { label: 'Club Participation', value: '68%', change: '+5%', icon: <ClipboardList size={18} />, color: 'text-tertiary bg-tertiary/10' },
          { label: 'Events This Month', value: '42', change: '+8', icon: <Calendar size={18} />, color: 'text-secondary bg-secondary/10' },
          { label: 'Venue Bookings', value: '127', change: '+23%', icon: <Building size={18} />, color: 'text-primary bg-primary/10' },
        ].map(s => (
          <div key={s.label} className="card">
            <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${s.color} mb-3`}>{s.icon}</div>
            <div className="font-headline font-900 text-2xl text-on-surface">{s.value}</div>
            <div className="text-on-surface-variant text-xs font-label">{s.label}</div>
            <div className="text-tertiary text-xs font-label font-bold mt-1">{s.change} this month</div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
        {/* Engagement Chart */}
        <div className="lg:col-span-2 card">
          <h2 className="font-headline font-800 text-base text-on-surface mb-4">Engagement Trends</h2>
          <ResponsiveContainer width="100%" height={220}>
            <AreaChart data={engagementData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#F7F8FC" />
              <XAxis dataKey="month" tick={{ fontSize: 11, fill: '#4A4E63' }} />
              <YAxis tick={{ fontSize: 11, fill: '#4A4E63' }} />
              <Tooltip contentStyle={{ fontSize: 11, borderRadius: 8 }} />
              <Area type="monotone" dataKey="clubs" stroke="#0047AB" fill="#0047AB20" strokeWidth={2} />
              <Area type="monotone" dataKey="events" stroke="#00A86B" fill="#00A86B10" strokeWidth={2} />
              <Area type="monotone" dataKey="sports" stroke="#FF7F50" fill="#FF7F5010" strokeWidth={2} />
            </AreaChart>
          </ResponsiveContainer>
          <div className="flex gap-4 mt-2">
            {[{ label: 'Clubs', color: '#0047AB' }, { label: 'Events', color: '#00A86B' }, { label: 'Sports', color: '#FF7F50' }].map(l => (
              <div key={l.label} className="flex items-center gap-1 text-xs text-on-surface-variant">
                <div className="w-3 h-3 rounded-full" style={{ background: l.color }} />
                {l.label}
              </div>
            ))}
          </div>
        </div>

        {/* Pie */}
        <div className="card">
          <h2 className="font-headline font-800 text-base text-on-surface mb-4">Engagement Breakdown</h2>
          <ResponsiveContainer width="100%" height={180}>
            <PieChart>
              <Pie data={pieData} cx="50%" cy="50%" innerRadius={50} outerRadius={80} dataKey="value">
                {pieData.map((entry, i) => <Cell key={i} fill={entry.color} />)}
              </Pie>
              <Tooltip contentStyle={{ fontSize: 11, borderRadius: 8 }} />
            </PieChart>
          </ResponsiveContainer>
          <div className="flex flex-col gap-2">
            {pieData.map(d => (
              <div key={d.name} className="flex items-center justify-between text-xs">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full" style={{ background: d.color }} />
                  <span className="text-on-surface-variant font-label">{d.name}</span>
                </div>
                <span className="font-label font-bold text-on-surface">{d.value}%</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* At-Risk Students */}
        <div className="card">
          <div className="flex items-center gap-2 mb-4">
            <AlertTriangle size={16} className="text-secondary" />
            <h2 className="font-headline font-800 text-base text-on-surface">At-Risk Alerts</h2>
          </div>
          <div className="flex flex-col gap-3">
            {atRiskStudents.map((s, i) => (
              <div key={i} className="flex items-start gap-3 p-3 bg-surface rounded-lg">
                <div className={`w-2 h-2 rounded-full mt-1.5 flex-shrink-0
                  ${s.severity === 'high' ? 'bg-red-500' : s.severity === 'medium' ? 'bg-secondary' : 'bg-yellow-400'}`} />
                <div>
                  <div className="font-label font-bold text-sm text-on-surface">{s.name}</div>
                  <div className="text-xs text-on-surface-variant">{s.issue}</div>
                  <div className="text-xs text-on-surface-variant/60 font-label">{s.dept}</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Club Approvals */}
        <div className="card">
          <h2 className="font-headline font-800 text-base text-on-surface mb-4">Pending Club Approvals</h2>
          <div className="flex flex-col gap-3">
            {clubApprovals.map((c, i) => (
              <div key={i} className="p-3 bg-surface rounded-lg">
                <div className="font-label font-bold text-sm text-on-surface mb-1">{c.name}</div>
                <div className="text-xs text-on-surface-variant mb-2">by {c.leader} · {c.members} founding members · {c.submitted}</div>
                <div className="flex gap-2">
                  <button className="text-xs px-3 py-1 bg-tertiary text-white rounded-full font-label font-bold hover:bg-tertiary/90 transition-colors">Approve</button>
                  <button className="text-xs px-3 py-1 bg-surface border border-surface text-on-surface-variant rounded-full font-label font-bold hover:bg-red-50 hover:text-red-500 transition-colors">Reject</button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Venue Usage */}
        <div className="card">
          <h2 className="font-headline font-800 text-base text-on-surface mb-4">Venue Usage This Month</h2>
          <div className="flex flex-col gap-3">
            {venues.map((v, i) => (
              <div key={i} className="p-3 bg-surface rounded-lg">
                <div className="flex justify-between mb-1">
                  <span className="font-label font-bold text-sm text-on-surface">{v.name}</span>
                  <span className="text-xs text-on-surface-variant font-label">cap {v.capacity}</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="flex-1 h-1.5 bg-surface-lowest rounded-full overflow-hidden">
                    <div className="h-full bg-primary rounded-full transition-all" style={{ width: `${(v.booked / v.total) * 100}%` }} />
                  </div>
                  <span className="text-xs text-on-surface-variant font-label">{v.booked}/{v.total} days</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
