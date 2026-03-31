import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://ncftkuuxfllyohixiusb.supabase.co';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5jZnRrdXV4ZmxseW9oaXhpdXNiIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjU3MjI1MTAsImV4cCI6MjA4MTI5ODUxMH0.qMXAzX_5R7Tsu32PLgZqz5C4oSQ9tMLmsbFp8k87ao17_S-M6ik';

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
