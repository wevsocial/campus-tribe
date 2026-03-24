import React, { useState } from 'react';
import { DashboardLayout } from '../../components/layout/DashboardLayout';
import { useAuthStore } from '../../store/authStore';
import { Card } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import { Button } from '../../components/ui/Button';
import {
  LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer
} from 'recharts';
import { BookOpen, Plus } from 'lucide-react';

const classes = [
  { id: 'cs101', name: 'Introduction to Computer Science', code: 'CS 101', students: 32, room: 'BA 2175', time: 'Mon/Wed/Fri 9:00-10:00 AM', avg: 84 },
  { id: 'cs201', name: 'Data Structures', code: 'CS 201', students: 28, room: 'SS 2117', time: 'Tue/Thu 2:00-3:30 PM', avg: 78 },
  { id: 'cs301', name: 'Algorithms', code: 'CS 301', students: 22, room: 'UC 244', time: 'Mon/Wed 11:00 AM-12:30 PM', avg: 76 },
];

const rosterData = [
  { id: 1, name: 'Alex Kim', email: 'alex.kim@demo.com', grade: 'A', attendance: '95%', assignments: '12/13', status: 'good' },
  { id: 2, name: 'Sarah Chen', email: 'sarah.chen@demo.com', grade: 'B+', attendance: '88%', assignments: '11/13', status: 'good' },
  { id: 3, name: 'Marcus Thorne', email: 'marcus.thorne@demo.com', grade: 'C+', attendance: '72%', assignments: '9/13', status: 'at-risk' },
  { id: 4, name: 'Priya Sharma', email: 'priya.sharma@demo.com', grade: 'A+', attendance: '100%', assignments: '13/13', status: 'good' },
  { id: 5, name: 'Elias Vance', email: 'elias.vance@demo.com', grade: 'B', attendance: '84%', assignments: '10/13', status: 'good' },
  { id: 6, name: 'Jordan Lee', email: 'jordan.lee@demo.com', grade: 'D', attendance: '61%', assignments: '7/13', status: 'at-risk' },
  { id: 7, name: 'Nina Park', email: 'nina.park@demo.com', grade: 'A-', attendance: '92%', assignments: '12/13', status: 'good' },
  { id: 8, name: 'Tobias Wells', email: 'tobias.wells@demo.com', grade: 'B-', attendance: '80%', assignments: '10/13', status: 'good' },
];

const assignments = [
  { id: 1, title: 'Assignment 1: Array Manipulation', due: '2026-03-10', submitted: 30, graded: 30, total: 32, avgScore: 82 },
  { id: 2, title: 'Midterm Project: Data Parser', due: '2026-03-17', submitted: 29, graded: 25, total: 32, avgScore: 78 },
  { id: 3, title: 'Assignment 2: Linked Lists', due: '2026-03-24', submitted: 18, graded: 0, total: 32, avgScore: null },
  { id: 4, title: 'Lab 3: Sorting Algorithms', due: '2026-03-31', submitted: 0, graded: 0, total: 32, avgScore: null },
];

const performanceData = [
  { month: 'Sep', classAvg: 79, topScore: 96, passRate: 94 },
  { month: 'Oct', classAvg: 81, topScore: 98, passRate: 91 },
  { month: 'Nov', classAvg: 77, topScore: 95, passRate: 87 },
  { month: 'Dec', classAvg: 75, topScore: 94, passRate: 84 },
  { month: 'Jan', classAvg: 82, topScore: 99, passRate: 90 },
  { month: 'Feb', classAvg: 84, topScore: 97, passRate: 93 },
  { month: 'Mar', classAvg: 84, topScore: 100, passRate: 94 },
];

const attendanceToday = [
  { name: 'Alex Kim', status: 'present' },
  { name: 'Sarah Chen', status: 'present' },
  { name: 'Marcus Thorne', status: 'absent' },
  { name: 'Priya Sharma', status: 'present' },
  { name: 'Elias Vance', status: 'late' },
  { name: 'Jordan Lee', status: 'absent' },
  { name: 'Nina Park', status: 'present' },
  { name: 'Tobias Wells', status: 'present' },
];

const tabs = ['My Classes', 'Attendance', 'Assignments', 'Grading', 'Students', 'Analytics', 'Announcements'];

