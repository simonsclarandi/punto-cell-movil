import { create } from 'zustand';

// 1. Definimos la interfaz 
interface NavigationState {
  moduloActual: string;
  menuAbierto: boolean;
  vistaActual: string;
  itemSeleccionado: any;
  
  setMenuAbierto: (estado: boolean) => void;
  setVistaActual: (vista: string) => void;
  setItemSeleccionado: (item: any) => void;
  cambiarModulo: (modulo: string) => void;
}

// 2. Le pasamos la interfaz a la función create de Zustand
export const useNavigationStore = create<NavigationState>((set) => ({
  moduloActual: 'inventario',
  menuAbierto: false,
  vistaActual: 'lista',
  itemSeleccionado: null,

  // Acciones
  setMenuAbierto: (estado) => set({ menuAbierto: estado }),
  setVistaActual: (vista) => set({ vistaActual: vista }),
  setItemSeleccionado: (item) => set({ itemSeleccionado: item }),
  
  // Lógica agrupada
  cambiarModulo: (modulo) => set({ 
    moduloActual: modulo, 
    vistaActual: 'lista', 
    itemSeleccionado: null,
    menuAbierto: false 
  }),
}));