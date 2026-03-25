import React, { useState } from 'react';
import { DashboardLayout } from '../../components/layout/DashboardLayout';
import { StatCard } from '../../components/ui/StatCard';
import { Card } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import { Button } from '../../components/ui/Button';
import { Modal } from '../../components/ui/Modal';
import { MOCK_ANALYTICS } from '../../lib/mockData';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, Legend, LineChart, Line
} from 'recharts';
import { AlertTriangle, Plus, TrendingUp, TrendingDown } from 'lucide-react';

const data = MOCK_ANALYTICS;

const admissionsKanban: Record<string, { id: number; name: string; program: string; date: string; avatar: number }[]> = {
  Applied: [
    { id: 1, name: 'Oliver Martinez', program: 'Computer Science', date: 'Mar 24', avatar: 21 },
    { id: 2, name: 'Sofia Nguyen', program: 'Business Admin', date: 'Mar 23', avatar: 22 },
    { id: 3, name: 'Ethan Brooks', program: 'Engineering', date: 'Mar 22', avatar: 23 },
  ],
  'Under Review': [
    { id: 4, name: 'Mia Johnson', program: 'Medicine', date: 'Mar 18', avatar: 24 },
    { id: 5, name: 'Noah Williams', program: 'Law', date: 'Mar 17', avatar: 25 },
  ],
  Admitted: [
    { id: 6, name: 'Isabella Taylor', program: 'Computer Science', date: 'Mar 10', avatar: 26 },
    { id: 7, name: 'Liam Davis', program: 'Engineering', date: 'Mar 9', avatar: 27 },
  ],
  Enrolled: [
    { id: 8, name: 'Emma Wilson', program: 'Psychology', date: 'Mar 5', avatar: 28 },
  ],
  Declined: [
    { id: 9, name: 'Ava Moore', program: 'Architecture', date: 'Mar 3', avatar: 29 },
  ],
};

const semesterBudgets = [
  { semester: 'Fall 2024', allocated: 850000, spent: 820000, remaining: 30000 },
  { semester: 'Winter 2025', allocated: 920000, spent: 890000, remaining: 30000 },
  { semester: 'Summer 2025', allocated: 340000, spent: 280000, remaining: 60000 },
  { semester: 'Fall 2025', allocated: 900000, spent: 870000, remaining: 30000 },
  { semester: 'Winter 2026', allocated: 950000, spent: 490000, remaining: 460000 },
];

const clubBudgetData = [
  { name: 'Athletics', budget: 85000 },
  { name: 'Photography', budget: 12000 },
  { name: 'Robotics', budget: 18000 },
  { name: 'Sustainability', budget: 9500 },
  { name: 'Debate', budget: 7200 },
  { name: 'Film Society', budget: 5800 },
];

const staffList = [
  { id: 1, name: 'Dr. Sarah Patel', role: 'Dean of Students', dept: 'Admin', status: 'active', avatar: 31 },
  { id: 2, name: 'Marcus Thompson', role: 'Athletics Coordinator', dept: 'Athletics', status: 'active', avatar: 32 },
  { id: 3, name: 'Leon Okafor', role: 'IT Director', dept: 'IT', status: 'active', avatar: 33 },
  { id: 4, name: 'Jennifer Wu', role: 'Registrar', dept: 'Academics', status: 'active', avatar: 34 },
  { id: 5, name: 'Carlos Rivera', role: 'Facilities Manager', dept: 'Operations', status: 'on-leave', avatar: 35 },
  { id: 6, name: 'Amanda Foster', role: 'Student Counselor', dept: 'Wellness', status: 'active', avatar: 36 },
];

const enrollmentTrend = [
  { month: 'Oct', students: 11200 },
  { month: 'Nov', students: 11600 },
  { month: 'Dec', students: 11400 },
  { month: 'Jan', students: 12100 },
  { month: 'Feb', students: 12500 },
  { month: 'Mar', students: 12847 },
];

const tabs = ['Overview', 'Admissions', 'Budget', 'Staff', 'Announcements'];

const KANBAN_COLS = ['Applied', 'Under Review', 'Admitted', 'Enrolled', 'Declined'];
const COL_COLORS: Record<string, string> = {
  Applied: '#6B7280',
  'Under Review': '#F59E0B',
  Admitted: '#0047AB',
  Enrolled: '#00A86B',
  Declined: '#EF4444',
};

