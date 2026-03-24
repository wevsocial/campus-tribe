import React, { useState } from 'react';
import { DashboardLayout } from '../../components/layout/DashboardLayout';
import { StatCard } from '../../components/ui/StatCard';
import { Card } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import { MOCK_ANALYTICS, MOCK_CLUBS } from '../../lib/mockData';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, Legend
} from 'recharts';
import { AlertTriangle } from 'lucide-react';

const AdminDashboard: React.FC = () => {
  const [activeSection] = useState('overview');
  const data = MOCK_ANALYTICS;

  return (
    <DashboardLayout>
      <div className="mb-8">
        <h1 className="font-lexend font-900 text-3xl text-on-surface">Admin Overview</h1>
        <p className="text-on-surface-variant mt-1">University of Toronto · Spring 2026</p>
      </div>

      {/* Alert */}
      <div className="flex items-center gap-3 bg-red-50 border border-red-200 rounded-xl px-5 py-4 mb-8">
        <AlertTriangle size={20} className="text-red-500 flex-shrink-0" />
        <div>
          <p className="text-sm font-jakarta font-700 text-red-700">47 students show disengagement signs</p>
          <p className="text-xs text-red-500 mt-0.5">Based on activity patterns over the last 30 days. Review recommended.</p>
        </div>
        <button className="ml-auto text-xs font-jakarta font-700 text-red-600 border border-red-300 px-3 py-1.5 rounded-lg hover:bg-red-100 transition-colors">
          Review
        </button>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <StatCard value={data.activeStudents.toLocaleString()} label="Active Students" icon="people" color="primary" trend={8} />
        <StatCard value={data.totalClubs} label="Active Clubs" icon="groups" color="tertiary" trend={12} />
        <StatCard value={data.totalEvents} label="Events This Month" icon="calendar_month" color="secondary" trend={5} />
        <StatCard value={data.atRiskStudents} label="At-Risk Students" icon="warning" color="danger" />
      </div>

      {/* Charts row */}
      <div className="grid lg:grid-cols-3 gap-6 mb-8">
        {/* Bar Chart */}
        <div className="lg:col-span-2">
          <Card>
            <h2 className="font-lexend font-800 text-lg text-on-surface mb-6">Weekly Engagement Trend</h2>
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={data.weeklyTrend}>
                <CartesianGrid strokeDasharray="3 3" stroke="#BFC3D4" />
                <XAxis dataKey="week" tick={{ fontSize: 11, fill: '#4A4E63' }} />
                <YAxis tick={{ fontSize: 11, fill: '#4A4E63' }} />
                <Tooltip />
                <Bar dataKey="activeUsers" fill="#0047AB" name="Active Users" radius={[4, 4, 0, 0]} />
                <Bar dataKey="newSignups" fill="#BFC3D4" name="New Signups" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </Card>
        </div>

        {/* Pie Chart */}
        <div>
          <Card>
            <h2 className="font-lexend font-800 text-lg text-on-surface mb-4">Clubs by Category</h2>
            <ResponsiveContainer width="100%" height={250}>
              <PieChart>
                <Pie
                  data={data.clubsByCategory}
                  cx="50%"
                  cy="45%"
                  innerRadius={55}
                  outerRadius={80}
                  dataKey="count"
                  nameKey="category"
                >
                  {data.clubsByCategory.map((entry: { category: string; count: number; color: string }, i: number) => (
                    <Cell key={i} fill={entry.color} />
                  ))}
                </Pie>
                <Legend
                  iconSize={8}
                  wrapperStyle={{ fontSize: '11px' }}
                  formatter={(value) => <span style={{ color: '#4A4E63' }}>{value}</span>}
                />
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </Card>
        </div>
      </div>

      {/* Top Clubs Table */}
      <div className="mb-8">
        <h2 className="font-lexend font-800 text-lg text-on-surface mb-4">Top Clubs by Engagement</h2>
        <Card padding="none" className="overflow-hidden">
          <table className="w-full">
            <thead>
              <tr className="bg-surface-low border-b border-outline-variant/30">
                <th className="text-left py-3 px-5 text-xs font-jakarta font-700 text-on-surface-variant">Club</th>
                <th className="text-right py-3 px-5 text-xs font-jakarta font-700 text-on-surface-variant">Members</th>
                <th className="text-right py-3 px-5 text-xs font-jakarta font-700 text-on-surface-variant">Events</th>
                <th className="text-right py-3 px-5 text-xs font-jakarta font-700 text-on-surface-variant">Growth</th>
              </tr>
            </thead>
            <tbody>
              {data.topClubs.map((club: { id: string; name: string; members: number; events: number; growth: number }, i: number) => (
                <tr key={club.id} className={i % 2 === 0 ? '' : 'bg-surface/50'}>
                  <td className="py-3 px-5 text-sm font-jakarta text-on-surface">{club.name}</td>
                  <td className="py-3 px-5 text-sm text-right text-on-surface-variant">{club.members}</td>
                  <td className="py-3 px-5 text-sm text-right text-on-surface-variant">{club.events}</td>
                  <td className="py-3 px-5 text-right">
                    <span className="text-sm font-jakarta font-700 text-tertiary">+{club.growth}%</span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </Card>
      </div>

      {/* Recent Activity */}
      <div>
        <h2 className="font-lexend font-800 text-lg text-on-surface mb-4">Recent Activity</h2>
        <Card padding="none" className="overflow-hidden">
          {[
            { icon: '📋', action: 'Photography Society submitted a venue booking request', time: '5 min ago' },
            { icon: '🆕', action: '12 new students registered via mobile app', time: '1h ago' },
            { icon: '🏆', action: 'Basketball league game scores updated by Coach Thompson', time: '2h ago' },
            { icon: '📅', action: 'Sustainability Fair event created by Priya Sharma', time: '4h ago' },
            { icon: '⚠️', action: '3 students flagged for low wellness scores', time: '6h ago' },
          ].map((item, i) => (
            <div key={i} className={`flex items-center gap-3 px-5 py-4 ${i < 4 ? 'border-b border-outline-variant/30' : ''}`}>
              <span className="text-xl">{item.icon}</span>
              <p className="text-sm text-on-surface flex-1">{item.action}</p>
              <span className="text-xs text-on-surface-variant flex-shrink-0">{item.time}</span>
            </div>
          ))}
        </Card>
      </div>
    </DashboardLayout>
  );
};

export default AdminDashboard;
