import React, { useState, useEffect, useCallback } from 'react';
import { supabase } from '../../lib/supabase';
import { Button } from '../ui/Button';
import { Badge } from '../ui/Badge';
import { Card } from '../ui/Card';
import { Input } from '../ui/Input';
import { Plus, X, Send, RefreshCw } from 'lucide-react';

interface Ticket {
  id: string;
  title: string;
  description: string | null;
  status: 'open' | 'in_progress' | 'resolved' | 'closed';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  ticket_type: string;
  created_by: string | null;
  assigned_to: string | null;
  resolution_notes: string | null;
  created_at: string;
  updated_at: string;
}

interface TicketMessage {
  id: string;
  ticket_id: string;
  sender_id: string | null;
  message: string;
  is_internal: boolean;
  created_at: string;
}

interface StaffUser {
  id: string;
  full_name: string | null;
  email: string;
  role: string;
}

interface Props {
  ticketType: 'ops' | 'it' | 'admin' | 'general';
  institutionId: string | null;
  userId: string | undefined;
  userRole: string;
}

const STATUS_VARIANTS: Record<string, 'primary' | 'secondary' | 'tertiary' | 'neutral'> = {
  open: 'primary',
  in_progress: 'secondary',
  resolved: 'tertiary',
  closed: 'neutral',
};

const PRIORITY_CLASSES: Record<string, string> = {
  low: 'bg-gray-100 text-gray-600',
  medium: 'bg-blue-100 text-blue-700',
  high: 'bg-orange-100 text-orange-700',
  urgent: 'bg-red-100 text-red-700',
};

const isStaff = (role: string) =>
  ['it', 'it_director', 'it_admin', 'staff', 'ops', 'admin'].includes(role);

