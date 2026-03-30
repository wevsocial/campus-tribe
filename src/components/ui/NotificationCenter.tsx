import React, { useEffect, useRef, useState } from 'react';
import { Bell } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../context/AuthContext';
import { useNavigate } from 'react-router-dom';

interface Notification {
  id: string;
  title: string;
  body: string | null;
  type: string;
  is_read: boolean;
  link: string | null;
  created_at: string;
}

export default function NotificationCenter() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const ref = useRef<HTMLDivElement>(null);

  const fetchNotifications = async () => {
    if (!user) return;
    const { data } = await supabase
      .from('ct_user_notifications')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })
      .limit(20);
    if (data) setNotifications(data as Notification[]);
  };

  useEffect(() => {
    fetchNotifications();

    if (!user) return;
    const channel = supabase
      .channel(`notif_${user.id}`)
      .on('postgres_changes', {
        event: 'INSERT',
        schema: 'public',
        table: 'ct_user_notifications',
        filter: `user_id=eq.${user.id}`,
      }, (payload) => {
        setNotifications(prev => [payload.new as Notification, ...prev.slice(0, 19)]);
      })
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, [user]);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const unread = notifications.filter(n => !n.is_read).length;

  const markRead = async (n: Notification) => {
    if (!n.is_read) {
      await supabase.from('ct_user_notifications').update({ is_read: true }).eq('id', n.id);
      setNotifications(prev => prev.map(x => x.id === n.id ? { ...x, is_read: true } : x));
    }
    if (n.link) { navigate(n.link); setOpen(false); }
  };

  const markAllRead = async () => {
    if (!user) return;
    await supabase.from('ct_user_notifications').update({ is_read: true }).eq('user_id', user.id).eq('is_read', false);
    setNotifications(prev => prev.map(x => ({ ...x, is_read: true })));
  };

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setOpen(!open)}
        className="relative p-2 rounded-xl hover:bg-surface-low transition-colors"
      >
        <Bell size={20} className="text-on-surface-variant" />
        {unread > 0 && (
          <span className="absolute -top-0.5 -right-0.5 w-5 h-5 rounded-full bg-secondary text-white text-xs flex items-center justify-center font-jakarta font-700">
            {unread > 9 ? '9+' : unread}
          </span>
        )}
      </button>

      {open && (
        <div className="absolute right-0 top-12 w-80 bg-surface-lowest rounded-2xl shadow-float border border-outline-variant/30 z-50 overflow-hidden">
          <div className="flex items-center justify-between px-4 py-3 border-b border-outline-variant/30">
            <p className="font-lexend font-700 text-on-surface text-sm">Notifications</p>
            {unread > 0 && (
              <button onClick={markAllRead} className="text-xs text-primary font-jakarta">Mark all read</button>
            )}
          </div>
          <div className="max-h-80 overflow-y-auto">
            {notifications.length === 0 ? (
              <p className="text-center text-on-surface-variant text-sm font-jakarta py-8">No notifications yet</p>
            ) : notifications.map(n => (
              <button
                key={n.id}
                onClick={() => markRead(n)}
                className={`w-full text-left px-4 py-3 hover:bg-surface-low transition-colors border-b border-outline-variant/20 last:border-0 ${!n.is_read ? 'bg-primary-container/20' : ''}`}
              >
                <div className="flex items-start gap-2">
                  {!n.is_read && <span className="mt-1.5 w-2 h-2 rounded-full bg-secondary flex-shrink-0" />}
                  <div className={!n.is_read ? '' : 'ml-4'}>
                    <p className="font-jakarta font-700 text-on-surface text-xs">{n.title}</p>
                    {n.body && <p className="text-on-surface-variant text-xs mt-0.5">{n.body}</p>}
                    <p className="text-on-surface-variant text-xs mt-1">{new Date(n.created_at).toLocaleDateString()}</p>
                  </div>
                </div>
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