export default function TeacherDashboard() {
  const { user } = useAuthStore();
  const [activeTab, setActiveTab] = useState('My Classes');
  const [selectedClass, setSelectedClass] = useState(classes[0]);
  const [attendance, setAttendance] = useState<Record<string, string>>(
    Object.fromEntries(attendanceToday.map((s) => [s.name, s.status]))
  );

  const hour = new Date().getHours();
  const greeting = hour < 12 ? 'Good morning' : hour < 17 ? 'Good afternoon' : 'Good evening';

  return (
    <DashboardLayout>
      {/* Header */}
      <div className="mb-8">
        <h1 className="font-lexend font-bold text-3xl text-gray-900">{greeting}, {user?.name?.split(' ')[0] || 'Professor'} 👩‍🏫</h1>
        <p className="text-gray-500 mt-1">Here is your teaching overview for today.</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        <div className="bg-white rounded-xl border border-black/5 shadow-sm p-5">
              <div className="text-3xl font-lexend font-extrabold text-gray-900">3</div>
              <div className="mt-1 text-sm text-gray-500">Classes</div>
            </div>
        <div className="bg-white rounded-xl border border-black/5 shadow-sm p-5">
              <div className="text-3xl font-lexend font-extrabold text-gray-900">82</div>
              <div className="mt-1 text-sm text-gray-500">Total Students</div>
            </div>
        <div className="bg-white rounded-xl border border-black/5 shadow-sm p-5">
              <div className="text-3xl font-lexend font-extrabold text-gray-900">4</div>
              <div className="mt-1 text-sm text-gray-500">Assignments Active</div>
            </div>
        <div className="bg-white rounded-xl border border-black/5 shadow-sm p-5">
              <div className="text-3xl font-lexend font-extrabold text-gray-900">2</div>
              <div className="mt-1 text-sm text-gray-500">At-Risk Students</div>
            </div>
      </div>

      {/* Tab Nav */}
      <div className="flex gap-1 mb-6 overflow-x-auto bg-gray-100 rounded-xl p-1">
        {tabs.map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-colors ${
              activeTab === tab ? 'bg-white text-[#0047AB] shadow-sm' : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* My Classes Tab */}
      {activeTab === 'My Classes' && (
        <div className="space-y-4">
          {classes.map((cls) => (
            <Card key={cls.id}>
              <div className="flex flex-col md:flex-row md:items-center gap-4 justify-between">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-blue-50 rounded-xl flex items-center justify-center">
                    <BookOpen size={22} className="text-[#0047AB]" />
                  </div>
                  <div>
                    <div className="font-semibold text-gray-900">{cls.name}</div>
                    <div className="text-sm text-gray-400">{cls.code} | {cls.room} | {cls.time}</div>
                  </div>
                </div>
                <div className="flex items-center gap-6 text-sm">
                  <div className="text-center">
                    <div className="font-bold text-gray-900">{cls.students}</div>
                    <div className="text-gray-400">Students</div>
                  </div>
                  <div className="text-center">
                    <div className="font-bold text-[#00A86B]">{cls.avg}%</div>
                    <div className="text-gray-400">Class Avg</div>
                  </div>
                  <Button variant="outline" size="sm" onClick={() => { setSelectedClass(cls); setActiveTab('Attendance'); }}>
                    Manage
                  </Button>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* Attendance Tab */}
      {activeTab === 'Attendance' && (
        <div>
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="font-semibold text-gray-900 text-lg">{selectedClass.name}</h2>
              <p className="text-sm text-gray-400">Today, {new Date().toLocaleDateString('en-CA', { weekday: 'long', month: 'long', day: 'numeric' })}</p>
            </div>
            <div className="flex gap-2">
              {classes.map((cls) => (
                <button
                  key={cls.id}
                  onClick={() => setSelectedClass(cls)}
                  className={`px-3 py-1.5 rounded-full text-xs font-medium transition-colors ${
                    selectedClass.id === cls.id ? 'bg-[#0047AB] text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
                >
                  {cls.code}
                </button>
              ))}
            </div>
          </div>
          <div className="grid grid-cols-3 gap-4 mb-6">
            {[
              { label: 'Present', count: Object.values(attendance).filter(s => s === 'present').length, color: '#00A86B' },
              { label: 'Absent', count: Object.values(attendance).filter(s => s === 'absent').length, color: '#EF4444' },
              { label: 'Late', count: Object.values(attendance).filter(s => s === 'late').length, color: '#F59E0B' },
            ].map((s) => (
              <div key={s.label} className="bg-white rounded-xl p-4 text-center border border-black/5 shadow-sm">
                <div className="text-2xl font-bold" style={{ color: s.color }}>{s.count}</div>
                <div className="text-sm text-gray-400">{s.label}</div>
              </div>
            ))}
          </div>
          <Card>
            <div className="space-y-3">
              {attendanceToday.map((student) => (
                <div key={student.name} className="flex items-center justify-between py-2 border-b border-gray-50 last:border-0">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 bg-gray-100 rounded-full flex items-center justify-center font-medium text-gray-600">
                      {student.name[0]}
                    </div>
                    <span className="font-medium text-gray-800">{student.name}</span>
                  </div>
                  <div className="flex gap-2">
                    {['present', 'late', 'absent'].map((status) => (
                      <button
                        key={status}
                        onClick={() => setAttendance(prev => ({ ...prev, [student.name]: status }))}
                        className={`px-3 py-1 rounded-full text-xs font-medium capitalize transition-colors ${
                          attendance[student.name] === status
                            ? status === 'present' ? 'bg-green-500 text-white'
                            : status === 'late' ? 'bg-yellow-400 text-white'
                            : 'bg-red-500 text-white'
                            : 'bg-gray-100 text-gray-500 hover:bg-gray-200'
                        }`}
                      >
                        {status}
                      </button>
                    ))}
                  </div>
                </div>
              ))}
            </div>
            <div className="mt-4">
              <Button variant="primary">Save Attendance</Button>
            </div>
          </Card>
        </div>
      )}

      {/* Assignments Tab */}
      {activeTab === 'Assignments' && (
        <div>
          <div className="flex justify-between items-center mb-4">
            <h2 className="font-semibold text-gray-900 text-lg">Assignments - {selectedClass.code}</h2>
            <Button variant="primary" size="sm" icon={<Plus size={14} />}>New Assignment</Button>
          </div>
          <div className="space-y-4">
            {assignments.map((a) => (
              <Card key={a.id}>
                <div className="flex flex-col md:flex-row md:items-center gap-4 justify-between">
                  <div>
                    <div className="font-semibold text-gray-900">{a.title}</div>
                    <div className="text-sm text-gray-400">Due: {a.due}</div>
                  </div>
                  <div className="flex items-center gap-6 text-sm">
                    <div className="text-center">
                      <div className="font-bold text-gray-900">{a.submitted}/{a.total}</div>
                      <div className="text-gray-400">Submitted</div>
                    </div>
                    <div className="text-center">
                      <div className="font-bold text-gray-900">{a.graded}/{a.total}</div>
                      <div className="text-gray-400">Graded</div>
                    </div>
                    <div className="text-center">
                      <div className="font-bold text-[#0047AB]">{a.avgScore !== null ? `${a.avgScore}%` : '--'}</div>
                      <div className="text-gray-400">Avg Score</div>
                    </div>
                    <Button variant="outline" size="sm">
                      {a.graded < a.submitted ? 'Grade' : 'View'}
                    </Button>
                  </div>
                </div>
                <div className="mt-3">
                  <div className="h-1.5 bg-gray-100 rounded-full">
                    <div
                      className="h-1.5 bg-[#0047AB] rounded-full transition-all"
                      style={{ width: `${(a.submitted / a.total) * 100}%` }}
                    />
                  </div>
                  <div className="text-xs text-gray-400 mt-1">{Math.round((a.submitted / a.total) * 100)}% submission rate</div>
                </div>
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* Students (Notes) Tab */}
      {activeTab === 'Students' && (
        <div>
          <div className="flex justify-between items-center mb-4">
            <h2 className="font-semibold text-gray-900 text-lg">Student Directory and Notes</h2>
            <div className="flex gap-2">
              <Badge variant="warning" label={`2 At-Risk`} />
            </div>
          </div>
          <Card>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-gray-400 border-b border-gray-100">
                    <th className="text-left py-3 font-medium">Student</th>
                    <th className="text-left py-3 font-medium">Grade</th>
                    <th className="text-left py-3 font-medium">Attendance</th>
                    <th className="text-left py-3 font-medium">Assignments</th>
                    <th className="text-left py-3 font-medium">Status</th>
                    <th className="text-left py-3 font-medium">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {rosterData.map((s) => (
                    <tr key={s.id} className="border-b border-gray-50 last:border-0 hover:bg-gray-50 transition-colors">
                      <td className="py-3">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center font-medium text-gray-600 text-xs">{s.name[0]}</div>
                          <div>
                            <div className="font-medium text-gray-900">{s.name}</div>
                            <div className="text-gray-400 text-xs">{s.email}</div>
                          </div>
                        </div>
                      </td>
                      <td className="py-3 font-semibold text-[#0047AB]">{s.grade}</td>
                      <td className="py-3 text-gray-600">{s.attendance}</td>
                      <td className="py-3 text-gray-600">{s.assignments}</td>
                      <td className="py-3">
                        <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                          s.status === 'at-risk' ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'
                        }`}>
                          {s.status === 'at-risk' ? 'At Risk' : 'Good Standing'}
                        </span>
                      </td>
                      <td className="py-3">
                        <button className="text-xs text-[#0047AB] hover:underline">Add Note</button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>
        </div>
      )}

      {/* Analytics Tab */}
      {activeTab === 'Analytics' && (
        <div className="space-y-6">
          <Card>
            <h3 className="font-semibold text-gray-900 mb-4">Class Average Over Time -- CS 101</h3>
            <ResponsiveContainer width="100%" height={250}>
              <LineChart data={performanceData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis dataKey="month" tick={{ fontSize: 12, fill: '#9ca3af' }} />
                <YAxis domain={[60, 100]} tick={{ fontSize: 12, fill: '#9ca3af' }} />
                <Tooltip />
                <Line type="monotone" dataKey="classAvg" stroke="#0047AB" strokeWidth={2} dot={{ r: 4 }} name="Class Avg" />
                <Line type="monotone" dataKey="topScore" stroke="#00A86B" strokeWidth={2} dot={{ r: 4 }} name="Top Score" />
              </LineChart>
            </ResponsiveContainer>
          </Card>
          <Card>
            <h3 className="font-semibold text-gray-900 mb-4">Monthly Pass Rate (%)</h3>
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={performanceData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis dataKey="month" tick={{ fontSize: 12, fill: '#9ca3af' }} />
                <YAxis domain={[60, 100]} tick={{ fontSize: 12, fill: '#9ca3af' }} />
                <Tooltip />
                <Bar dataKey="passRate" fill="#FF7F50" radius={[4, 4, 0, 0]} name="Pass Rate %" />
              </BarChart>
            </ResponsiveContainer>
          </Card>
        </div>
      )}

      {/* Grading Tab */}
      {activeTab === 'Grading' && (
        <div>
          <h2 className="font-semibold text-gray-900 text-lg mb-4">Grade Submissions</h2>
          <Card>
            <div className="flex items-center gap-3 mb-4">
              <select className="text-sm border border-gray-200 rounded-lg px-3 py-2 text-gray-700">
                {assignments.map((a) => (
                  <option key={a.id}>{a.title}</option>
                ))}
              </select>
              <Badge variant="warning" label="4 Ungraded" />
            </div>
            <div className="space-y-3">
              {rosterData.slice(0, 5).map((s) => (
                <div key={s.id} className="flex items-center justify-between py-3 border-b border-gray-50">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center font-medium text-xs text-gray-600">{s.name[0]}</div>
                    <span className="font-medium text-gray-800">{s.name}</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <input
                      type="number"
                      min={0}
                      max={100}
                      defaultValue={Math.floor(Math.random() * 30 + 70)}
                      className="w-20 text-center border border-gray-200 rounded-lg px-2 py-1.5 text-sm"
                    />
                    <span className="text-gray-400 text-sm">/ 100</span>
                    <textarea className="border border-gray-200 rounded-lg px-2 py-1 text-xs text-gray-600 w-40 h-9 resize-none" placeholder="Feedback..." />
                    <Button variant="outline" size="sm">Save</Button>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </div>
      )}

      {/* Announcements Tab */}
      {activeTab === 'Announcements' && (
        <div>
          <div className="flex justify-between items-center mb-4">
            <h2 className="font-semibold text-gray-900 text-lg">Class Announcements</h2>
            <Button variant="primary" size="sm" icon={<Plus size={14} />}>Post Announcement</Button>
          </div>
          <div className="space-y-4">
            {[
              { title: 'Midterm results posted', body: 'Great effort everyone! Midterm grades are now visible on the platform. Overall class average was 78%. Individual feedback has been added to each submission.', date: '2026-03-20', classes: ['CS 101', 'CS 201'] },
              { title: 'Assignment 3 deadline extended', body: 'Due to the campus-wide power outage on Friday, the deadline for Assignment 3 has been moved to March 31. Please use the extra time wisely.', date: '2026-03-18', classes: ['CS 101'] },
              { title: 'Guest lecture next week', body: 'We have a special guest lecture from Dr. Emily Park from Google Brain on Tuesday April 1. Attendance is mandatory. Please complete the pre-reading in the course materials section.', date: '2026-03-15', classes: ['CS 201', 'CS 301'] },
            ].map((a) => (
              <Card key={a.title}>
                <div className="flex justify-between items-start mb-2">
                  <div className="font-semibold text-gray-900">{a.title}</div>
                  <div className="text-xs text-gray-400">{a.date}</div>
                </div>
                <p className="text-gray-600 text-sm mb-3">{a.body}</p>
                <div className="flex gap-2">
                  {a.classes.map((cls) => (
                    <span key={cls} className="px-2 py-0.5 bg-blue-50 text-blue-700 rounded-full text-xs font-medium">{cls}</span>
                  ))}
                </div>
              </Card>
            ))}
          </div>
        </div>
      )}
    </DashboardLayout>
  );
}
