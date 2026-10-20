import { create } from 'zustand';

export interface Usuario {
  Id: number;
  Nombre: string;
  Apellido: string;
  UsuarioEmpleado: string;
  Email: string;
  IdRol: number; // 1: Admin, 2: Encargado, 3: Vendedor, 4: Técnico, 5: Analista
  IdSucursal: number;
  rol?: { Id?: number; Nombre: string };
  sucursal?: { Id?: number; Nombre: string };
}

interface AuthState {
  usuario: Usuario | null;
  isAuthenticated: boolean;
  isLoadingSession: boolean;
  login: (userData: Usuario) => void;
  logout: () => void;
  setIsLoadingSession: (loading: boolean) => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  usuario: null,
  isAuthenticated: false,
  isLoadingSession: true,

  login: (userData) => set({ usuario: userData, isAuthenticated: true, isLoadingSession: false }),
  logout: () => set({ usuario: null, isAuthenticated: false, isLoadingSession: false }),
  setIsLoadingSession: (loading) => set({ isLoadingSession: loading }),
}));
