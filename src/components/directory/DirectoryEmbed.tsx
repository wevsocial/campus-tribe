import React, { useEffect, useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { supabase } from '../../lib/supabase';
import { Card } from '../ui/Card';
import { Button } from '../ui/Button';
import { Search, Send, Ticket, Loader2 } from 'lucide-react';

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

interface DirectoryEmbedProps {
  showTitle?: boolean;
}

export default function DirectoryEmbed({ showTitle = true }: DirectoryEmbedProps) {
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
      .then(({ data, error }) => {
        setUsers((data as DirUser[]) ?? []);
        setLoading(false);
      });
  }, [institutionId, activeRoleTab]);

  const filtered = search
    ? users.filter(u =>
        (u.full_name || '').toLowerCase().includes(search.toLowerCase()) ||
        u.email.toLowerCase().includes(search.toLowerCase())
      )
    : users;

  const isOpsIT = (r: string) => ['it_director', 'staff'].includes(r);

  const sendDM = async () => {
    if (!dmTarget || !dmText.trim() || !user?.id || !institutionId) return;
    setDmSending(true);
    const dmRole = dmTarget.role;

    if (isOpsIT(dmRole)) {
      // Create ticket instead
      await supabase.from('ct_tickets').insert({
        from_user_id: user.id,
        to_user_id: dmTarget.id,
        institution_id: institutionId,
        subject: `Message from ${role}`,
        message: dmText.trim(),
        status: 'open',
      });
      setDmFlash('Message sent as support ticket!');
    } else {
      await supabase.from('ct_direct_messages').insert({
        from_user_id: user.id,
        to_user_id: dmTarget.id,
        institution_id: institutionId,
        message: dmText.trim(),
      });
      setDmFlash('Message sent!');
    }

    setDmSending(false);
    setTimeout(() => {
      setDmTarget(null);
      setDmText('');
      setDmFlash('');
    }, 1500);
  };

  const createTicket = async () => {
    if (!ticketTarget || !ticketDesc.trim() || !user?.id || !institutionId) return;
    setTicketSending(true);
    await supabase.from('ct_tickets').insert({
      from_user_id: user.id,
      to_user_id: ticketTarget.id,
      institution_id: institutionId,
      subject: ticketTitle.trim() || 'Support Request',
      message: ticketDesc.trim(),
      status: 'open',
    });
    setTicketFlash('Ticket created!');
    setTicketSending(false);
    setTimeout(() => {
      setTicketTarget(null);
      setTicketTitle('');
      setTicketDesc('');
      setTicketFlash('');
    }, 1500);
  };

  return (
    <div className="space-y-4">
      {showTitle && (
        <h2 className="font-lexend text-xl font-bold text-on-surface">Directory</h2>
      )}

      {/* Role Tabs */}
      <div className="flex flex-wrap gap-2">
        {ROLE_TABS.map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveRoleTab(tab.id)}
            className={`px-4 py-1.5 rounded-full text-sm font-jakarta font-bold transition-all ${
              activeRoleTab === tab.id
                ? 'bg-primary text-white'
                : 'bg-surface-low text-on-surface-variant hover:bg-primary-container'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Search */}
      <div className="relative">
        <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant" />
        <input
          type="text"
          placeholder="Search by name or email..."
          value={search}
          onChange={e => setSearch(e.target.value)}
          className="w-full pl-9 pr-4 py-2.5 rounded-xl border border-outline-variant bg-surface-lowest text-sm font-jakarta"
        />
      </div>

      {/* Users list */}
      {loading ? (
        <div className="flex justify-center py-8">
          <Loader2 size={24} className="animate-spin text-primary" />
        </div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-8 text-sm text-on-surface-variant">No users found.</div>
      ) : (
        <div className="space-y-2">
          {filtered.map(u => (
            <Card key={u.id} className="flex items-center justify-between gap-4 !p-3">
              <div className="flex-1 min-w-0">
                <p className="font-jakarta font-bold text-on-surface truncate">{u.full_name || 'Unknown'}</p>
                <p className="text-xs text-on-surface-variant truncate">
                  {canSeeEmail ? u.email : ''}
                  {u.department ? ` · ${u.department}` : ''}
                </p>
                <span className="text-xs text-primary capitalize">{u.role.replace('_', ' ')}</span>
              </div>
              <div className="flex gap-2 shrink-0">
                {isOpsIT(u.role) ? (
                  <button
                    onClick={() => setTicketTarget(u)}
                    className="flex items-center gap-1 text-xs px-3 py-1.5 rounded-full bg-yellow-50 text-yellow-700 hover:bg-yellow-100 border border-yellow-200 font-jakarta font-bold"
                  >
                    <Ticket size={13} /> Submit Ticket
                  </button>
                ) : (
                  <button
                    onClick={() => setDmTarget(u)}
                    className="flex items-center gap-1 text-xs px-3 py-1.5 rounded-full bg-primary-container text-primary hover:bg-primary hover:text-white border border-primary/20 font-jakarta font-bold transition-all"
                  >
                    <Send size={13} /> Message
                  </button>
                )}
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* DM Modal */}
      {dmTarget && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-surface-lowest rounded-2xl p-6 max-w-md w-full shadow-2xl">
            <h3 className="font-lexend font-bold text-on-surface mb-4">Message {dmTarget.full_name}</h3>
            {dmFlash ? (
              <p className="text-green-600 font-jakarta font-bold text-center py-4">{dmFlash}</p>
            ) : (
              <>
                <textarea
                  rows={4}
                  value={dmText}
                  onChange={e => setDmText(e.target.value)}
                  placeholder="Write your message..."
                  className="w-full rounded-xl border border-outline-variant bg-surface p-3 text-sm font-jakarta mb-4"
                />
                <div className="flex gap-3">
                  <Button onClick={sendDM} disabled={dmSending || !dmText.trim()} className="flex-1 rounded-full">
                    {dmSending ? 'Sending...' : 'Send'}
                  </Button>
                  <Button variant="outline" onClick={() => setDmTarget(null)} className="rounded-full">Cancel</Button>
                </div>
              </>
            )}
          </div>
        </div>
      )}

      {/* Ticket Modal */}
      {ticketTarget && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-surface-lowest rounded-2xl p-6 max-w-md w-full shadow-2xl">
            <h3 className="font-lexend font-bold text-on-surface mb-4">Submit Ticket to {ticketTarget.full_name}</h3>
            {ticketFlash ? (
              <p className="text-green-600 font-jakarta font-bold text-center py-4">{ticketFlash}</p>
            ) : (
              <>
                <input
                  type="text"
                  value={ticketTitle}
                  onChange={e => setTicketTitle(e.target.value)}
                  placeholder="Subject..."
                  className="w-full rounded-xl border border-outline-variant bg-surface p-3 text-sm font-jakarta mb-3"
                />
                <textarea
                  rows={4}
                  value={ticketDesc}
                  onChange={e => setTicketDesc(e.target.value)}
                  placeholder="Describe your request..."
                  className="w-full rounded-xl border border-outline-variant bg-surface p-3 text-sm font-jakarta mb-4"
                />
                <div className="flex gap-3">
                  <Button onClick={createTicket} disabled={ticketSending || !ticketDesc.trim()} className="flex-1 rounded-full">
                    {ticketSending ? 'Submitting...' : 'Submit Ticket'}
                  </Button>
                  <Button variant="outline" onClick={() => setTicketTarget(null)} className="rounded-full">Cancel</Button>
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
