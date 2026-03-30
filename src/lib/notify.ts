import { supabase } from '../lib/supabase';

export async function sendNotification(
  userId: string,
  institutionId: string | null,
  title: string,
  body: string,
  type = 'info',
  link = ''
) {
  await supabase.from('ct_user_notifications').insert({
    user_id: userId,
    institution_id: institutionId,
    title,
    body,
    type,
    link,
  });
}
