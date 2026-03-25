import React, { useState } from 'react';
import { DashboardLayout } from '../../components/layout/DashboardLayout';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { Modal } from '../../components/ui/Modal';
import { PieChart, Pie, Cell, Legend, Tooltip, ResponsiveContainer } from 'recharts';
import { motion } from 'framer-motion';
import { CheckCircle, XCircle, Plus, Send } from 'lucide-react';

const venues = [
  { id: 1, name: 'Lecture Hall A', capacity: 200, nextAvailable: 'Today 6 PM', status: 'available' },
  { id: 2, name: 'Sports Field B', capacity: 500, nextAvailable: 'Tomorrow 9 AM', status: 'booked' },
  { id: 3, name: 'Cafeteria Main', capacity: 300, nextAvailable: 'Today 4 PM', status: 'available' },
  { id: 4, name: 'Auditorium', capacity: 800, nextAvailable: 'Mar 28 noon', status: 'available' },
  { id: 5, name: 'Meeting Room 3', capacity: 20, nextAvailable: 'Now', status: 'available' },
];

const kanbanEvents: Record<string, { id: number; title: string; date: string; attendees: number; budget: number }[]> = {
  Planning: [
    { id: 1, title: 'Spring Social Mixer', date: 'Apr 10', attendees: 120, budget: 800 },
    { id: 2, title: 'Charity Bake Sale', date: 'Apr 15', attendees: 60, budget: 200 },
  ],
  Approved: [
    { id: 3, title: 'Photography Showcase', date: 'Apr 5', attendees: 180, budget: 1200 },
  ],
  Live: [
    { id: 4, title: 'Coding Challenge Night', date: 'Mar 24', attendees: 45, budget: 500 },
  ],
  Completed: [
    { id: 5, title: 'Debate Finals Watch Party', date: 'Mar 20', attendees: 90, budget: 300 },
    { id: 6, title: 'Club Fair 2026', date: 'Mar 10', attendees: 400, budget: 2000 },
  ],
};

const managedClubs = [
  { id: 1, name: 'Photography Society', members: 142, events: 3, budget: 4800, spent: 3100, emoji: '📷' },
  { id: 2, name: 'Coding Collective', members: 156, events: 2, budget: 5500, spent: 2800, emoji: '💻' },
  { id: 3, name: 'Film Society', members: 89, events: 1, budget: 2000, spent: 900, emoji: '🎬' },
];

const budgetData = [
  { name: 'Photography Society', allocated: 4800, spent: 3100, color: '#0047AB' },
  { name: 'Coding Collective', allocated: 5500, spent: 2800, color: '#FF7F50' },
  { name: 'Film Society', allocated: 2000, spent: 900, color: '#00A86B' },
];

const applications = [
  { id: 1, name: 'James Okafor', club: 'Photography Society', program: 'Fine Arts', date: '2026-03-22', avatar: 11 },
  { id: 2, name: 'Lily Chen', club: 'Coding Collective', program: 'Computer Science', date: '2026-03-23', avatar: 12 },
  { id: 3, name: 'Sam Rivera', club: 'Film Society', program: 'Media Studies', date: '2026-03-21', avatar: 13 },
  { id: 4, name: 'Amara Diop', club: 'Photography Society', program: 'Visual Arts', date: '2026-03-24', avatar: 14 },
];

const tabs = ['Venue Booking', 'Event Planning', 'Club Management', 'Budget Tracker', 'Announcements', 'Applications'];

const KANBAN_COLS = ['Planning', 'Approved', 'Live', 'Completed'];
const COL_COLORS: Record<string, string> = {
  Planning: '#6B7280',
  Approved: '#0047AB',
  Live: '#00A86B',
  Completed: '#78909C',
};

