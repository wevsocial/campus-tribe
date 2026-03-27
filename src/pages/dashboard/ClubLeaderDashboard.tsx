import React, { useState } from 'react';
import { DashboardLayout } from '../../components/layout/DashboardLayout';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { MOCK_CLUBS, MOCK_CLUB_POSTS, MOCK_ELECTIONS } from '../../lib/mockData';
import clsx from 'clsx';

const club = MOCK_CLUBS[0]; // Photography Society

const tabs = ['Overview', 'Members', 'Feed', 'Events', 'Venues', 'Budget', 'Elections'];

const members = [
  { name: 'Alex Kim', role: 'Member', joined: 'Sep 2024', status: 'active' },
  { name: 'Jordan Lee', role: 'Member', joined: 'Sep 2024', status: 'active' },
  { name: 'Maya Patel', role: 'Officer', joined: 'Jan 2024', status: 'active' },
  { name: 'Chris Wang', role: 'Member', joined: 'Oct 2024', status: 'inactive' },
  { name: 'Fatima Nour', role: 'Member', joined: 'Nov 2024', status: 'active' },
];

const transactions = [
  { desc: 'Photography equipment rental', amount: -320, date: 'Mar 10', category: 'Equipment' },
  { desc: 'Annual Club Allocation', amount: 1500, date: 'Jan 15', category: 'Grant' },
  { desc: 'Exhibition printing costs', amount: -240, date: 'Mar 18', category: 'Event' },
  { desc: 'Workshop registration fees', amount: 180, date: 'Feb 20', category: 'Revenue' },
  { desc: 'Venue booking fee', amount: -75, date: 'Mar 22', category: 'Venue' },
];

