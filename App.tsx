import React from 'react';
import { StyleSheet, View } from 'react-native';
import { SafeAreaView, SafeAreaProvider } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

import { COLORS } from './constants/theme';
import { useNavigationStore } from './store/useNavigationStore';
import { useAuthStore } from './store/useAuthStore';

// Componentes Estructurales
import LoginScreen from './components/auth/LoginScreen';
import BottomNav from './components/layout/BottomNav';
import Header from './components/layout/Header';

// Componentes de UI
import InventoryList from './components/inventario/InventoryList';
import InventoryDetail from './components/inventario/InventoryDetail';
import PurchaseList from './components/compras/PurchaseList';
import PurchaseDetail from './components/compras/PurchaseDetail';
import SaleList from './components/ventas/SaleList';
import SaleDetail from './components/ventas/SaleDetail';
import RepairList from './components/reparaciones/RepairList';
import RepairDetail from './components/reparaciones/RepairDetail';
import LogList from './components/bitacora/LogList';

const queryClient = new QueryClient();

export default function App() {
  const { 
    moduloActual, 
    menuAbierto, 
    vistaActual, 
    itemSeleccionado 
  } = useNavigationStore();

  const isAuthenticated = useAuthStore(state => state.isAuthenticated);

  // --------------------------------------------------------
  // ORQUESTADOR CENTRAL
  // --------------------------------------------------------
  const getContenido = () => {
    if (vistaActual === 'detalle') return <InventoryDetail item={itemSeleccionado} />;
    if (vistaActual === 'detalle_venta') return <SaleDetail item={itemSeleccionado} />;
    if (vistaActual === 'detalle_compra') return <PurchaseDetail item={itemSeleccionado} />;
    if (vistaActual === 'detalle_reparacion') return <RepairDetail item={itemSeleccionado} />;

    // Módulos Principales
    switch (moduloActual) {
      case 'inventario': return <InventoryList />;
      case 'compras': return <PurchaseList />;
      case 'ventas': return <SaleList />;
      case 'reparaciones': return <RepairList />;
      case 'bitacora': return <LogList />;
      default: return <InventoryList />;
    }
  };

  const titulos = {
    inventario: 'Gestión de Inventario',
    compras: 'Historial de Compras',
    ventas: 'Registro de Ventas',
    reparaciones: 'Servicio Técnico',
    bitacora: 'Bitácora de Sistema'
  };

  if (!isAuthenticated) {
    return (
      <SafeAreaProvider>
        <SafeAreaView style={styles.safeArea}>
          <StatusBar style="dark" />
          <LoginScreen />
        </SafeAreaView>
      </SafeAreaProvider>
    );
  }

  return (
    <QueryClientProvider client={queryClient}>
      <SafeAreaProvider>
        <SafeAreaView style={styles.safeArea}>
          <StatusBar style="dark" />
          <Header titulo={titulos[moduloActual as keyof typeof titulos]} />
          
          <View style={styles.content}>
            {getContenido()}
          </View>
          
          <BottomNav />
        </SafeAreaView>
      </SafeAreaProvider>
    </QueryClientProvider>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: COLORS.background },
  content: { flex: 1 }
});