import React, { useState } from 'react';
import { DashboardLayout } from '../../components/layout/DashboardLayout';
import { useAuthStore } from '../../store/authStore';
import { Card } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import { Button } from '../../components/ui/Button';
import {
  LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer
} from 'recharts';
import { BookOpen, Plus, AlertTriangle, Download, ChevronDown, ChevronRight } from 'lucide-react';

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

const courseModules = [
  {
    id: 1, course: 'CS 101', title: 'Introduction to Programming', lessons: [
      { id: 1, title: 'What is a Computer?', type: 'Video', duration: '12 min' },
      { id: 2, title: 'Variables and Types', type: 'Reading', duration: '20 min' },
      { id: 3, title: 'Basic Syntax Quiz', type: 'Quiz', duration: '15 min' },
    ]
  },
  {
    id: 2, course: 'CS 101', title: 'Control Flow', lessons: [
      { id: 4, title: 'If/Else Statements', type: 'Video', duration: '18 min' },
      { id: 5, title: 'Loops Lab', type: 'Assignment', duration: '45 min' },
    ]
  },
  {
    id: 3, course: 'CS 201', title: 'Arrays and Lists', lessons: [
      { id: 6, title: 'Array Fundamentals', type: 'Video', duration: '22 min' },
      { id: 7, title: 'Linked Lists', type: 'Reading', duration: '35 min' },
    ]
  },
];

const gradebookStudents = [
  { id: 1, name: 'Alex Kim', avatar: 1, a1: 88, a2: 92, midterm: 85, final: null },
  { id: 2, name: 'Sarah Chen', avatar: 2, a1: 76, a2: 85, midterm: 80, final: null },
  { id: 3, name: 'Marcus Thorne', avatar: 3, a1: 65, a2: 70, midterm: 58, final: null },
  { id: 4, name: 'Priya Sharma', avatar: 4, a1: 96, a2: 98, midterm: 94, final: null },
  { id: 5, name: 'Elias Vance', avatar: 5, a1: 82, a2: 79, midterm: 77, final: null },
  { id: 6, name: 'Jordan Lee', avatar: 6, a1: 55, a2: 60, midterm: 52, final: null },
];

const atRiskStudents = [
  { id: 1, name: 'Marcus Thorne', reason: 'Grade below 60%', detail: 'Current average: 57%. Missing 2 assignments.', avatar: 3 },
  { id: 2, name: 'Jordan Lee', reason: 'Missed 3+ classes', detail: 'Absent 4 times in last 3 weeks. Grade: 55%.', avatar: 6 },
];

const tabs = ['My Classes', 'Attendance', 'Assignments', 'Course Builder', 'Gradebook', 'At-Risk Students', 'Grading', 'Students', 'Analytics', 'Announcements'];

