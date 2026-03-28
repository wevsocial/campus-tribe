import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://ncftkuuxfllyohixiusb.supabase.co';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseAnonKey) {
  console.warn('Missing VITE_SUPABASE_ANON_KEY. Set it in your Vite environment before using auth.');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey || 'missing-anon-key', {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true,
  },
});

export default supabase;
