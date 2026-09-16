import { create } from 'zustand';

// Creamos el store con los estados iniciales y las acciones para modificarlos
export const useNavigationStore = create((set) => ({
  moduloActual: 'inventario',
  menuAbierto: false,
  vistaActual: 'lista',
  itemSeleccionado: null,

  // Acciones (reemplazan a los set... de useState)
  setMenuAbierto: (estado) => set({ menuAbierto: estado }),
  setVistaActual: (vista) => set({ vistaActual: vista }),
  setItemSeleccionado: (item) => set({ itemSeleccionado: item }),
  
  // Agrupamos lógica compleja: al cambiar de módulo, siempre volvemos a la lista
  cambiarModulo: (modulo) => set({ 
    moduloActual: modulo, 
    vistaActual: 'lista', 
    itemSeleccionado: null,
    menuAbierto: false // Cierra el menú automáticamente
  }),
}));