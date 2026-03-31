import React, { useEffect, useState } from 'react';
import { MessageSquare, Send } from 'lucide-react';
import { useAuth } from '../../../context/AuthContext';
import { supabase } from '../../../lib/supabase';
import EmptyState from '../../../components/ui/EmptyState';

interface Notification {
  id: string;
  title: string;
  body: string;
  type: string;
  created_at: string;
  is_read: boolean;
}

interface Teacher {
  id: string;
  full_name: string | null;
  email: string;
}

export default function ParentMessages() {
  const { user, institutionId } = useAuth();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [teachers, setTeachers] = useState<Teacher[]>([]);
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [showCompose, setShowCompose] = useState(false);
  const [selectedTeacher, setSelectedTeacher] = useState('');
  const [messageText, setMessageText] = useState('');

  const load = async () => {
    if (!user?.id || !institutionId) return;
    setLoading(true);

    const [{ data: notifs }, { data: teacherData }] = await Promise.all([
      supabase
        .from('ct_notifications')
        .select('id, title, body, type, created_at, is_read')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(30),
      supabase
        .from('ct_users')
        .select('id, full_name, email')
        .eq('institution_id', institutionId)
        .contains('roles', ['teacher']),
    ]);

    setNotifications(notifs || []);
    setTeachers(teacherData || []);
    setLoading(false);
  };

  useEffect(() => { load(); }, [user?.id, institutionId]);

  const sendMessage = async () => {
    if (!selectedTeacher || !messageText.trim() || !user?.id) return;
    setSending(true);
    await supabase.from('ct_notifications').insert({
      user_id: selectedTeacher,
      type: 'parent_message',
      title: 'Message from Parent',
      body: messageText.trim(),
      created_by: user.id,
    });
    setMessageText('');
    setSelectedTeacher('');
    setShowCompose(false);
    setSending(false);
    load();
  };

  if (loading) return <div className="flex justify-center py-12"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" /></div>;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="font-lexend text-2xl font-extrabold text-on-surface">Messages</h1>
        <button
          onClick={() => setShowCompose(!showCompose)}
          className="flex items-center gap-2 px-4 py-2 rounded-xl bg-primary text-white font-jakarta font-bold text-sm hover:bg-primary/90 transition-colors"
        >
          <MessageSquare size={16} /> Message a Teacher
        </button>
      </div>

      {showCompose && (
        <div className="bg-surface-lowest rounded-2xl p-4 border border-outline-variant/30 space-y-3">
          <p className="font-jakarta font-bold text-on-surface">Send a Message</p>
          <select
            className="w-full border border-outline-variant rounded-xl px-4 py-2 font-jakarta text-sm bg-surface"
            value={selectedTeacher}
            onChange={e => setSelectedTeacher(e.target.value)}
          >
            <option value="">Select a teacher...</option>
            {teachers.map(t => <option key={t.id} value={t.id}>{t.full_name || t.email}</option>)}
          </select>
          <textarea
            className="w-full border border-outline-variant rounded-xl px-4 py-2 font-jakarta text-sm bg-surface resize-none"
            rows={4}
            placeholder="Type your message..."
            value={messageText}
            onChange={e => setMessageText(e.target.value)}
          />
          <div className="flex gap-2">
            <button
              onClick={sendMessage}
              disabled={sending || !selectedTeacher || !messageText.trim()}
              className="flex items-center gap-2 px-4 py-2 rounded-xl bg-secondary text-white font-jakarta font-bold text-sm hover:bg-secondary/90 disabled:opacity-50"
            >
              <Send size={14} /> {sending ? 'Sending...' : 'Send'}
            </button>
            <button onClick={() => setShowCompose(false)} className="px-4 py-2 rounded-xl bg-surface-low text-on-surface-variant font-jakarta font-bold text-sm">Cancel</button>
          </div>
        </div>
      )}

      {notifications.length === 0 ? (
        <EmptyState message="No messages yet. Updates from your school will appear here." />
      ) : (
        <div className="space-y-3">
          {notifications.map(n => (
            <div key={n.id} className={`rounded-xl p-4 border ${n.is_read ? 'bg-surface-lowest border-outline-variant/20' : 'bg-primary-container/30 border-primary/20'}`}>
              <div className="flex justify-between items-start mb-1">
                <p className="font-jakarta font-bold text-sm text-on-surface">{n.title}</p>
                <span className="text-xs text-on-surface-variant">{new Date(n.created_at).toLocaleDateString()}</span>
              </div>
              <p className="text-sm text-on-surface-variant">{n.body}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