export default function TeacherDashboard() {
  const { user } = useAuthStore();
  const [activeTab, setActiveTab] = useState('My Classes');
  const [selectedClass, setSelectedClass] = useState(classes[0]);
  const [attendance, setAttendance] = useState<Record<string, string>>(
    Object.fromEntries(attendanceToday.map((s) => [s.name, s.status]))
  );
  const [expandedModules, setExpandedModules] = useState<Record<number, boolean>>({});
  const [grades, setGrades] = useState<Record<string, Record<string, string>>>({});

  const hour = new Date().getHours();
  const greeting = hour < 12 ? 'Good morning' : hour < 17 ? 'Good afternoon' : 'Good evening';

  return (
    <DashboardLayout>
      {/* Hero Banner */}
      <div className="relative rounded-2xl overflow-hidden mb-8" style={{ height: 200 }}>
        <img
          src="/assets/campus-school.jpg"
          alt="Classroom"
          className="absolute inset-0 w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-[#0047AB]/85 via-[#0047AB]/60 to-transparent" />
        <div className="relative z-10 h-full flex flex-col justify-center px-8">
          <p className="text-blue-200 text-sm mb-1">{greeting}</p>
          <h1 className="font-bold text-3xl text-white mb-1" style={{ fontFamily: 'Lexend, sans-serif' }}>
            {user?.name?.split(' ')[0] || 'Professor'} Crawford 👩‍🏫
          </h1>
          <p className="text-blue-100 text-sm">Here is your teaching overview for today.</p>
        </div>
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
              {attendanceToday.map((student, idx) => (
                <div key={student.name} className="flex items-center justify-between py-2 border-b border-gray-50 last:border-0">
                  <div className="flex items-center gap-3">
                    <img
                      src={`https://i.pravatar.cc/40?img=${idx + 1}`}
                      alt={student.name}
                      className="w-9 h-9 rounded-full object-cover"
                    />
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

      {/* Course Builder Tab */}
      {activeTab === 'Course Builder' && (
        <div>
          <div className="flex justify-between items-center mb-4">
            <h2 className="font-semibold text-gray-900 text-lg">Course Builder</h2>
            <div className="flex gap-2">
              <Button variant="outline" size="sm" icon={<Plus size={14} />}>Add Module</Button>
              <Button variant="primary" size="sm" icon={<Plus size={14} />}>Add Lesson</Button>
            </div>
          </div>
          <div className="space-y-4">
            {courseModules.map(mod => (
              <Card key={mod.id}>
                <button
                  className="w-full flex items-center justify-between"
                  onClick={() => setExpandedModules(prev => ({ ...prev, [mod.id]: !prev[mod.id] }))}
                >
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-blue-50 rounded-lg flex items-center justify-center">
                      <BookOpen size={16} className="text-[#0047AB]" />
                    </div>
                    <div className="text-left">
                      <div className="font-semibold text-gray-900">{mod.title}</div>
                      <div className="text-xs text-gray-400">{mod.course} - {mod.lessons.length} lessons</div>
                    </div>
                  </div>
                  {expandedModules[mod.id] ? <ChevronDown size={16} className="text-gray-400" /> : <ChevronRight size={16} className="text-gray-400" />}
                </button>
                {expandedModules[mod.id] && (
                  <div className="mt-4 pl-11 space-y-2 border-t border-gray-50 pt-4">
                    {mod.lessons.map(lesson => (
                      <div key={lesson.id} className="flex items-center gap-3 py-2 border-b border-gray-50 last:border-0">
                        <span className={`px-2 py-0.5 rounded text-xs font-medium ${
                          lesson.type === 'Video' ? 'bg-blue-50 text-blue-700' :
                          lesson.type === 'Quiz' ? 'bg-purple-50 text-purple-700' :
                          lesson.type === 'Assignment' ? 'bg-orange-50 text-orange-700' :
                          'bg-gray-50 text-gray-600'
                        }`}>{lesson.type}</span>
                        <span className="font-medium text-gray-800 text-sm flex-1">{lesson.title}</span>
                        <span className="text-xs text-gray-400">{lesson.duration}</span>
                        <button className="text-xs text-[#0047AB] hover:underline">Edit</button>
                      </div>
                    ))}
                  </div>
                )}
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* Gradebook Tab */}
      {activeTab === 'Gradebook' && (
        <div>
          <div className="flex justify-between items-center mb-4">
            <h2 className="font-semibold text-gray-900 text-lg">Gradebook - {selectedClass.code}</h2>
            <Button variant="outline" size="sm" icon={<Download size={14} />}>Export CSV</Button>
          </div>
          <Card padding="none" className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-100">
                  <th className="text-left py-3 px-4 font-medium text-gray-500">Student</th>
                  <th className="text-center py-3 px-4 font-medium text-gray-500">Assignment 1</th>
                  <th className="text-center py-3 px-4 font-medium text-gray-500">Assignment 2</th>
                  <th className="text-center py-3 px-4 font-medium text-gray-500">Midterm</th>
                  <th className="text-center py-3 px-4 font-medium text-gray-500">Final</th>
                  <th className="text-center py-3 px-4 font-medium text-gray-500">Overall %</th>
                </tr>
              </thead>
              <tbody>
                {gradebookStudents.map((s, i) => {
                  const overall = Math.round((s.a1 + s.a2 + s.midterm) / 3);
                  return (
                    <tr key={s.id} className={`border-b border-gray-50 last:border-0 ${i % 2 === 0 ? '' : 'bg-gray-50/50'}`}>
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-3">
                          <img src={`https://i.pravatar.cc/32?img=${s.avatar}`} alt={s.name} className="w-8 h-8 rounded-full object-cover" />
                          <span className="font-medium text-gray-900">{s.name}</span>
                        </div>
                      </td>
                      {['a1', 'a2', 'midterm'].map(field => (
                        <td key={field} className="py-3 px-4 text-center">
                          <input
                            type="number"
                            min={0}
                            max={100}
                            value={grades[s.id]?.[field] ?? (s as Record<string, number | null | string>)[field] ?? ''}
                            onChange={e => setGrades(prev => ({ ...prev, [s.id]: { ...prev[s.id], [field]: e.target.value } }))}
                            className="w-16 text-center border border-gray-200 rounded-lg px-2 py-1 text-sm focus:outline-none focus:border-[#0047AB]"
                          />
                        </td>
                      ))}
                      <td className="py-3 px-4 text-center text-gray-400">--</td>
                      <td className="py-3 px-4 text-center">
                        <span className={`font-bold ${overall >= 70 ? 'text-[#00A86B]' : 'text-red-500'}`}>{overall}%</span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </Card>
        </div>
      )}

      {/* At-Risk Students Tab */}
      {activeTab === 'At-Risk Students' && (
        <div>
          <div className="flex items-center gap-3 mb-6">
            <AlertTriangle size={20} className="text-red-500" />
            <h2 className="font-semibold text-gray-900 text-lg">At-Risk Students</h2>
            <Badge variant="danger" label={`${atRiskStudents.length} flagged`} />
          </div>
          <div className="grid md:grid-cols-2 gap-4">
            {atRiskStudents.map(s => (
              <Card key={s.id}>
                <div className="flex items-start gap-4">
                  <img src={`https://i.pravatar.cc/48?img=${s.avatar}`} alt={s.name} className="w-12 h-12 rounded-full object-cover flex-shrink-0" />
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-semibold text-gray-900">{s.name}</span>
                      <Badge variant="danger" label={s.reason} />
                    </div>
                    <p className="text-sm text-gray-500 mb-4">{s.detail}</p>
                    <div className="flex gap-2">
                      <Button size="sm" variant="outline">Send Message</Button>
                      <Button size="sm" variant="primary">Schedule Meeting</Button>
                    </div>
                  </div>
                </div>
              </Card>
            ))}
          </div>
          {atRiskStudents.length === 0 && (
            <div className="text-center py-12 text-gray-400">
              <AlertTriangle size={40} className="mx-auto mb-3 opacity-30" />
              <p>No at-risk students flagged at this time.</p>
            </div>
          )}
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
