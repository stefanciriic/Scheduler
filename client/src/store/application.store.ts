import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface User {
  id: number;
  firstName: string;
  lastName: string;
  username: string;
  token: string;
  role: 'ADMIN' | 'BUSINESS_OWNER' | 'EMPLOYEE' | 'USER';
  businessId?: number; 
}

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
