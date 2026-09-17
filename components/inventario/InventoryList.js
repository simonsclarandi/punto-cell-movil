import React from 'react';
import { View, FlatList, ActivityIndicator, Text, StyleSheet, TouchableOpacity, RefreshControl } from 'react-native';
import { useQuery } from '@tanstack/react-query';
import { COLORS, TYPOGRAPHY, SPACING } from '../../constants/theme';
import InventoryCard from './InventoryCard';
import { useNavigationStore } from '../../store/useNavigationStore';

// Datos mockeados
const mockInventario = [
  { id: 1, producto: 'iPhone 13 Pro', modelo: '256GB', color: 'Gold', imei: '358940183901235', stock: 5, precioMenor: 850, imagen: 'https://images.fravega.com/f500/5d1b62e26c82f4e43a138564c40c7aee.jpg' },
  { id: 2, producto: 'Samsung Galaxy S23 Ultra', modelo: '128GB', color: 'Phantom Black', imei: '351294857392018', stock: 0, precioMenor: 700, imagen: 'https://http2.mlstatic.com/D_NQ_NP_620906-MLA96419961344_102025-O.webp' },
  { id: 3, producto: 'Motorola Edge 40', modelo: '256GB', color: 'Eclipse Black', imei: '351112223334445', stock: 2, precioMenor: 450, imagen: 'https://armoto.vtexassets.com/arquivos/ids/163628/Motorola-Edge-40-Black-1.png' },
  { id: 4, producto: 'Xiaomi Redmi Note 12', modelo: '128GB', color: 'Ice Blue', imei: '352223334445556', stock: 15, precioMenor: 220, imagen: 'https://i0.wp.com/www.wom.co/wp-content/uploads/2023/10/Redmi-Note-12-Blue-Front.png' },
];

const fetchInventario = async () => {
  await new Promise(resolve => setTimeout(resolve, 800)); 
  return mockInventario;
};

export default function InventoryList() {
  const setItemSeleccionado = useNavigationStore(state => state.setItemSeleccionado);
  const setVistaActual = useNavigationStore(state => state.setVistaActual);

  const { data, isLoading, isError, refetch, isRefetching } = useQuery({
    queryKey: ['inventario'],
    queryFn: fetchInventario,
  });

  if (isLoading) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color={COLORS.primary} />
        <Text style={styles.loadingText}>Cargando catálogo...</Text>
      </View>
    );
  }

  if (isError) {
    return (
      <View style={styles.centerContainer}>
        <Text style={{ color: COLORS.error }}>Error al cargar el inventario.</Text>
        <TouchableOpacity onPress={refetch} style={styles.retryButton}>
          <Text style={styles.retryText}>Reintentar</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <FlatList
        data={data}
        keyExtractor={(item) => item.id.toString()}
        contentContainerStyle={styles.listPadding}
        renderItem={({ item }) => (
          <TouchableOpacity 
            activeOpacity={0.7} 
            onPress={() => {
              setItemSeleccionado(item);
              setVistaActual('detalle');
            }}
          >
            <InventoryCard 
              producto={item.producto} modelo={item.modelo} 
              stock={item.stock} precio={item.precioMenor} imagen={item.imagen} 
            />
          </TouchableOpacity>
        )}
        refreshControl={
          <RefreshControl 
            refreshing={isRefetching} 
            onRefresh={refetch}
            colors={[COLORS.primary]} 
            tintColor={COLORS.primary} 
          />
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  centerContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  loadingText: { marginTop: 10, color: COLORS.textSecondary, fontWeight: 'bold' },
  retryButton: { marginTop: 12, padding: 10, backgroundColor: COLORS.primaryLight, borderRadius: SPACING.smallRadius },
  retryText: { color: COLORS.primary, fontWeight: 'bold' },
  listPadding: { padding: 16, paddingBottom: 40 },
});