export default function StudentRepDashboard() {
  const [activeTab, setActiveTab] = useState('Venue Booking');
  const [bookingModal, setBookingModal] = useState(false);
  const [selectedVenue, setSelectedVenue] = useState<typeof venues[0] | null>(null);
  const [announcement, setAnnouncement] = useState('');
  const [appStatuses, setAppStatuses] = useState<Record<number, string>>({});
  const [clubPosts, setClubPosts] = useState<Record<number, string>>({});

  const pieData = budgetData.flatMap(b => [
    { name: `${b.name} (Spent)`, value: b.spent, color: b.color },
    { name: `${b.name} (Remaining)`, value: b.allocated - b.spent, color: b.color + '55' },
  ]);

  return (
    <DashboardLayout>
      {/* Hero Banner */}
      <div className="relative rounded-2xl overflow-hidden mb-8" style={{ height: 200 }}>
        <img
          src="https://images.unsplash.com/photo-1529156069898-49953e39b3ac?w=800&q=80&auto=format"
          alt="Campus"
          className="absolute inset-0 w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-[#001a4d]/90 via-[#0047AB]/70 to-transparent" />
        <div className="relative z-10 h-full flex flex-col justify-center px-8">
          <h1 className="font-bold text-3xl text-white mb-1" style={{ fontFamily: 'Lexend, sans-serif' }}>Student Rep Dashboard</h1>
          <p className="text-blue-200 text-sm">Managing clubs, events, and student voice</p>
          <div className="flex gap-3 mt-4">
            {[
              { label: '3 Clubs Managed', icon: '🏛' },
              { label: '4 Events Active', icon: '📅' },
              { label: '$12,300 Budget', icon: '💰' },
            ].map(s => (
              <div key={s.label} className="flex items-center gap-1.5 bg-white/20 backdrop-blur-sm px-3 py-1.5 rounded-full text-white text-xs font-semibold">
                <span>{s.icon}</span><span>{s.label}</span>
              </div>
            ))}
          </div>
        </div>
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

      {/* Venue Booking */}
      {activeTab === 'Venue Booking' && (
        <Card padding="none" className="overflow-hidden">
          <div className="px-5 py-4 border-b border-outline-variant/30">
            <h2 className="font-lexend font-800 text-lg text-on-surface">Campus Venues</h2>
          </div>
          <table className="w-full">
            <thead>
              <tr className="bg-surface-low border-b border-outline-variant/30">
                {['Venue', 'Capacity', 'Next Available', 'Status', 'Action'].map(h => (
                  <th key={h} className="text-left py-3 px-5 text-xs font-jakarta font-700 text-on-surface-variant">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {venues.map((v, i) => (
                <motion.tr
                  key={v.id}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.05 }}
                  className={i % 2 === 0 ? '' : 'bg-surface/50'}
                >
                  <td className="py-3 px-5 text-sm font-jakarta font-700 text-on-surface">{v.name}</td>
                  <td className="py-3 px-5 text-sm text-on-surface-variant">{v.capacity}</td>
                  <td className="py-3 px-5 text-sm text-on-surface-variant">{v.nextAvailable}</td>
                  <td className="py-3 px-5">
                    <Badge
                      label={v.status === 'available' ? 'Available' : 'Booked'}
                      variant={v.status === 'available' ? 'tertiary' : 'neutral'}
                    />
                  </td>
                  <td className="py-3 px-5">
                    <Button
                      size="sm"
                      variant={v.status === 'available' ? 'primary' : 'outline'}
                      onClick={() => { setSelectedVenue(v); setBookingModal(true); }}
                      disabled={v.status === 'booked'}
                    >
                      Book
                    </Button>
                  </td>
                </motion.tr>
              ))}
            </tbody>
          </table>
        </Card>
      )}

      {/* Event Planning Kanban */}
      {activeTab === 'Event Planning' && (
        <div>
          <div className="flex justify-between items-center mb-4">
            <h2 className="font-lexend font-800 text-lg text-on-surface">Event Planning Board</h2>
            <Button size="sm" variant="primary" icon={<Plus size={14} />}>New Event</Button>
          </div>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {KANBAN_COLS.map(col => (
              <div key={col}>
                <div className="flex items-center gap-2 mb-3">
                  <div className="w-2 h-2 rounded-full" style={{ backgroundColor: COL_COLORS[col] }} />
                  <span className="text-sm font-jakarta font-700 text-on-surface">{col}</span>
                  <span className="ml-auto text-xs bg-surface-low px-1.5 py-0.5 rounded-full text-on-surface-variant">{kanbanEvents[col].length}</span>
                </div>
                <div className="space-y-3">
                  {kanbanEvents[col].map(ev => (
                    <motion.div
                      key={ev.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="bg-white rounded-xl border border-outline-variant/30 shadow-sm p-4"
                    >
                      <p className="font-jakarta font-700 text-sm text-on-surface mb-2">{ev.title}</p>
                      <p className="text-xs text-on-surface-variant mb-2">{ev.date}</p>
                      <div className="flex justify-between text-xs text-on-surface-variant">
                        <span>👥 {ev.attendees}</span>
                        <span>💰 ${ev.budget}</span>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Club Management */}
      {activeTab === 'Club Management' && (
        <div className="grid md:grid-cols-3 gap-6">
          {managedClubs.map(club => (
            <Card key={club.id}>
              <div className="text-4xl mb-3">{club.emoji}</div>
              <h3 className="font-lexend font-800 text-base text-on-surface mb-1">{club.name}</h3>
              <div className="flex gap-4 text-sm text-on-surface-variant mb-3">
                <span>👥 {club.members} members</span>
                <span>📅 {club.events} events</span>
              </div>
              <div className="mb-3">
                <div className="flex justify-between text-xs text-on-surface-variant mb-1">
                  <span>Budget used</span>
                  <span>${club.spent.toLocaleString()} / ${club.budget.toLocaleString()}</span>
                </div>
                <div className="h-1.5 bg-gray-100 rounded-full">
                  <div
                    className="h-1.5 bg-[#0047AB] rounded-full"
                    style={{ width: `${(club.spent / club.budget) * 100}%` }}
                  />
                </div>
              </div>
              <textarea
                className="w-full border border-outline-variant rounded-xl px-3 py-2 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-primary/30 mb-2"
                rows={2}
                placeholder="Quick post to members..."
                value={clubPosts[club.id] || ''}
                onChange={e => setClubPosts(prev => ({ ...prev, [club.id]: e.target.value }))}
              />
              <Button size="sm" variant="primary" className="w-full" icon={<Send size={14} />}>
                Post
              </Button>
            </Card>
          ))}
        </div>
      )}

      {/* Budget Tracker */}
      {activeTab === 'Budget Tracker' && (
        <div className="grid lg:grid-cols-2 gap-6">
          <Card>
            <h3 className="font-lexend font-800 text-base text-on-surface mb-4">Budget Allocation vs Spent</h3>
            <ResponsiveContainer width="100%" height={280}>
              <PieChart>
                <Pie
                  data={pieData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={100}
                  dataKey="value"
                  nameKey="name"
                >
                  {pieData.map((entry, i) => (
                    <Cell key={i} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip formatter={(val: any) => `$${val.toLocaleString()}`} />
                <Legend iconSize={8} wrapperStyle={{ fontSize: '11px' }} />
              </PieChart>
            </ResponsiveContainer>
          </Card>
          <Card>
            <h3 className="font-lexend font-800 text-base text-on-surface mb-4">Club Breakdown</h3>
            <div className="space-y-5">
              {budgetData.map(b => (
                <div key={b.name}>
                  <div className="flex justify-between text-sm mb-1">
                    <span className="font-jakarta font-700 text-on-surface">{b.name}</span>
                    <span className="text-on-surface-variant">${b.spent.toLocaleString()} / ${b.allocated.toLocaleString()}</span>
                  </div>
                  <div className="h-2 bg-gray-100 rounded-full">
                    <div
                      className="h-2 rounded-full transition-all"
                      style={{ width: `${(b.spent / b.allocated) * 100}%`, backgroundColor: b.color }}
                    />
                  </div>
                  <div className="text-xs text-on-surface-variant mt-1">{Math.round((b.spent / b.allocated) * 100)}% used - ${(b.allocated - b.spent).toLocaleString()} remaining</div>
                </div>
              ))}
            </div>
          </Card>
        </div>
      )}

      {/* Announcements */}
      {activeTab === 'Announcements' && (
        <div className="space-y-6">
          <Card>
            <h3 className="font-lexend font-800 text-base text-on-surface mb-4">Draft Announcement</h3>
            <div className="space-y-4">
              <div>
                <label className="text-sm font-jakarta font-700 text-on-surface block mb-1">Target Club</label>
                <select className="w-full border border-outline-variant rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30">
                  <option>All Managed Clubs</option>
                  {managedClubs.map(c => <option key={c.id}>{c.name}</option>)}
                </select>
              </div>
              <div>
                <label className="text-sm font-jakarta font-700 text-on-surface block mb-1">Message</label>
                <textarea
                  className="w-full border border-outline-variant rounded-xl px-4 py-3 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-primary/30"
                  rows={5}
                  placeholder="Write your announcement here..."
                  value={announcement}
                  onChange={e => setAnnouncement(e.target.value)}
                />
              </div>
              <Button variant="primary" icon={<Send size={14} />}>Post Announcement</Button>
            </div>
          </Card>
          <Card>
            <h3 className="font-lexend font-800 text-base text-on-surface mb-4">Recent Announcements</h3>
            <div className="space-y-4">
              {[
                { club: 'Photography Society', text: 'Reminder: Exhibition setup starts Friday at 2 PM. Volunteers please arrive early.', time: '2 days ago' },
                { club: 'Coding Collective', text: 'Hackathon registration closes April 1. 12 spots left!', time: '4 days ago' },
              ].map((a, i) => (
                <div key={i} className="border-b border-outline-variant/30 pb-4 last:border-0 last:pb-0">
                  <div className="flex justify-between mb-1">
                    <Badge label={a.club} variant="primary" />
                    <span className="text-xs text-on-surface-variant">{a.time}</span>
                  </div>
                  <p className="text-sm text-on-surface mt-2">{a.text}</p>
                </div>
              ))}
            </div>
          </Card>
        </div>
      )}

      {/* Applications */}
      {activeTab === 'Applications' && (
        <Card padding="none" className="overflow-hidden">
          <div className="px-5 py-4 border-b border-outline-variant/30">
            <h2 className="font-lexend font-800 text-lg text-on-surface">Club Applications</h2>
          </div>
          <table className="w-full">
            <thead>
              <tr className="bg-surface-low border-b border-outline-variant/30">
                {['Student', 'Club', 'Program', 'Date', 'Actions'].map(h => (
                  <th key={h} className="text-left py-3 px-5 text-xs font-jakarta font-700 text-on-surface-variant">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {applications.map((app, i) => (
                <tr key={app.id} className={i % 2 === 0 ? '' : 'bg-surface/50'}>
                  <td className="py-3 px-5">
                    <div className="flex items-center gap-3">
                      <img src={`https://i.pravatar.cc/36?img=${app.avatar}`} alt={app.name} className="w-9 h-9 rounded-full object-cover" />
                      <span className="text-sm font-jakarta font-700 text-on-surface">{app.name}</span>
                    </div>
                  </td>
                  <td className="py-3 px-5 text-sm text-on-surface-variant">{app.club}</td>
                  <td className="py-3 px-5 text-sm text-on-surface-variant">{app.program}</td>
                  <td className="py-3 px-5 text-sm text-on-surface-variant">{app.date}</td>
                  <td className="py-3 px-5">
                    {appStatuses[app.id] ? (
                      <Badge label={appStatuses[app.id]} variant={appStatuses[app.id] === 'Approved' ? 'tertiary' : 'danger'} />
                    ) : (
                      <div className="flex gap-2">
                        <button
                          onClick={() => setAppStatuses(prev => ({ ...prev, [app.id]: 'Approved' }))}
                          className="flex items-center gap-1 px-3 py-1 bg-green-50 text-green-700 rounded-lg text-xs font-medium hover:bg-green-100 transition-colors"
                        >
                          <CheckCircle size={12} /> Approve
                        </button>
                        <button
                          onClick={() => setAppStatuses(prev => ({ ...prev, [app.id]: 'Rejected' }))}
                          className="flex items-center gap-1 px-3 py-1 bg-red-50 text-red-600 rounded-lg text-xs font-medium hover:bg-red-100 transition-colors"
                        >
                          <XCircle size={12} /> Reject
                        </button>
                      </div>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </Card>
      )}

      {/* Booking Modal */}
      <Modal isOpen={bookingModal} onClose={() => setBookingModal(false)} title={`Book ${selectedVenue?.name}`} size="sm">
        <div className="space-y-4">
          <div>
            <label className="text-sm font-jakarta font-700 text-on-surface block mb-1">Date</label>
            <input type="date" className="w-full border border-outline-variant rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30" />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-sm font-jakarta font-700 text-on-surface block mb-1">Start Time</label>
              <input type="time" className="w-full border border-outline-variant rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30" />
            </div>
            <div>
              <label className="text-sm font-jakarta font-700 text-on-surface block mb-1">End Time</label>
              <input type="time" className="w-full border border-outline-variant rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30" />
            </div>
          </div>
          <div>
            <label className="text-sm font-jakarta font-700 text-on-surface block mb-1">Purpose</label>
            <textarea className="w-full border border-outline-variant rounded-xl px-4 py-2.5 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-primary/30" rows={3} placeholder="Describe the event purpose..." />
          </div>
          <div className="flex gap-3">
            <Button variant="outline" className="flex-1" onClick={() => setBookingModal(false)}>Cancel</Button>
            <Button variant="primary" className="flex-1" onClick={() => setBookingModal(false)}>Submit Booking</Button>
          </div>
        </div>
      </Modal>
    </DashboardLayout>
  );
}