const ClubLeaderDashboard: React.FC = () => {
  const [activeTab, setActiveTab] = useState('Overview');
  const [isEditing, setIsEditing] = useState(false);

  const balance = transactions.reduce((acc, t) => acc + t.amount, 0);
  const totalBudget = 1500;
  const spent = totalBudget - balance;

  return (
    <DashboardLayout>
      {/* Club header */}
      <div className="flex items-start justify-between mb-8">
        <div className="flex items-center gap-5">
          <div className="w-20 h-20 rounded-2xl shadow-float" style={{ background: club.coverGradient }} />
          <div>
            <h1 className="font-lexend font-900 text-2xl text-on-surface">{club.name}</h1>
            <p className="text-on-surface-variant text-sm mt-0.5">{club.memberCount} members · {club.category}</p>
            <div className="flex gap-2 mt-2">
              {club.tags.map((tag: string) => (
                <Badge key={tag} label={tag} variant="neutral" size="sm" />
              ))}
            </div>
          </div>
        </div>
        <Button variant="outline" size="sm" onClick={() => setIsEditing(!isEditing)}>
          {isEditing ? 'Save' : 'Edit Club'}
        </Button>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 mb-8 bg-surface-low p-1 rounded-xl w-fit">
        {tabs.map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={clsx(
              'px-4 py-2 rounded-xl text-sm font-jakarta font-700 transition-all',
              activeTab === tab ? 'bg-surface-lowest text-primary shadow-float' : 'text-on-surface-variant hover:text-on-surface'
            )}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* Overview */}
      {activeTab === 'Overview' && (
        <div className="grid lg:grid-cols-3 gap-6">
          <Card>
            <p className="text-3xl font-lexend font-900 text-primary">{club.memberCount}</p>
            <p className="text-sm font-jakarta text-on-surface-variant mt-1">Total Members</p>
            <p className="text-xs text-tertiary mt-2">↑ 8% this month</p>
          </Card>
          <Card>
            <p className="text-3xl font-lexend font-900 text-secondary">9</p>
            <p className="text-sm font-jakarta text-on-surface-variant mt-1">Events Hosted</p>
            <p className="text-xs text-tertiary mt-2">↑ 2 this semester</p>
          </Card>
          <Card>
            <p className="text-3xl font-lexend font-900 text-tertiary">${balance}</p>
            <p className="text-sm font-jakarta text-on-surface-variant mt-1">Budget Remaining</p>
            <p className="text-xs text-on-surface-variant mt-2">of $1,500 total</p>
          </Card>
          <div className="lg:col-span-3">
            <Card>
              <h3 className="font-lexend font-800 text-base text-on-surface mb-3">About</h3>
              <p className="text-sm text-on-surface-variant leading-relaxed">{club.description}</p>
            </Card>
          </div>
        </div>
      )}

      {/* Members */}
      {activeTab === 'Members' && (
        <Card padding="none" className="overflow-hidden">
          <div className="px-5 py-4 border-b border-outline-variant/30 flex items-center justify-between">
            <h3 className="font-lexend font-800 text-base text-on-surface">Members ({members.length})</h3>
            <Button size="sm" variant="primary">Invite Member</Button>
          </div>
          <table className="w-full">
            <thead>
              <tr className="bg-surface-low border-b border-outline-variant/30">
                <th className="text-left py-3 px-5 text-xs font-jakarta font-700 text-on-surface-variant">Name</th>
                <th className="text-left py-3 px-5 text-xs font-jakarta font-700 text-on-surface-variant">Role</th>
                <th className="text-left py-3 px-5 text-xs font-jakarta font-700 text-on-surface-variant">Joined</th>
                <th className="text-left py-3 px-5 text-xs font-jakarta font-700 text-on-surface-variant">Status</th>
              </tr>
            </thead>
            <tbody>
              {members.map((m, i) => (
                <tr key={i} className={i % 2 === 0 ? '' : 'bg-surface/50'}>
                  <td className="py-3 px-5 text-sm font-jakarta text-on-surface">{m.name}</td>
                  <td className="py-3 px-5 text-sm text-on-surface-variant">{m.role}</td>
                  <td className="py-3 px-5 text-sm text-on-surface-variant">{m.joined}</td>
                  <td className="py-3 px-5">
                    <Badge label={m.status} variant={m.status === 'active' ? 'tertiary' : 'neutral'} size="sm" />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </Card>
      )}

      {/* Events */}
      {activeTab === 'Events' && (
        <div>
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-lexend font-800 text-lg text-on-surface">Club Events</h3>
            <Button size="sm" variant="primary">+ Create Event</Button>
          </div>
          <div className="grid md:grid-cols-2 gap-4">
            {[
              { title: 'Photography Exhibition: Urban Lens', date: 'Apr 5, 2026', venue: 'Hart House Great Hall', status: 'upcoming', rsvp: 187 },
              { title: 'Monthly Workshop: Studio Lighting', date: 'Mar 28, 2026', venue: 'Bahen Centre 201', status: 'upcoming', rsvp: 34 },
              { title: 'Field Trip: Distillery District', date: 'Mar 14, 2026', venue: 'Off-campus', status: 'past', rsvp: 28 },
            ].map((event, i) => (
              <Card key={i}>
                <div className="flex items-start justify-between">
                  <div>
                    <h4 className="font-jakarta font-700 text-on-surface mb-1">{event.title}</h4>
                    <p className="text-xs text-on-surface-variant">{event.date} · {event.venue}</p>
                    <p className="text-xs text-on-surface-variant mt-1">{event.rsvp} RSVPs</p>
                  </div>
                  <Badge label={event.status} variant={event.status === 'upcoming' ? 'primary' : 'neutral'} size="sm" />
                </div>
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* Venues */}
      {activeTab === 'Venues' && (
        <div>
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-lexend font-800 text-lg text-on-surface">Venue Bookings</h3>
            <Button size="sm" variant="primary">+ Book Venue</Button>
          </div>
          <div className="grid md:grid-cols-2 gap-4">
            {[
              { venue: 'Hart House Great Hall', date: 'Apr 5, 2026', time: '2pm–8pm', status: 'approved' },
              { venue: 'Bahen Centre 201', date: 'Mar 28, 2026', time: '10am–12pm', status: 'approved' },
              { venue: 'Robarts Study Room 4B', date: 'Apr 10, 2026', time: '3pm–6pm', status: 'pending' },
            ].map((b, i) => (
              <Card key={i}>
                <div className="flex items-start justify-between">
                  <div>
                    <h4 className="font-jakarta font-700 text-on-surface mb-1">{b.venue}</h4>
                    <p className="text-xs text-on-surface-variant">{b.date} · {b.time}</p>
                  </div>
                  <Badge label={b.status} variant={b.status === 'approved' ? 'tertiary' : 'warning'} size="sm" />
                </div>
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* Budget */}
      {activeTab === 'Budget' && (
        <div className="space-y-6">
          {/* Progress */}
          <Card>
            <h3 className="font-lexend font-800 text-base text-on-surface mb-4">Budget Overview</h3>
            <div className="flex items-end justify-between mb-2">
              <span className="text-sm text-on-surface-variant">Spent: <strong>${spent}</strong></span>
              <span className="text-sm text-on-surface-variant">Total: <strong>${totalBudget}</strong></span>
            </div>
            <div className="h-3 bg-surface-high rounded-full overflow-hidden">
              <div
                className="h-full bg-primary rounded-full transition-all"
                style={{ width: `${(spent / totalBudget) * 100}%` }}
              />
            </div>
            <p className="text-xs text-on-surface-variant mt-2">${balance} remaining · {((balance / totalBudget) * 100).toFixed(0)}% of budget left</p>
          </Card>

          {/* Transactions */}
          <Card padding="none" className="overflow-hidden">
            <div className="px-5 py-4 border-b border-outline-variant/30">
              <h3 className="font-lexend font-800 text-base text-on-surface">Transactions</h3>
            </div>
            <table className="w-full">
              <thead>
                <tr className="bg-surface-low border-b border-outline-variant/30">
                  <th className="text-left py-3 px-5 text-xs font-jakarta font-700 text-on-surface-variant">Description</th>
                  <th className="text-left py-3 px-5 text-xs font-jakarta font-700 text-on-surface-variant">Category</th>
                  <th className="text-left py-3 px-5 text-xs font-jakarta font-700 text-on-surface-variant">Date</th>
                  <th className="text-right py-3 px-5 text-xs font-jakarta font-700 text-on-surface-variant">Amount</th>
                </tr>
              </thead>
              <tbody>
                {transactions.map((t, i) => (
                  <tr key={i} className={i % 2 === 0 ? '' : 'bg-surface/50'}>
                    <td className="py-3 px-5 text-sm text-on-surface">{t.desc}</td>
                    <td className="py-3 px-5 text-sm text-on-surface-variant">{t.category}</td>
                    <td className="py-3 px-5 text-sm text-on-surface-variant">{t.date}</td>
                    <td className={`py-3 px-5 text-sm text-right font-jakarta font-700 ${t.amount > 0 ? 'text-tertiary' : 'text-secondary'}`}>
                      {t.amount > 0 ? '+' : ''}${Math.abs(t.amount)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </Card>

          {/* Request form */}
          <Card>
            <h3 className="font-lexend font-800 text-base text-on-surface mb-4">Request Budget</h3>
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-jakarta font-700 text-on-surface mb-1 block">Purpose</label>
                <input className="w-full border border-outline-variant rounded-xl px-4 py-2.5 text-sm text-on-surface focus:outline-none focus:ring-2 focus:ring-primary/30" placeholder="Equipment purchase" />
              </div>
              <div>
                <label className="text-sm font-jakarta font-700 text-on-surface mb-1 block">Amount ($)</label>
                <input type="number" className="w-full border border-outline-variant rounded-xl px-4 py-2.5 text-sm text-on-surface focus:outline-none focus:ring-2 focus:ring-primary/30" placeholder="500" />
              </div>
            </div>
            <Button variant="primary" size="md" className="mt-4">Submit Request</Button>
          </Card>
        </div>
      )}

      {/* Club Feed Tab */}
      {activeTab === 'Feed' && (
        <div className="space-y-4">
          {/* Compose */}
          <div className="bg-white rounded-2xl p-5" style={{ boxShadow: '0 4px 20px rgba(0,0,0,0.06)' }}>
            <h3 className="font-bold text-gray-800 mb-3" style={{ fontFamily: 'Lexend, sans-serif' }}>Post to Club Feed</h3>
            <textarea rows={3} placeholder="Share an update, event, or achievement…" className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-blue-200 mb-3" />
            <div className="flex gap-2 flex-wrap">
              {['📝 Update', '📅 Event', '🏆 Achievement'].map(t => (
                <button key={t} className="text-xs font-bold px-4 py-2 rounded-full bg-[#0047AB]/10 text-[#0047AB] hover:bg-[#0047AB] hover:text-white transition-all">{t}</button>
              ))}
              <button className="ml-auto bg-[#0047AB] text-white text-xs font-bold px-5 py-2 rounded-full hover:bg-blue-800 transition-all">Post</button>
            </div>
          </div>
          {/* Posts */}
          {(MOCK_CLUB_POSTS as any[]).map((post: any) => (
            <div key={post.id} className="bg-white rounded-2xl p-5" style={{ boxShadow: '0 4px 20px rgba(0,0,0,0.06)' }}>
              <div className="flex items-start gap-3 mb-3">
                <div className="w-9 h-9 rounded-xl bg-[#0047AB]/10 flex items-center justify-center text-[#0047AB] font-black text-sm flex-shrink-0">{post.author[0]}</div>
                <div>
                  <div className="flex items-center gap-2"><span className="font-bold text-gray-800 text-sm">{post.author}</span><span className="text-xs text-gray-400">{post.time}</span></div>
                  <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${post.type === 'achievement' ? 'bg-yellow-100 text-yellow-700' : post.type === 'event' ? 'bg-blue-100 text-[#0047AB]' : 'bg-gray-100 text-gray-600'}`}>{post.type}</span>
                </div>
              </div>
              <p className="text-sm text-gray-700 leading-relaxed mb-3">{post.content}</p>
              <span className="text-xs text-gray-400 hover:text-[#FF7F50] cursor-pointer transition-colors">❤️ {post.likes}</span>
            </div>
          ))}
        </div>
      )}

      {/* Elections Tab */}
      {activeTab === 'Elections' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold text-gray-800" style={{ fontFamily: 'Lexend, sans-serif' }}>Club Elections</h2>
            <button className="bg-[#0047AB] text-white px-4 py-2 rounded-xl text-sm font-bold hover:bg-blue-800 transition-all">🗳️ New Election</button>
          </div>
          {(MOCK_ELECTIONS as any[]).map((el: any) => (
            <div key={el.id} className="bg-white rounded-2xl p-5" style={{ boxShadow: '0 4px 20px rgba(0,0,0,0.06)' }}>
              <div className="flex items-center justify-between mb-4">
                <div>
                  <div className="font-bold text-gray-800" style={{ fontFamily: 'Lexend, sans-serif' }}>{el.title}</div>
                  <div className="text-sm text-gray-500">{el.clubName} · Closes {el.endsAt}</div>
                </div>
                <span className={`text-xs font-bold px-3 py-1 rounded-full ${el.status === 'open' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'}`}>{el.status}</span>
              </div>
              <div className="space-y-3">
                {el.candidates.map((c: any, i: number) => {
                  const total = el.candidates.reduce((a: number, b: any) => a + b.votes, 0);
                  const pct = total > 0 ? Math.round((c.votes / total) * 100) : 0;
                  return (
                    <div key={i}>
                      <div className="flex justify-between text-sm font-semibold mb-1"><span className="text-gray-700">{c.name}</span><span className="text-gray-500">{c.votes} ({pct}%)</span></div>
                      <div className="w-full bg-gray-100 rounded-full h-2"><div className="bg-[#0047AB] h-2 rounded-full" style={{ width: `${pct}%` }} /></div>
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      )}

    </DashboardLayout>
  );
};

export default ClubLeaderDashboard;
