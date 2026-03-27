import React, { useState } from 'react';
import { DashboardLayout } from '../../components/layout/DashboardLayout';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Heart, Camera, MessageCircle, Calendar, DollarSign, CheckCircle, Clock, Star, ChevronRight, Send } from 'lucide-react';

const child = {
  name: 'Emma Lawson',
  age: '3 years, 7 months',
  room: 'Sunshine Room',
  teacher: 'Ms. Rodriguez',
  allergies: 'Tree nuts',
  dob: '2022-08-14',
  avatar: '👧',
};

const dailyReports = [
  {
    date: '2026-03-24 (Today)',
    mood: 'Happy',
    moodEmoji: '😊',
    meals: { breakfast: 'Finished', snack: 'Half', lunch: 'Finished' },
    nap: '1h 45m',
    activities: ['Finger painting', 'Circle time song', 'Outdoor sand play'],
    note: 'Emma had a wonderful day! She made a beautiful butterfly in art. She was very chatty during circle time and made her classmates laugh.',
    photos: 3,
  },
  {
    date: '2026-03-23',
    mood: 'Content',
    moodEmoji: '🙂',
    meals: { breakfast: 'Finished', snack: 'Finished', lunch: 'Half' },
    nap: '2h',
    activities: ['Story time', 'Block building', 'Music class'],
    note: 'Emma loved the music class today. She was a bit tired in the afternoon but perked up after snack time.',
    photos: 2,
  },
  {
    date: '2026-03-22',
    mood: 'Excited',
    moodEmoji: '🤩',
    meals: { breakfast: 'Half', snack: 'Finished', lunch: 'Finished' },
    nap: '1h 30m',
    activities: ['Water play', 'Playdough', 'Garden walk'],
    note: 'Garden walk day! Emma spotted a caterpillar and was fascinated. She talked about it all afternoon.',
    photos: 5,
  },
];

const attendanceData = [
  { date: '2026-03-24', status: 'present' },
  { date: '2026-03-23', status: 'present' },
  { date: '2026-03-22', status: 'present' },
  { date: '2026-03-21', status: 'absent' },
  { date: '2026-03-20', status: 'present' },
  { date: '2026-03-17', status: 'present' },
  { date: '2026-03-16', status: 'late' },
  { date: '2026-03-15', status: 'present' },
  { date: '2026-03-14', status: 'present' },
  { date: '2026-03-13', status: 'present' },
];

const messages = [
  { id: 1, from: 'Ms. Rodriguez', content: 'Emma did a great job with her counting today! She counted all the way to 20 without any help.', time: '2:30 PM', isTeacher: true },
  { id: 2, from: 'You', content: 'That is amazing! She has been practicing at home too. Thank you for the update!', time: '3:15 PM', isTeacher: false },
  { id: 3, from: 'Ms. Rodriguez', content: 'She also showed great kindness by sharing her blocks with a new classmate. You should be proud.', time: '3:20 PM', isTeacher: true },
];

const events = [
  { title: 'Spring Art Show', date: 'April 5, 10:00 AM', desc: 'Display of childrens artwork from the semester.', rsvped: true, permissionSlip: false },
  { title: 'Mother Earth Day', date: 'April 22, 9:00 AM', desc: 'Garden planting activity. Parents welcome to join!', rsvped: false, permissionSlip: false },
  { title: 'Class Trip: Science Museum', date: 'May 2, 9:00 AM', desc: 'Educational visit to the Ontario Science Centre.', rsvped: false, permissionSlip: true },
  { title: 'Year-End Concert', date: 'June 15, 2:00 PM', desc: 'Children perform songs learned throughout the year.', rsvped: false, permissionSlip: false },
];

const galleryPhotos = [
  { emoji: '🎨', label: 'Art: My Butterfly', date: 'Mar 24' },
  { emoji: '🌱', label: 'Garden Walk', date: 'Mar 22' },
  { emoji: '🎵', label: 'Music Class', date: 'Mar 23' },
  { emoji: '🏖', label: 'Sand Play', date: 'Mar 24' },
  { emoji: '🧱', label: 'Block Towers', date: 'Mar 21' },
  { emoji: '💧', label: 'Water Play', date: 'Mar 22' },
];

