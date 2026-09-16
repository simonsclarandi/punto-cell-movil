import React from 'react';
import { View, FlatList, ActivityIndicator, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { useInfiniteQuery } from '@tanstack/react-query';
import { COLORS } from '../../constants/theme';
import SaleCard from './SaleCard';
import { useNavigationStore } from '../../store/useNavigationStore';

// Simulamos una base de datos grande y el delay de una API real
const mockVentasDB = Array.from({ length: 25 }).map((_, i) => ({
  id: 2000 + i,
  fecha: `2026-09-04 10:${String(i).padStart(2, '0')}`,
  cliente: `Cliente ${i + 1}`,
  vendedor: i % 2 === 0 ? 'Carlos' : 'Ana',
  total: 500 + (i * 10),
  estadoPago: i % 3 !== 0,
  detalle: [{ nombre: 'Producto Genérico', cantidad: 1, subtotal: 500 + (i * 10) }]
}));

const fetchVentasMock = async ({ pageParam = 0 }) => {
  await new Promise(resolve => setTimeout(resolve, 1200)); // Delay simulado
  const limit = 7;
  const start = pageParam * limit;
  const end = start + limit;
  
  return {
    data: mockVentasDB.slice(start, end),
    nextPage: end < mockVentasDB.length ? pageParam + 1 : null,
  };
};

export default function SaleList() {
  const setItemSeleccionado = useNavigationStore(state => state.setItemSeleccionado);
  const setVistaActual = useNavigationStore(state => state.setVistaActual);

  // Implementación de TanStack Query para Scroll Infinito
  const { data, isLoading, isError, fetchNextPage, hasNextPage, isFetchingNextPage } = useInfiniteQuery({
    queryKey: ['ventas'],
    queryFn: fetchVentasMock,
    getNextPageParam: (lastPage) => lastPage.nextPage,
  });

  // Aplanamos el arreglo de páginas que devuelve TanStack
  const ventasAll = data?.pages.flatMap(page => page.data) || [];

  if (isLoading) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color={COLORS.primary} />
        <Text style={styles.loadingText}>Cargando historial de ventas...</Text>
      </View>
    );
  }

  if (isError) return <View style={styles.centerContainer}><Text style={{ color: COLORS.error }}>Error al cargar los datos.</Text></View>;

  return (
    <View style={styles.container}>
      <FlatList
        data={ventasAll}
        keyExtractor={(item) => item.id.toString()}
        contentContainerStyle={{ padding: 16, paddingBottom: 40 }}
        renderItem={({ item }) => (
          <TouchableOpacity 
            activeOpacity={0.7} 
            onPress={() => {
              setItemSeleccionado(item);
              setVistaActual('detalle_venta');
            }}
          >
            <SaleCard 
              id={item.id} fecha={item.fecha} cliente={item.cliente} 
              vendedor={item.vendedor} total={item.total} estadoPago={item.estadoPago} 
            />
          </TouchableOpacity>
        )}
        // Props clave para el scroll infinito
        onEndReached={() => { if (hasNextPage) fetchNextPage(); }}
        onEndReachedThreshold={0.5} 
        ListFooterComponent={
          isFetchingNextPage ? <ActivityIndicator size="small" color={COLORS.primary} style={{ marginVertical: 16 }} /> : null
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  centerContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  loadingText: { marginTop: 10, color: COLORS.textSecondary, fontWeight: 'bold' }
});