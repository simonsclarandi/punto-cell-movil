import { create } from 'zustand';

interface AuthState {
  usuario: { username: string; rol: string } | null;
  isAuthenticated: boolean;
  login: (userData: any) => void;
  logout: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  usuario: null,
  isAuthenticated: false,
  
  login: (userData) => set({ usuario: userData, isAuthenticated: true }),
  logout: () => set({ usuario: null, isAuthenticated: false }),
}));