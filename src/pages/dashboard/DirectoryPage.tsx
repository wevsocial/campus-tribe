import React, { useEffect, useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { supabase } from '../../lib/supabase';
import { DashboardLayout } from '../../components/layout/DashboardLayout';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Search, Users, X, Send, Ticket } from 'lucide-react';

interface DirUser {
  id: string;
  full_name: string | null;
  email: string;
  role: string;
  department: string | null;
}

const ROLE_TABS = [
  { id: 'student', label: 'Students' },
  { id: 'teacher', label: 'Teachers' },
  { id: 'coach', label: 'Coaches' },
  { id: 'admin', label: 'Admin' },
  { id: 'it_director,staff', label: 'Ops & IT' },
];

export default function DirectoryPage() {
  const { institutionId, user, role } = useAuth();
  const canSeeEmail = role === 'admin' || role === 'it_director';
  const [activeRoleTab, setActiveRoleTab] = useState(ROLE_TABS[0].id);
  const [search, setSearch] = useState('');
  const [users, setUsers] = useState<DirUser[]>([]);
  const [loading, setLoading] = useState(false);

  // DM modal
  const [dmTarget, setDmTarget] = useState<DirUser | null>(null);
  const [dmText, setDmText] = useState('');
  const [dmSending, setDmSending] = useState(false);
  const [dmFlash, setDmFlash] = useState('');

  // Ticket modal
  const [ticketTarget, setTicketTarget] = useState<DirUser | null>(null);
  const [ticketTitle, setTicketTitle] = useState('');
  const [ticketDesc, setTicketDesc] = useState('');
  const [ticketSending, setTicketSending] = useState(false);
  const [ticketFlash, setTicketFlash] = useState('');

  useEffect(() => {
    if (!institutionId) return;
    setLoading(true);
    const roles = activeRoleTab.includes(',') ? activeRoleTab.split(',') : [activeRoleTab];
    supabase
      .from('ct_users')
      .select('id, full_name, email, role, department')
      .eq('institution_id', institutionId)
      .in('role', roles)
      .then(({ data }) => {
        setUsers((data as DirUser[]) ?? []);
        setLoading(false);
      });
  }, [institutionId, activeRoleTab]);

  const filtered = users.filter(u => {
    if (!search) return true;
    const q = search.toLowerCase();
    return (u.full_name?.toLowerCase().includes(q) || u.email.toLowerCase().includes(q));
  });

  const initials = (name: string | null, email: string) =>
    (name || email).split(' ').map(s => s[0]).join('').slice(0, 2).toUpperCase();

  const sendDM = async () => {
    if (!user?.id || !institutionId || !dmTarget || !dmText.trim()) return;
    setDmSending(true);
    const { error } = await supabase.from('ct_direct_messages').insert({
      institution_id: institutionId,
      sender_id: user.id,
      recipient_id: dmTarget.id,
      message: dmText.trim(),
    });
    setDmSending(false);
    if (!error) {
      setDmFlash('Message sent!');
      setTimeout(() => { setDmFlash(''); setDmTarget(null); setDmText(''); }, 1500);
    }
  };

  const submitTicket = async () => {
    if (!user?.id || !institutionId || !ticketTarget || !ticketTitle.trim()) return;
    setTicketSending(true);
    const ticketType = ticketTarget.role === 'it_director' || ticketTarget.role === 'it_admin' ? 'it' : 'ops';
    const { error } = await supabase.from('ct_tickets').insert({
      institution_id: institutionId,
      created_by: user.id,
      assigned_to: ticketTarget.id,
      ticket_type: ticketType,
      title: ticketTitle.trim(),
      description: ticketDesc.trim() || null,
      priority: 'medium',
      status: 'open',
    });
    setTicketSending(false);
    if (!error) {
      setTicketFlash('Ticket created!');
      setTimeout(() => { setTicketFlash(''); setTicketTarget(null); setTicketTitle(''); setTicketDesc(''); }, 1500);
    }
  };

  const isOpsIT = (r: string) => r === 'it_director' || r === 'it_admin' || r === 'staff';

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex items-center gap-3">
          <Users size={24} className="text-primary" />
          <h1 className="font-lexend text-2xl font-extrabold text-on-surface">Directory</h1>
        </div>

        {/* Search */}
        <div className="relative max-w-md">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search by name…"
            className="w-full pl-9 pr-4 py-2.5 rounded-full border border-gray-200 dark:border-slate-600 bg-white dark:bg-slate-800 text-sm font-jakarta focus:outline-none focus:ring-2 focus:ring-blue-500/30"
          />
        </div>

        {/* Role tabs */}
        <div className="flex gap-1 overflow-x-auto bg-surface-low rounded-2xl p-1.5">
          {ROLE_TABS.map(t => (
            <button
              key={t.id}
              onClick={() => { setActiveRoleTab(t.id); setSearch(''); }}
              className={`px-4 py-2 rounded-xl text-sm font-jakarta font-700 whitespace-nowrap transition-all flex-shrink-0 ${
                activeRoleTab === t.id ? 'bg-primary text-white shadow-sm' : 'text-on-surface-variant hover:bg-surface'
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>

        {loading ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
            {[...Array(8)].map((_, i) => (
              <div key={i} className="h-28 bg-surface rounded-2xl animate-pulse" />
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <Card>
            <p className="text-center text-sm text-on-surface-variant py-10">No members found.</p>
          </Card>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
            {filtered.map(u => (
              <div key={u.id} className="bg-white dark:bg-slate-800 rounded-2xl border border-gray-200 dark:border-slate-700 p-4 flex flex-col items-center gap-2 text-center">
                <div className="w-12 h-12 rounded-full bg-primary flex items-center justify-center text-white font-lexend font-900 text-sm shrink-0">
                  {initials(u.full_name, u.email)}
                </div>
                <div className="min-w-0 w-full">
                  <p className="font-jakarta font-700 text-on-surface text-sm truncate">{u.full_name || u.email}</p>
                  {u.department && <p className="text-xs text-on-surface-variant truncate">{u.department}</p>}
                  {canSeeEmail && <p className="text-xs text-on-surface-variant truncate">{u.email}</p>}
                  <span className="mt-1 inline-block text-xs bg-primary/10 text-primary rounded-full px-2 py-0.5 font-jakarta font-700 capitalize">
                    {u.role.replace('_', ' ')}
                  </span>
                </div>
                {user && u.id !== user.id && (
                  <div className="flex gap-1 w-full mt-1">
                    {isOpsIT(u.role) ? (
                      <button
                        onClick={() => setTicketTarget(u)}
                        className="flex-1 flex items-center justify-center gap-1 py-1.5 rounded-full bg-secondary/10 text-secondary text-xs font-jakarta font-700 hover:bg-secondary/20 transition-all"
                      >
                        <Ticket size={11} /> Ticket
                      </button>
                    ) : (
                      <button
                        onClick={() => setDmTarget(u)}
                        className="flex-1 flex items-center justify-center gap-1 py-1.5 rounded-full bg-primary/10 text-primary text-xs font-jakarta font-700 hover:bg-primary/20 transition-all"
                      >
                        <Send size={11} /> Message
                      </button>
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* DM Modal */}
      {dmTarget && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4">
          <div className="bg-surface-container-lowest rounded-[2rem] p-6 w-full max-w-sm shadow-2xl">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-lexend font-800 text-on-surface">Message {dmTarget.full_name || dmTarget.email}</h3>
              <button onClick={() => setDmTarget(null)}><X size={18} /></button>
            </div>
            {dmFlash && <p className="text-sm text-primary mb-3">{dmFlash}</p>}
            <textarea
              value={dmText}
              onChange={e => setDmText(e.target.value)}
              rows={4}
              placeholder="Type your message..."
              className="w-full rounded-xl border border-outline-variant bg-surface-lowest px-4 py-3 text-sm mb-3"
            />
            <div className="flex gap-2">
              <Button onClick={sendDM} disabled={dmSending || !dmText.trim()} className="flex-1 rounded-full">Send</Button>
              <Button variant="outline" onClick={() => setDmTarget(null)} className="rounded-full">Cancel</Button>
            </div>
          </div>
        </div>
      )}

      {/* Ticket Modal */}
      {ticketTarget && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4">
          <div className="bg-surface-container-lowest rounded-[2rem] p-6 w-full max-w-sm shadow-2xl">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-lexend font-800 text-on-surface">Open Ticket with {ticketTarget.full_name || ticketTarget.email}</h3>
              <button onClick={() => setTicketTarget(null)}><X size={18} /></button>
            </div>
            {ticketFlash && <p className="text-sm text-primary mb-3">{ticketFlash}</p>}
            <div className="space-y-3">
              <input
                value={ticketTitle}
                onChange={e => setTicketTitle(e.target.value)}
                placeholder="Ticket title"
                className="w-full rounded-xl border border-outline-variant bg-surface-lowest px-4 py-2.5 text-sm"
              />
              <textarea
                value={ticketDesc}
                onChange={e => setTicketDesc(e.target.value)}
                rows={3}
                placeholder="Description (optional)"
                className="w-full rounded-xl border border-outline-variant bg-surface-lowest px-4 py-3 text-sm"
              />
            </div>
            <div className="flex gap-2 mt-3">
              <Button onClick={submitTicket} disabled={ticketSending || !ticketTitle.trim()} className="flex-1 rounded-full">Submit</Button>
              <Button variant="outline" onClick={() => setTicketTarget(null)} className="rounded-full">Cancel</Button>
            </div>
          </div>
        </div>
      )}
    </DashboardLayout>
  );
}