export default function TicketingSystem({ ticketType, institutionId, userId, userRole }: Props) {
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [selected, setSelected] = useState<Ticket | null>(null);
  const [messages, setMessages] = useState<TicketMessage[]>([]);
  const [staffUsers, setStaffUsers] = useState<StaffUser[]>([]);
  const [filter, setFilter] = useState<'all' | 'open' | 'in_progress' | 'resolved'>('all');
  const [showNew, setShowNew] = useState(false);
  const [loading, setLoading] = useState(false);
  const [replyText, setReplyText] = useState('');
  const [resolutionNotes, setResolutionNotes] = useState('');

  // New ticket form
  const [newTitle, setNewTitle] = useState('');
  const [newDesc, setNewDesc] = useState('');
  const [newPriority, setNewPriority] = useState<'low' | 'medium' | 'high' | 'urgent'>('medium');

  const fetchTickets = useCallback(async () => {
    if (!institutionId) return;
    const q = supabase.from('ct_tickets').select('*').eq('institution_id', institutionId).eq('ticket_type', ticketType).order('updated_at', { ascending: false });
    const { data } = await q;
    setTickets((data as Ticket[]) ?? []);
  }, [institutionId, ticketType]);

  const fetchMessages = useCallback(async (ticketId: string) => {
    const { data } = await supabase.from('ct_ticket_messages').select('*').eq('ticket_id', ticketId).order('created_at', { ascending: true });
    setMessages((data as TicketMessage[]) ?? []);
  }, []);

  useEffect(() => {
    fetchTickets();
    // Staff users for assignment
    if (institutionId && isStaff(userRole)) {
      supabase.from('ct_users').select('id, full_name, email, role').eq('institution_id', institutionId)
        .in('role', ['it_director', 'it_admin', 'staff', 'admin']).then(({ data }) => setStaffUsers((data as StaffUser[]) ?? []));
    }
  }, [institutionId, userRole, fetchTickets]);

  useEffect(() => {
    if (!selected) return;
    fetchMessages(selected.id);

    // Realtime subscription
    const channel = supabase.channel(`ticket-${selected.id}`)
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'ct_ticket_messages', filter: `ticket_id=eq.${selected.id}` }, (payload) => {
        setMessages(prev => [...prev, payload.new as TicketMessage]);
      })
      .subscribe();
    return () => { supabase.removeChannel(channel); };
  }, [selected, fetchMessages]);

  const createTicket = async () => {
    if (!userId || !institutionId || !newTitle.trim()) return;
    setLoading(true);
    const { data, error } = await supabase.from('ct_tickets').insert({
      institution_id: institutionId,
      created_by: userId,
      ticket_type: ticketType,
      title: newTitle.trim(),
      description: newDesc.trim() || null,
      priority: newPriority,
      status: 'open',
    }).select('*').single();
    if (!error && data) {
      setTickets(prev => [data as Ticket, ...prev]);
      setShowNew(false);
      setNewTitle(''); setNewDesc(''); setNewPriority('medium');
    }
    setLoading(false);
  };

  const sendReply = async () => {
    if (!userId || !selected || !replyText.trim()) return;
    const { data, error } = await supabase.from('ct_ticket_messages').insert({
      ticket_id: selected.id,
      sender_id: userId,
      message: replyText.trim(),
      is_internal: false,
    }).select('*').single();
    if (!error && data) {
      setMessages(prev => [...prev, data as TicketMessage]);
      setReplyText('');
    }
  };

  const updateStatus = async (ticketId: string, status: string) => {
    const update: Record<string, unknown> = { status };
    if (status === 'resolved') { update.resolved_at = new Date().toISOString(); update.resolution_notes = resolutionNotes || null; }
    await supabase.from('ct_tickets').update(update).eq('id', ticketId);
    setTickets(prev => prev.map(t => t.id === ticketId ? { ...t, status: status as Ticket['status'] } : t));
    if (selected?.id === ticketId) setSelected(prev => prev ? { ...prev, status: status as Ticket['status'] } : null);
  };

  const assignTicket = async (ticketId: string, assignedTo: string) => {
    await supabase.from('ct_tickets').update({ assigned_to: assignedTo, status: 'in_progress' }).eq('id', ticketId);
    setTickets(prev => prev.map(t => t.id === ticketId ? { ...t, assigned_to: assignedTo, status: 'in_progress' } : t));
    if (selected?.id === ticketId) setSelected(prev => prev ? { ...prev, assigned_to: assignedTo, status: 'in_progress' } : null);
  };

  const filtered = tickets.filter(t => filter === 'all' || t.status === filter);

  return (
    <div className="flex flex-col lg:flex-row gap-4 h-[calc(100vh-200px)] min-h-96">
      {/* Left: Ticket list */}
      <div className="lg:w-80 shrink-0 flex flex-col gap-3">
        <div className="flex items-center justify-between">
          <h2 className="font-lexend font-800 text-on-surface text-lg capitalize">{ticketType} Tickets</h2>
          <Button size="sm" onClick={() => setShowNew(true)} className="rounded-full gap-1">
            <Plus size={14} /> New
          </Button>
        </div>

        {/* Filter tabs */}
        <div className="flex gap-1 bg-surface rounded-xl p-1 text-xs">
          {(['all', 'open', 'in_progress', 'resolved'] as const).map(f => (
            <button key={f} onClick={() => setFilter(f)}
              className={`flex-1 py-1.5 rounded-lg font-jakarta font-700 transition-all capitalize ${filter === f ? 'bg-primary text-white' : 'text-on-surface-variant hover:text-on-surface'}`}>
              {f.replace('_', ' ')}
            </button>
          ))}
        </div>

        {/* Ticket list */}
        <div className="flex-1 overflow-y-auto space-y-2">
          {filtered.length === 0 && <p className="text-sm text-on-surface-variant text-center py-8">No tickets found.</p>}
          {filtered.map(ticket => (
            <button key={ticket.id} onClick={() => setSelected(ticket)}
              className={`w-full text-left rounded-[1rem] p-3 transition-all border ${selected?.id === ticket.id ? 'border-primary bg-primary-container' : 'border-outline-variant bg-surface hover:bg-surface-container'}`}>
              <div className="flex items-start justify-between gap-2 mb-1">
                <p className="font-jakarta font-700 text-sm text-on-surface line-clamp-1">{ticket.title}</p>
                <Badge label={ticket.status.replace('_', ' ')} variant={STATUS_VARIANTS[ticket.status] ?? 'neutral'} />
              </div>
              <div className="flex items-center gap-2">
                <span className={`text-xs px-2 py-0.5 rounded-full font-jakarta font-700 ${PRIORITY_CLASSES[ticket.priority]}`}>{ticket.priority}</span>
                <span className="text-xs text-on-surface-variant">{new Date(ticket.created_at).toLocaleDateString()}</span>
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Right: Ticket detail */}
      <div className="flex-1 flex flex-col min-h-0">
        {!selected ? (
          <Card className="flex-1 flex items-center justify-center">
            <p className="text-on-surface-variant text-sm">Select a ticket to view details</p>
          </Card>
        ) : (
          <Card className="flex-1 flex flex-col min-h-0 overflow-hidden">
            {/* Header */}
            <div className="flex items-start justify-between gap-3 mb-4 shrink-0">
              <div>
                <h3 className="font-lexend font-800 text-on-surface">{selected.title}</h3>
                <div className="flex items-center gap-2 mt-1">
                  <Badge label={selected.status.replace('_', ' ')} variant={STATUS_VARIANTS[selected.status] ?? 'neutral'} />
                  <span className={`text-xs px-2 py-0.5 rounded-full font-jakarta font-700 ${PRIORITY_CLASSES[selected.priority]}`}>{selected.priority}</span>
                </div>
              </div>
              <button onClick={() => { setSelected(null); setMessages([]); }} className="text-on-surface-variant hover:text-on-surface"><X size={18} /></button>
            </div>

            {selected.description && (
              <p className="text-sm text-on-surface-variant bg-surface rounded-xl p-3 mb-3 shrink-0">{selected.description}</p>
            )}

            {/* Staff controls */}
            {isStaff(userRole) && (
              <div className="flex flex-wrap gap-2 mb-3 shrink-0">
                <select value={selected.status} onChange={e => updateStatus(selected.id, e.target.value)}
                  className="rounded-xl border border-outline-variant bg-surface-lowest px-3 py-1.5 text-sm">
                  <option value="open">Open</option>
                  <option value="in_progress">In Progress</option>
                  <option value="resolved">Resolved</option>
                  <option value="closed">Closed</option>
                </select>
                {staffUsers.length > 0 && (
                  <select value={selected.assigned_to ?? ''} onChange={e => assignTicket(selected.id, e.target.value)}
                    className="rounded-xl border border-outline-variant bg-surface-lowest px-3 py-1.5 text-sm">
                    <option value="">Unassigned</option>
                    {staffUsers.map(u => <option key={u.id} value={u.id}>{u.full_name || u.email}</option>)}
                  </select>
                )}
                <button onClick={fetchTickets} className="p-1.5 rounded-lg border border-outline-variant text-on-surface-variant hover:text-on-surface">
                  <RefreshCw size={14} />
                </button>
              </div>
            )}

            {/* Messages */}
            <div className="flex-1 overflow-y-auto space-y-2 min-h-0 mb-3">
              {messages.length === 0 && <p className="text-sm text-on-surface-variant text-center py-4">No messages yet. Start the conversation.</p>}
              {messages.map(msg => (
                <div key={msg.id} className={`rounded-[1rem] p-3 max-w-[85%] ${msg.sender_id === userId ? 'ml-auto bg-primary text-white' : 'bg-surface'}`}>
                  <p className="text-sm">{msg.message}</p>
                  <p className={`text-xs mt-1 ${msg.sender_id === userId ? 'text-white/70' : 'text-on-surface-variant'}`}>
                    {new Date(msg.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </p>
                </div>
              ))}
            </div>

            {/* Resolution notes (staff only, when resolving) */}
            {isStaff(userRole) && selected.status !== 'closed' && (
              <div className="mb-2 shrink-0">
                <textarea value={resolutionNotes} onChange={e => setResolutionNotes(e.target.value)}
                  rows={2} placeholder="Resolution notes (optional)..."
                  className="w-full rounded-xl border border-outline-variant bg-surface-lowest px-3 py-2 text-sm" />
              </div>
            )}

            {/* Reply input */}
            {selected.status !== 'closed' && (
              <div className="flex gap-2 shrink-0">
                <input value={replyText} onChange={e => setReplyText(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && !e.shiftKey && (e.preventDefault(), sendReply())}
                  placeholder="Type a message..."
                  className="flex-1 rounded-full border border-outline-variant bg-surface-lowest px-4 py-2 text-sm" />
                <button onClick={sendReply} disabled={!replyText.trim()}
                  className="p-2 rounded-full bg-primary text-white disabled:opacity-40 transition-opacity">
                  <Send size={16} />
                </button>
              </div>
            )}
          </Card>
        )}
      </div>

      {/* New Ticket Modal */}
      {showNew && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4">
          <div className="bg-surface-container-lowest rounded-[2rem] p-6 w-full max-w-md shadow-2xl">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-lexend font-800 text-on-surface">New Ticket</h3>
              <button onClick={() => setShowNew(false)} className="text-on-surface-variant hover:text-on-surface"><X size={18} /></button>
            </div>
            <div className="space-y-3">
              <Input label="Title" value={newTitle} onChange={e => setNewTitle(e.target.value)} placeholder="Briefly describe the issue" />
              <div>
                <label className="block text-sm font-jakarta font-700 text-on-surface mb-1">Description</label>
                <textarea value={newDesc} onChange={e => setNewDesc(e.target.value)} rows={3}
                  placeholder="Provide more details..."
                  className="w-full rounded-xl border border-outline-variant bg-surface-lowest px-4 py-3 text-sm" />
              </div>
              <div>
                <label className="block text-sm font-jakarta font-700 text-on-surface mb-1">Priority</label>
                <select value={newPriority} onChange={e => setNewPriority(e.target.value as typeof newPriority)}
                  className="w-full rounded-xl border border-outline-variant bg-surface-lowest px-4 py-2.5 text-sm">
                  <option value="low">Low</option>
                  <option value="medium">Medium</option>
                  <option value="high">High</option>
                  <option value="urgent">Urgent</option>
                </select>
              </div>
              <div className="flex gap-2 pt-2">
                <Button onClick={createTicket} disabled={loading || !newTitle.trim()} className="flex-1 rounded-full">Submit Ticket</Button>
                <Button variant="outline" onClick={() => setShowNew(false)} className="rounded-full">Cancel</Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
