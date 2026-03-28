import React, { useEffect, useMemo, useState } from 'react';
import { Bell } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../context/AuthContext';

type NotificationRow = {
  id: string;
  user_id: string;
  title: string;
  body: string | null;
  type: string | null;
  is_read: boolean | null;
  created_at: string;
  link?: string | null;
};

export default function NotificationBell() {
  const { user } = useAuth();
  const [open, setOpen] = useState(false);
  const [notifications, setNotifications] = useState<NotificationRow[]>([]);

  useEffect(() => {
    if (!user?.id) return;

    let active = true;

    const load = async () => {
      const { data } = await supabase
        .from('ct_notifications')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(10);

      if (active) setNotifications((data as NotificationRow[]) ?? []);
    };

    load();

    const channel = supabase
      .channel(`ct-notifications-${user.id}`)
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'ct_notifications', filter: `user_id=eq.${user.id}` },
        () => {
          load();
        },
      )
      .subscribe();

    return () => {
      active = false;
      supabase.removeChannel(channel);
    };
  }, [user?.id]);

  const unreadCount = useMemo(
    () => notifications.filter((notification) => !notification.is_read).length,
    [notifications],
  );

  const markAllRead = async () => {
    const unreadIds = notifications.filter((notification) => !notification.is_read).map((notification) => notification.id);
    if (!unreadIds.length) return;

    await supabase.from('ct_notifications').update({ is_read: true }).in('id', unreadIds);
    setNotifications((current) => current.map((notification) => ({ ...notification, is_read: true })));
  };

  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => setOpen((current) => !current)}
        className="relative flex h-11 w-11 items-center justify-center rounded-full bg-surface-low text-on-surface hover:bg-surface-high transition-colors"
      >
        <Bell size={18} />
        {unreadCount > 0 && (
          <span className="absolute right-1 top-1 min-w-5 rounded-full bg-secondary px-1.5 py-0.5 text-[10px] font-jakarta font-700 text-white">
            {unreadCount}
          </span>
        )}
      </button>

      {open && (
        <div className="absolute right-0 z-30 mt-3 w-80 rounded-3xl bg-surface-lowest p-4 shadow-float">
          <div className="mb-3 flex items-center justify-between">
            <h3 className="font-lexend text-base font-800 text-on-surface">Notifications</h3>
            <button type="button" onClick={markAllRead} className="text-xs font-jakarta font-700 text-primary">
              Mark all read
            </button>
          </div>

          <div className="max-h-96 space-y-2 overflow-y-auto">
            {notifications.length === 0 ? (
              <div className="rounded-2xl bg-surface p-4 text-sm text-on-surface-variant">No notifications yet.</div>
            ) : (
              notifications.map((notification) => (
                <button
                  key={notification.id}
                  type="button"
                  onClick={async () => {
                    if (!notification.is_read) {
                      await supabase.from('ct_notifications').update({ is_read: true }).eq('id', notification.id);
                      setNotifications((current) =>
                        current.map((item) => (item.id === notification.id ? { ...item, is_read: true } : item)),
                      );
                    }
                  }}
                  className="w-full rounded-2xl bg-surface p-4 text-left transition-colors hover:bg-surface-high"
                >
                  <div className="mb-1 flex items-center justify-between gap-3">
                    <p className="text-sm font-jakarta font-700 text-on-surface">{notification.title}</p>
                    {!notification.is_read && <span className="h-2.5 w-2.5 rounded-full bg-secondary" />}
                  </div>
                  {notification.body && <p className="text-xs text-on-surface-variant">{notification.body}</p>}
                  <p className="mt-2 text-[11px] text-on-surface-variant">
                    {new Date(notification.created_at).toLocaleString()}
                  </p>
                </button>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  )
}