const payments = [
  { desc: 'April Tuition', amount: '$1,250.00', due: '2026-04-01', status: 'pending' },
  { desc: 'March Tuition', amount: '$1,250.00', due: '2026-03-01', status: 'paid' },
  { desc: 'Science Museum Trip', amount: '$18.00', due: '2026-04-25', status: 'pending' },
  { desc: 'February Tuition', amount: '$1,250.00', due: '2026-02-01', status: 'paid' },
];

const tabs = ['Daily Report', 'Attendance', 'Messages', 'Events', 'Gallery', 'Payments'];

export default function ParentDashboard() {
  const [activeTab, setActiveTab] = useState('Daily Report');
  const [messageInput, setMessageInput] = useState('');
  const [msgs, setMsgs] = useState(messages);
  const [rsvpStates, setRsvpStates] = useState<Record<string, boolean>>(
    Object.fromEntries(events.map((e) => [e.title, e.rsvped]))
  );

  return (
    <DashboardLayout>
      {/* Hero Banner */}
      <div className="relative rounded-2xl overflow-hidden mb-8" style={{ height: 180 }}>
        <img
          src="/assets/campus-surveys.jpg"
          alt="Parent"
          className="absolute inset-0 w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-[#FFB347]/90 via-[#FF9800]/70 to-transparent" />
        <div className="relative z-10 h-full flex flex-col justify-center px-8">
          <h1 className="font-bold text-3xl text-white mb-1" style={{ fontFamily: 'Lexend, sans-serif' }}>Parent Portal</h1>
          <p className="text-orange-100 text-sm">Stay connected with Emma's school day.</p>
        </div>
      </div>

      <div className="mb-8">
        {/* Child profile header */}
        <div className="bg-gradient-to-r from-orange-50 to-yellow-50 rounded-2xl p-6 border border-orange-100 mb-6">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 bg-orange-100 rounded-2xl flex items-center justify-center text-4xl">{child.avatar}</div>
            <div>
              <h1 className="font-lexend font-bold text-2xl text-gray-900">{child.name}</h1>
              <div className="flex flex-wrap gap-3 mt-1 text-sm text-gray-500">
                <span>Age: {child.age}</span>
                <span>Room: {child.room}</span>
                <span>Teacher: {child.teacher}</span>
                {child.allergies && <span className="text-red-600 font-medium">Allergy: {child.allergies}</span>}
              </div>
            </div>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-white rounded-xl border border-black/5 shadow-sm p-5">
              <div className="text-3xl font-lexend font-extrabold text-gray-900">58</div>
              <div className="mt-1 text-sm text-gray-500">Days Attended</div>
            </div>
          <div className="bg-white rounded-xl border border-black/5 shadow-sm p-5">
              <div className="text-3xl font-lexend font-extrabold text-gray-900">4.7/5</div>
              <div className="mt-1 text-sm text-gray-500">Avg Mood Score</div>
            </div>
          <div className="bg-white rounded-xl border border-black/5 shadow-sm p-5">
              <div className="text-3xl font-lexend font-extrabold text-gray-900">47</div>
              <div className="mt-1 text-sm text-gray-500">Photos This Month</div>
            </div>
          <div className="bg-white rounded-xl border border-black/5 shadow-sm p-5">
              <div className="text-3xl font-lexend font-extrabold text-gray-900">2</div>
              <div className="mt-1 text-sm text-gray-500">Pending Payments</div>
            </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 mb-6 overflow-x-auto bg-gray-100 rounded-xl p-1">
        {tabs.map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-colors ${
              activeTab === tab ? 'bg-white text-orange-500 shadow-sm' : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* Daily Report */}
      {activeTab === 'Daily Report' && (
        <div className="space-y-4">
          {dailyReports.map((report) => (
            <Card key={report.date}>
              <div className="flex justify-between items-center mb-4">
                <h3 className="font-semibold text-gray-900">{report.date}</h3>
                <span className="text-2xl">{report.moodEmoji}</span>
              </div>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-4">
                {[
                  { label: 'Mood', value: report.mood, emoji: report.moodEmoji },
                  { label: 'Nap', value: report.nap, emoji: '😴' },
                  { label: 'Breakfast', value: report.meals.breakfast, emoji: '🥣' },
                  { label: 'Lunch', value: report.meals.lunch, emoji: '🍱' },
                ].map((item) => (
                  <div key={item.label} className="bg-orange-50 rounded-xl p-3 text-center">
                    <div className="text-xl mb-1">{item.emoji}</div>
                    <div className="text-xs text-gray-500">{item.label}</div>
                    <div className="text-sm font-semibold text-gray-800">{item.value}</div>
                  </div>
                ))}
              </div>
              <div className="mb-3">
                <div className="text-xs text-gray-400 mb-1 font-medium uppercase tracking-wider">Activities</div>
                <div className="flex flex-wrap gap-2">
                  {report.activities.map((a) => (
                    <span key={a} className="px-3 py-1 bg-blue-50 text-blue-700 text-xs rounded-full">{a}</span>
                  ))}
                </div>
              </div>
              <div className="bg-gray-50 rounded-xl p-3 text-sm text-gray-600 italic">
                "{report.note}"
                <div className="text-xs text-gray-400 mt-1">-- {child.teacher}</div>
              </div>
              {report.photos > 0 && (
                <button className="mt-3 flex items-center gap-2 text-sm text-[#0047AB] hover:underline">
                  <Camera size={14} /> View {report.photos} photos from this day <ChevronRight size={14} />
                </button>
              )}
            </Card>
          ))}
        </div>
      )}

      {/* Attendance */}
      {activeTab === 'Attendance' && (
        <div>
          <h2 className="font-semibold text-gray-900 text-lg mb-4">Attendance Calendar -- March 2026</h2>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3 mb-6">
            {[
              { label: 'Days Present', value: 8, color: '#00A86B' },
              { label: 'Days Absent', value: 1, color: '#EF4444' },
              { label: 'Late Arrivals', value: 1, color: '#F59E0B' },
            ].map((s) => (
              <div key={s.label} className="bg-white rounded-xl p-4 text-center border border-black/5 shadow-sm">
                <div className="text-2xl font-bold" style={{ color: s.color }}>{s.value}</div>
                <div className="text-sm text-gray-400">{s.label}</div>
              </div>
            ))}
          </div>
          <Card>
            <div className="space-y-2">
              {attendanceData.map((a) => (
                <div key={a.date} className="flex items-center justify-between py-2.5 border-b border-gray-50 last:border-0">
                  <div className="text-sm text-gray-700">{a.date}</div>
                  <span className={`px-3 py-0.5 rounded-full text-xs font-medium ${
                    a.status === 'present' ? 'bg-green-100 text-green-700' :
                    a.status === 'late' ? 'bg-yellow-100 text-yellow-700' :
                    'bg-red-100 text-red-700'
                  }`}>{a.status}</span>
                </div>
              ))}
            </div>
          </Card>
        </div>
      )}

      {/* Messages */}
      {activeTab === 'Messages' && (
        <div>
          <h2 className="font-semibold text-gray-900 text-lg mb-4">Messages with {child.teacher}</h2>
          <Card>
            <div className="space-y-4 mb-4 max-h-96 overflow-y-auto">
              {msgs.map((m) => (
                <div key={m.id} className={`flex ${m.isTeacher ? 'justify-start' : 'justify-end'}`}>
                  <div className={`max-w-xs lg:max-w-md px-4 py-3 rounded-2xl text-sm ${
                    m.isTeacher ? 'bg-gray-100 text-gray-800 rounded-tl-none' : 'bg-orange-400 text-white rounded-tr-none'
                  }`}>
                    {m.isTeacher && <div className="font-medium text-xs text-gray-500 mb-1">{m.from}</div>}
                    {m.content}
                    <div className={`text-xs mt-1 ${m.isTeacher ? 'text-gray-400' : 'text-orange-100'}`}>{m.time}</div>
                  </div>
                </div>
              ))}
            </div>
            <div className="flex gap-2 border-t border-gray-100 pt-4">
              <input
                value={messageInput}
                onChange={(e) => setMessageInput(e.target.value)}
                placeholder="Message Ms. Rodriguez..."
                className="flex-1 border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-orange-400"
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && messageInput.trim()) {
                    setMsgs(prev => [...prev, { id: prev.length + 1, from: 'You', content: messageInput, time: 'now', isTeacher: false }]);
                    setMessageInput('');
                  }
                }}
              />
              <button
                onClick={() => {
                  if (messageInput.trim()) {
                    setMsgs(prev => [...prev, { id: prev.length + 1, from: 'You', content: messageInput, time: 'now', isTeacher: false }]);
                    setMessageInput('');
                  }
                }}
                className="w-10 h-10 bg-orange-400 rounded-xl flex items-center justify-center text-white hover:bg-orange-500 transition-colors"
              >
                <Send size={16} />
              </button>
            </div>
          </Card>
        </div>
      )}

      {/* Events */}
      {activeTab === 'Events' && (
        <div>
          <h2 className="font-semibold text-gray-900 text-lg mb-4">Upcoming Events and Permission Slips</h2>
          <div className="space-y-4">
            {events.map((ev) => (
              <Card key={ev.title}>
                <div className="flex items-start justify-between">
                  <div>
                    <div className="font-semibold text-gray-900">{ev.title}</div>
                    <div className="flex items-center gap-1 text-sm text-gray-400 mt-1">
                      <Calendar size={14} />
                      {ev.date}
                    </div>
                    <p className="text-sm text-gray-500 mt-2">{ev.desc}</p>
                    {ev.permissionSlip && (
                      <div className="mt-3 flex items-center gap-2 text-sm text-orange-600 bg-orange-50 px-3 py-2 rounded-lg">
                        <Clock size={14} />
                        Permission slip required
                      </div>
                    )}
                  </div>
                  <div className="flex flex-col gap-2 ml-4">
                    <button
                      onClick={() => setRsvpStates(prev => ({ ...prev, [ev.title]: !prev[ev.title] }))}
                      className={`px-4 py-2 rounded-xl text-sm font-medium transition-colors ${
                        rsvpStates[ev.title]
                          ? 'bg-green-100 text-green-700'
                          : 'bg-[#0047AB] text-white hover:bg-[#003d99]'
                      }`}
                    >
                      {rsvpStates[ev.title] ? 'RSVP\'d' : 'RSVP'}
                    </button>
                    {ev.permissionSlip && (
                      <button className="px-4 py-2 rounded-xl text-sm font-medium bg-orange-100 text-orange-700 hover:bg-orange-200 transition-colors">
                        Sign Slip
                      </button>
                    )}
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* Gallery */}
      {activeTab === 'Gallery' && (
        <div>
          <h2 className="font-semibold text-gray-900 text-lg mb-4">Photo Gallery -- March 2026</h2>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {galleryPhotos.map((photo, i) => (
              <div key={i} className="bg-white rounded-2xl border border-black/5 overflow-hidden shadow-sm hover:shadow-md transition-shadow cursor-pointer">
                <div className="h-32 flex items-center justify-center text-6xl" style={{
                  background: ['#DBEAFE', '#DCFCE7', '#FEF3C7', '#FCE7F3', '#EDE9FE', '#FEE2E2'][i % 6]
                }}>
                  {photo.emoji}
                </div>
                <div className="p-3">
                  <div className="text-sm font-medium text-gray-800">{photo.label}</div>
                  <div className="text-xs text-gray-400">{photo.date}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Payments */}
      {activeTab === 'Payments' && (
        <div>
          <h2 className="font-semibold text-gray-900 text-lg mb-4">Payments and Invoices</h2>
          <div className="space-y-3">
            {payments.map((p) => (
              <div key={p.desc} className="bg-white rounded-xl p-4 border border-black/5 shadow-sm flex items-center justify-between">
                <div>
                  <div className="font-medium text-gray-900">{p.desc}</div>
                  <div className="text-sm text-gray-400">Due: {p.due}</div>
                </div>
                <div className="flex items-center gap-4">
                  <div className="font-bold text-gray-900">{p.amount}</div>
                  {p.status === 'paid' ? (
                    <span className="px-3 py-1 bg-green-100 text-green-700 text-sm rounded-full font-medium">Paid</span>
                  ) : (
                    <button className="px-4 py-1.5 bg-[#0047AB] text-white text-sm rounded-xl font-medium hover:bg-[#003d99] transition-colors">
                      Pay Now
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </DashboardLayout>
  );
}
