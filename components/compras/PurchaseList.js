import React from 'react';
import { View, FlatList, ActivityIndicator, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { useInfiniteQuery } from '@tanstack/react-query';
import { COLORS } from '../../constants/theme';
import PurchaseCard from './PurchaseCard';
import { useNavigationStore } from '../../store/useNavigationStore';

// Datos mockeados de base de datos
const mockComprasDB = Array.from({ length: 20 }).map((_, i) => ({
  id: 1000 + i,
  fecha: `2026-09-0${(i % 9) + 1}`,
  proveedor: i % 2 === 0 ? 'Distribuidora Apple AR' : 'Samsung Mayorista',
  total: 3000 + (i * 150),
  saldo: i % 3 === 0 ? 0 : 1500,
  estadoPago: i % 3 === 0 ? 3 : 2,
  condicion: i % 3 === 0 ? 'Pagado' : 'Pago Parcial'
}));

const fetchComprasMock = async ({ pageParam = 0 }) => {
  await new Promise(resolve => setTimeout(resolve, 1000)); // Simula red
  const limit = 8;
  const start = pageParam * limit;
  const end = start + limit;
  
  return {
    data: mockComprasDB.slice(start, end),
    nextPage: end < mockComprasDB.length ? pageParam + 1 : null,
  };
};

export default function PurchaseList() {
  const setItemSeleccionado = useNavigationStore(state => state.setItemSeleccionado);
  const setVistaActual = useNavigationStore(state => state.setVistaActual);

  const { data, isLoading, isError, fetchNextPage, hasNextPage, isFetchingNextPage } = useInfiniteQuery({
    queryKey: ['compras'],
    queryFn: fetchComprasMock,
    getNextPageParam: (lastPage) => lastPage.nextPage,
  });

  const comprasAll = data?.pages.flatMap(page => page.data) || [];

  if (isLoading) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color={COLORS.primary} />
        <Text style={styles.loadingText}>Cargando historial de compras...</Text>
      </View>
    );
  }

  if (isError) return <View style={styles.centerContainer}><Text style={{ color: COLORS.error }}>Error al cargar los datos.</Text></View>;

  return (
    <View style={styles.container}>
      <FlatList
        data={comprasAll}
        keyExtractor={(item) => item.id.toString()}
        contentContainerStyle={{ padding: 16, paddingBottom: 40 }}
        renderItem={({ item }) => (
          <TouchableOpacity 
            activeOpacity={0.7} 
            onPress={() => {
              setItemSeleccionado(item);
              setVistaActual('detalle_compra');
            }}
          >
            <PurchaseCard 
              id={item.id} fecha={item.fecha} proveedor={item.proveedor} 
              total={item.total} saldo={item.saldo} condicion={item.condicion} estadoPago={item.estadoPago} 
            />
          </TouchableOpacity>
        )}
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