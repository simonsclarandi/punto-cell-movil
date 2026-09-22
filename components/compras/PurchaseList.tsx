import React from 'react';
import { View, FlatList, ActivityIndicator, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { useInfiniteQuery } from '@tanstack/react-query';
import { COLORS } from '../../constants/theme';
import PurchaseCard, { PurchaseCardProps } from './PurchaseCard';
import { useNavigationStore } from '../../store/useNavigationStore';
import apiClient from '../../api/client'; // <-- Asegurate de que la ruta del import sea correcta

interface FetchComprasResponse {
  data: PurchaseCardProps[];
  nextPage: number | null;
}

const fetchCompras = async ({ pageParam = 1 }: { pageParam?: number }): Promise<FetchComprasResponse> => {
  try {
    const limit = 15;
    // Hacemos el GET a la ruta que declaraste en compras.routes.js
    const response = await apiClient.get('/compras/compras', {
      params: { 
        page: pageParam, 
        limit: limit 
      }
    });
    
    const comprasBase = response.data.data;

    const comprasMapeadas = comprasBase.map((item: any) => {
      // Determinamos el string de condición según el EstadoPago del backend
      let condicionTexto = 'Pendiente';
      if (item.EstadoPago === 2) condicionTexto = 'Pago Parcial';
      if (item.EstadoPago === 3) condicionTexto = 'Pagado';

      return {
        id: item.Id,
        // Usamos la Fecha de tu modelo, o un fallback
        fecha: item.Fecha ? item.Fecha.split('T')[0] : '', 
        // El Proveedor se hidrata en tu getById del service, asumimos que el getAll también lo hace.
        // Si no viene como objeto, mostramos el ID temporalmente
        proveedor: item.proveedor ? item.proveedor.Nombre : `Proveedor #${item.IdProveedor}`,
        total: parseFloat(item.TotalCosto) || 0,
        saldo: parseFloat(item.SaldoPendiente) || 0,
        estadoPago: item.EstadoPago || 1,
        condicion: condicionTexto
      };
    });

    return {
      data: comprasMapeadas,
      // Si recibimos la cantidad máxima pedida, asumimos que hay otra página.
      nextPage: comprasBase.length === limit ? pageParam + 1 : null,
    };
  } catch (error) {
    console.error("Error al traer el historial de compras:", error);
    throw error;
  }
};

export default function PurchaseList() {
  const setItemSeleccionado = useNavigationStore(state => state.setItemSeleccionado);
  const setVistaActual = useNavigationStore(state => state.setVistaActual);

  const { data, isLoading, isError, fetchNextPage, hasNextPage, isFetchingNextPage } = useInfiniteQuery({
    queryKey: ['compras'],
    queryFn: fetchCompras, // <-- Usamos la nueva función
    getNextPageParam: (lastPage) => lastPage.nextPage,
    initialPageParam: 1,  // <-- Arrancamos desde la página 1
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