const AdminDashboard: React.FC = () => {
  const [activeTab, setActiveTab] = useState('Overview');
  const [addStaffModal, setAddStaffModal] = useState(false);

  return (
    <DashboardLayout>
      {/* Hero Banner */}
      <div className="relative rounded-2xl overflow-hidden mb-8" style={{ height: 200 }}>
        <img
          src="https://images.unsplash.com/photo-1562774053-701939374585?w=800&q=80&auto=format"
          alt="Campus"
          className="absolute inset-0 w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-[#001a4d]/90 via-[#0047AB]/70 to-transparent" />
        <div className="relative z-10 h-full flex flex-col justify-center px-8">
          <h1 className="font-bold text-3xl text-white mb-1" style={{ fontFamily: 'Lexend, sans-serif' }}>Admin Overview</h1>
          <p className="text-blue-200 text-sm">University of Toronto - Spring 2026</p>
          <div className="flex gap-4 mt-4">
            {[{ label: '12,847 Students', icon: '🎓' }, { label: '342 Staff', icon: '👥' }, { label: '98.2% Uptime', icon: '✅' }].map(s => (
              <div key={s.label} className="flex items-center gap-1.5 bg-white/20 backdrop-blur-sm px-3 py-1.5 rounded-full text-white text-xs font-semibold">
                <span>{s.icon}</span><span>{s.label}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Alert */}
      <div className="flex items-center gap-3 bg-red-50 border border-red-200 rounded-xl px-5 py-4 mb-6">
        <AlertTriangle size={20} className="text-red-500 flex-shrink-0" />
        <div>
          <p className="text-sm font-jakarta font-700 text-red-700">47 students show disengagement signs</p>
          <p className="text-xs text-red-500 mt-0.5">Based on activity patterns over the last 30 days. Review recommended.</p>
        </div>
        <button className="ml-auto text-xs font-jakarta font-700 text-red-600 border border-red-300 px-3 py-1.5 rounded-lg hover:bg-red-100 transition-colors">
          Review
        </button>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 mb-6 overflow-x-auto bg-gray-100 rounded-xl p-1">
        {tabs.map(tab => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-colors ${activeTab === tab ? 'bg-white text-[#0047AB] shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* Overview Tab */}
      {activeTab === 'Overview' && (
        <div>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
            <StatCard value={data.activeStudents.toLocaleString()} label="Active Students" icon="people" color="primary" trend={8} />
            <StatCard value="342" label="Active Faculty" icon="school" color="tertiary" trend={3} />
            <StatCard value={data.totalClubs} label="Clubs Registered" icon="groups" color="secondary" trend={12} />
            <StatCard value={data.totalEvents} label="Events This Month" icon="calendar_month" color="danger" trend={5} />
          </div>

          <div className="grid lg:grid-cols-3 gap-6 mb-8">
            <div className="lg:col-span-2">
              <Card>
                <h2 className="font-lexend font-800 text-lg text-on-surface mb-4">Enrollment Trend (6 months)</h2>
                <ResponsiveContainer width="100%" height={220}>
                  <LineChart data={enrollmentTrend}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#BFC3D4" />
                    <XAxis dataKey="month" tick={{ fontSize: 11, fill: '#4A4E63' }} />
                    <YAxis domain={[10000, 14000]} tick={{ fontSize: 11, fill: '#4A4E63' }} />
                    <Tooltip />
                    <Line type="monotone" dataKey="students" stroke="#0047AB" strokeWidth={2.5} dot={{ r: 4 }} name="Students" />
                  </LineChart>
                </ResponsiveContainer>
              </Card>
            </div>
            <div>
              <Card>
                <h2 className="font-lexend font-800 text-lg text-on-surface mb-4">Clubs by Category</h2>
                <ResponsiveContainer width="100%" height={220}>
                  <PieChart>
                    <Pie data={data.clubsByCategory} cx="50%" cy="45%" innerRadius={50} outerRadius={75} dataKey="count" nameKey="category">
                      {data.clubsByCategory.map((entry: { category: string; count: number; color: string }, i: number) => (
                        <Cell key={i} fill={entry.color} />
                      ))}
                    </Pie>
                    <Legend iconSize={8} wrapperStyle={{ fontSize: '10px' }} formatter={(value) => <span style={{ color: '#4A4E63' }}>{value}</span>} />
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </Card>
            </div>
          </div>

          <div className="grid lg:grid-cols-2 gap-6">
            <Card>
              <h2 className="font-lexend font-800 text-lg text-on-surface mb-4">Weekly Engagement</h2>
              <ResponsiveContainer width="100%" height={200}>
                <BarChart data={data.weeklyTrend}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#BFC3D4" />
                  <XAxis dataKey="week" tick={{ fontSize: 10, fill: '#4A4E63' }} />
                  <YAxis tick={{ fontSize: 10, fill: '#4A4E63' }} />
                  <Tooltip />
                  <Bar dataKey="activeUsers" fill="#0047AB" name="Active Users" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="newSignups" fill="#BFC3D4" name="New Signups" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </Card>
            <Card padding="none" className="overflow-hidden">
              <div className="px-5 py-4 border-b border-outline-variant/30">
                <h2 className="font-lexend font-800 text-lg text-on-surface">Recent Activity</h2>
              </div>
              {[
                { icon: '📋', action: 'Photography Society submitted a venue booking request', time: '5 min ago' },
                { icon: '🆕', action: '12 new students registered via mobile app', time: '1h ago' },
                { icon: '🏆', action: 'Basketball league game scores updated by Coach Thompson', time: '2h ago' },
                { icon: '📅', action: 'Sustainability Fair event created by Priya Sharma', time: '4h ago' },
                { icon: '⚠️', action: '3 students flagged for low wellness scores', time: '6h ago' },
              ].map((item, i) => (
                <div key={i} className={`flex items-center gap-3 px-5 py-3 ${i < 4 ? 'border-b border-outline-variant/30' : ''}`}>
                  <span className="text-xl">{item.icon}</span>
                  <p className="text-sm text-on-surface flex-1">{item.action}</p>
                  <span className="text-xs text-on-surface-variant flex-shrink-0">{item.time}</span>
                </div>
              ))}
            </Card>
          </div>
        </div>
      )}

      {/* Admissions Tab */}
      {activeTab === 'Admissions' && (
        <div>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            {[
              { label: 'Total Applied', value: '2,341', trend: <TrendingUp size={14} className="text-green-600" /> },
              { label: 'Under Review', value: '189', trend: null },
              { label: 'Admitted', value: '423', trend: <TrendingUp size={14} className="text-green-600" /> },
              { label: 'Enrollment Rate', value: '67%', trend: <TrendingDown size={14} className="text-red-500" /> },
            ].map(s => (
              <div key={s.label} className="bg-white rounded-xl border border-black/5 shadow-sm p-5">
                <div className="flex items-center justify-between mb-1">
                  <div className="text-2xl font-lexend font-extrabold text-gray-900">{s.value}</div>
                  {s.trend}
                </div>
                <div className="text-sm text-gray-500">{s.label}</div>
              </div>
            ))}
          </div>
          <div className="grid grid-cols-2 lg:grid-cols-5 gap-4 overflow-x-auto">
            {KANBAN_COLS.map(col => (
              <div key={col}>
                <div className="flex items-center gap-2 mb-3">
                  <div className="w-2 h-2 rounded-full" style={{ backgroundColor: COL_COLORS[col] }} />
                  <span className="text-sm font-jakarta font-700 text-on-surface">{col}</span>
                  <span className="ml-auto text-xs bg-surface-low px-1.5 py-0.5 rounded-full text-on-surface-variant">{admissionsKanban[col].length}</span>
                </div>
                <div className="space-y-3">
                  {admissionsKanban[col].map(s => (
                    <div key={s.id} className="bg-white rounded-xl border border-outline-variant/30 shadow-sm p-3">
                      <div className="flex items-center gap-2 mb-1">
                        <img src={`https://i.pravatar.cc/32?img=${s.avatar}`} alt={s.name} className="w-8 h-8 rounded-full object-cover" />
                        <div>
                          <p className="text-xs font-jakarta font-700 text-on-surface leading-tight">{s.name}</p>
                          <p className="text-xs text-on-surface-variant">{s.program}</p>
                        </div>
                      </div>
                      <p className="text-xs text-on-surface-variant">{s.date}</p>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Budget Tab */}
      {activeTab === 'Budget' && (
        <div className="space-y-6">
          <Card padding="none" className="overflow-hidden">
            <div className="px-5 py-4 border-b border-outline-variant/30">
              <h2 className="font-lexend font-800 text-lg text-on-surface">Semester Budget Overview</h2>
            </div>
            <table className="w-full">
              <thead>
                <tr className="bg-surface-low border-b border-outline-variant/30">
                  {['Semester', 'Allocated', 'Spent', 'Remaining', '% Used'].map(h => (
                    <th key={h} className="text-left py-3 px-5 text-xs font-jakarta font-700 text-on-surface-variant">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {semesterBudgets.map((s, i) => {
                  const pct = Math.round((s.spent / s.allocated) * 100);
                  return (
                    <tr key={s.semester} className={i % 2 === 0 ? '' : 'bg-surface/50'}>
                      <td className="py-3 px-5 text-sm font-jakarta font-700 text-on-surface">{s.semester}</td>
                      <td className="py-3 px-5 text-sm text-on-surface-variant">${s.allocated.toLocaleString()}</td>
                      <td className="py-3 px-5 text-sm text-on-surface-variant">${s.spent.toLocaleString()}</td>
                      <td className="py-3 px-5 text-sm text-tertiary font-jakarta font-700">${s.remaining.toLocaleString()}</td>
                      <td className="py-3 px-5">
                        <div className="flex items-center gap-2">
                          <div className="h-1.5 w-20 bg-gray-100 rounded-full">
                            <div className="h-1.5 bg-[#0047AB] rounded-full" style={{ width: `${pct}%` }} />
                          </div>
                          <span className="text-xs text-on-surface-variant">{pct}%</span>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </Card>

          <div className="grid lg:grid-cols-2 gap-6">
            <Card>
              <h3 className="font-lexend font-800 text-base text-on-surface mb-4">Club Budget Allocation</h3>
              <ResponsiveContainer width="100%" height={220}>
                <BarChart data={clubBudgetData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#BFC3D4" />
                  <XAxis dataKey="name" tick={{ fontSize: 10, fill: '#4A4E63' }} />
                  <YAxis tick={{ fontSize: 10, fill: '#4A4E63' }} />
                  <Tooltip formatter={(val: any) => `$${val.toLocaleString()}`} />
                  <Bar dataKey="budget" fill="#FF7F50" radius={[4, 4, 0, 0]} name="Budget" />
                </BarChart>
              </ResponsiveContainer>
            </Card>
            <Card>
              <h3 className="font-lexend font-800 text-base text-on-surface mb-4">Quick Budget Adjustment</h3>
              <div className="space-y-4">
                <div>
                  <label className="text-sm font-jakarta font-700 text-on-surface block mb-1">Select Club</label>
                  <select className="w-full border border-outline-variant rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30">
                    {clubBudgetData.map(c => <option key={c.name}>{c.name}</option>)}
                  </select>
                </div>
                <div>
                  <label className="text-sm font-jakarta font-700 text-on-surface block mb-1">Adjustment Amount ($)</label>
                  <input type="number" className="w-full border border-outline-variant rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30" placeholder="e.g. 5000" />
                </div>
                <div>
                  <label className="text-sm font-jakarta font-700 text-on-surface block mb-1">Type</label>
                  <div className="flex gap-2">
                    <button className="flex-1 py-2 rounded-xl bg-green-50 text-green-700 text-sm font-medium border border-green-200">+ Increase</button>
                    <button className="flex-1 py-2 rounded-xl bg-red-50 text-red-600 text-sm font-medium border border-red-200">- Decrease</button>
                  </div>
                </div>
                <Button variant="primary" className="w-full">Submit Adjustment</Button>
              </div>
            </Card>
          </div>
        </div>
      )}

      {/* Staff Tab */}
      {activeTab === 'Staff' && (
        <div>
          <div className="flex justify-between items-center mb-4">
            <h2 className="font-lexend font-800 text-lg text-on-surface">Staff Directory</h2>
            <Button variant="primary" size="sm" icon={<Plus size={14} />} onClick={() => setAddStaffModal(true)}>
              Add Staff
            </Button>
          </div>
          <Card padding="none" className="overflow-hidden">
            <table className="w-full">
              <thead>
                <tr className="bg-surface-low border-b border-outline-variant/30">
                  {['Name', 'Role', 'Department', 'Status', 'Actions'].map(h => (
                    <th key={h} className="text-left py-3 px-5 text-xs font-jakarta font-700 text-on-surface-variant">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {staffList.map((s, i) => (
                  <tr key={s.id} className={i % 2 === 0 ? '' : 'bg-surface/50'}>
                    <td className="py-3 px-5">
                      <div className="flex items-center gap-3">
                        <img src={`https://i.pravatar.cc/36?img=${s.avatar}`} alt={s.name} className="w-9 h-9 rounded-full object-cover" />
                        <span className="text-sm font-jakarta font-700 text-on-surface">{s.name}</span>
                      </div>
                    </td>
                    <td className="py-3 px-5 text-sm text-on-surface-variant">{s.role}</td>
                    <td className="py-3 px-5 text-sm text-on-surface-variant">{s.dept}</td>
                    <td className="py-3 px-5">
                      <Badge label={s.status === 'active' ? 'Active' : 'On Leave'} variant={s.status === 'active' ? 'tertiary' : 'warning'} />
                    </td>
                    <td className="py-3 px-5">
                      <button className="text-xs text-[#0047AB] hover:underline mr-3">Edit</button>
                      <button className="text-xs text-red-500 hover:underline">Remove</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </Card>
        </div>
      )}

      {/* Announcements Tab */}
      {activeTab === 'Announcements' && (
        <div className="space-y-6">
          <Card>
            <h3 className="font-lexend font-800 text-base text-on-surface mb-4">Draft Announcement</h3>
            <div className="space-y-4">
              <div>
                <label className="text-sm font-jakarta font-700 text-on-surface block mb-1">Target Audience</label>
                <select className="w-full border border-outline-variant rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30">
                  <option>All Students</option>
                  <option>All Faculty</option>
                  <option>All Staff</option>
                  <option>Specific Platform</option>
                </select>
              </div>
              <div>
                <label className="text-sm font-jakarta font-700 text-on-surface block mb-1">Subject</label>
                <input type="text" className="w-full border border-outline-variant rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30" placeholder="Announcement subject..." />
              </div>
              <div>
                <label className="text-sm font-jakarta font-700 text-on-surface block mb-1">Message</label>
                <textarea className="w-full border border-outline-variant rounded-xl px-4 py-3 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-primary/30" rows={5} placeholder="Write your announcement here..." />
              </div>
              <Button variant="primary">Send Announcement</Button>
            </div>
          </Card>
          <Card>
            <h3 className="font-lexend font-800 text-base text-on-surface mb-4">Recent Announcements</h3>
            <div className="space-y-4">
              {[
                { title: 'Spring Registration Opens April 1', target: 'All Students', date: 'Mar 22', body: 'Course registration for the upcoming fall semester will open on April 1. Please review your academic plan with your advisor before registering.' },
                { title: 'Faculty Senate Meeting Notes Available', target: 'All Faculty', date: 'Mar 20', body: 'Notes from the March 19 Faculty Senate meeting are now available in the faculty portal under Documents.' },
              ].map((a, i) => (
                <div key={i} className="border-b border-outline-variant/30 pb-4 last:border-0 last:pb-0">
                  <div className="flex justify-between items-start mb-1">
                    <div>
                      <h4 className="font-jakarta font-700 text-sm text-on-surface">{a.title}</h4>
                      <Badge label={a.target} variant="neutral" />
                    </div>
                    <span className="text-xs text-on-surface-variant">{a.date}</span>
                  </div>
                  <p className="text-sm text-on-surface-variant mt-2">{a.body}</p>
                </div>
              ))}
            </div>
          </Card>
        </div>
      )}

      {/* Add Staff Modal */}
      <Modal isOpen={addStaffModal} onClose={() => setAddStaffModal(false)} title="Add New Staff Member" size="sm">
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-sm font-jakarta font-700 text-on-surface block mb-1">First Name</label>
              <input type="text" className="w-full border border-outline-variant rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30" />
            </div>
            <div>
              <label className="text-sm font-jakarta font-700 text-on-surface block mb-1">Last Name</label>
              <input type="text" className="w-full border border-outline-variant rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30" />
            </div>
          </div>
          <div>
            <label className="text-sm font-jakarta font-700 text-on-surface block mb-1">Email</label>
            <input type="email" className="w-full border border-outline-variant rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30" />
          </div>
          <div>
            <label className="text-sm font-jakarta font-700 text-on-surface block mb-1">Role</label>
            <input type="text" className="w-full border border-outline-variant rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30" placeholder="e.g. Student Advisor" />
          </div>
          <div>
            <label className="text-sm font-jakarta font-700 text-on-surface block mb-1">Department</label>
            <select className="w-full border border-outline-variant rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30">
              <option>Admin</option>
              <option>Academics</option>
              <option>Athletics</option>
              <option>IT</option>
              <option>Operations</option>
              <option>Wellness</option>
            </select>
          </div>
          <div className="flex gap-3">
            <Button variant="outline" className="flex-1" onClick={() => setAddStaffModal(false)}>Cancel</Button>
            <Button variant="primary" className="flex-1" onClick={() => setAddStaffModal(false)}>Add Staff</Button>
          </div>
        </div>
      </Modal>
    </DashboardLayout>
  );
};

export default AdminDashboard;
