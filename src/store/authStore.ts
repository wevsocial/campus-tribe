import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { User, Institution } from '../types';
import { MOCK_USERS, MOCK_INSTITUTION, MOCK_CREDENTIALS } from '../lib/mockData';

interface AuthState {
  user: User | null;
  institution: Institution | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  logout: () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      institution: null,
      isLoading: false,
      isAuthenticated: false,

      login: async (email: string, password: string) => {
        set({ isLoading: true });
        await new Promise((r) => setTimeout(r, 600));

        const expectedPassword = MOCK_CREDENTIALS[email.toLowerCase()];
        if (!expectedPassword || expectedPassword !== password) {
          set({ isLoading: false });
          return { success: false, error: 'Invalid email or password.' };
        }

        const user = MOCK_USERS.find((u) => u.email.toLowerCase() === email.toLowerCase());
        if (!user) {
          set({ isLoading: false });
          return { success: false, error: 'User not found.' };
        }

        set({ user, institution: MOCK_INSTITUTION, isAuthenticated: true, isLoading: false });
        return { success: true };
      },

      logout: () => {
        set({ user: null, institution: null, isAuthenticated: false });
      },
    }),
    { name: 'campus-tribe-auth' }
  )
);
