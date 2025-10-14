import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { User } from '../models/user.model';

interface AuthState {
  user: User | null;
  login: (user: User) => void;
  logout: () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      login: (user) => set({ user }), 
      logout: () => set({ user: null }), 
    }),
    {
      name: 'auth-storage',
    }
  )
);
