import React from 'react';
import { View, FlatList, ActivityIndicator, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { useInfiniteQuery } from '@tanstack/react-query';
import { COLORS } from '../../constants/theme';
import SaleCard, { SaleItem } from './SaleCard';
import { useNavigationStore } from '../../store/useNavigationStore';
import apiClient from '../../api/client';

interface FetchSalesResponse {
  data: SaleItem[];
  nextPage: number | null;
}

const fetchVentas = async ({ pageParam = 1 }: { pageParam?: number }): Promise<FetchSalesResponse> => {
  try {
    const limit = 15;
    // Pegamos a la ruta raíz del módulo de ventas, enviando los parámetros paginados
    const response = await apiClient.get('/ventas', {
      params: { 
        page: pageParam, 
        limit: limit 
      }
    });
    
    const ventasBase = response.data.data;

    const ventasMapeadas = ventasBase.map((item: any) => ({
      id: item.Id,
      // La base de datos devuelve la fecha en formato ISO, la dejamos limpia
      fecha: item.Fecha ? item.Fecha.replace('T', ' ').substring(0, 16) : '',
      
      // Armamos el nombre del cliente y del empleado asegurándonos de que existan
      cliente: item.cliente ? `${item.cliente.Nombre} ${item.cliente.Apellido || ''}`.trim() : 'Consumidor Final',
      vendedor: item.empleado ? item.empleado.Nombre : 'Vendedor Desconocido',
      
      // La columna en tu BD se llama TotalVenta
      total: parseFloat(item.TotalVenta) || 0,
      
      // EstadoPago es un BOOLEAN en tu BD (true = pagado)
      estadoPago: item.EstadoPago === true,
      
      // En este listado general podemos dejar el detalle vacío, 
      // lo pediremos completo en el SaleDetail.tsx con el getById
      detalle: [] 
    }));

    return {
      data: ventasMapeadas,
      nextPage: ventasBase.length === limit ? pageParam + 1 : null,
    };
  } catch (error) {
    console.error("Error al traer el historial de ventas:", error);
    throw error;
  }
};

export default function SaleList() {
  const setItemSeleccionado = useNavigationStore(state => state.setItemSeleccionado);
  const setVistaActual = useNavigationStore(state => state.setVistaActual);

  const { data, isLoading, isError, fetchNextPage, hasNextPage, isFetchingNextPage } = useInfiniteQuery({
    queryKey: ['ventas'],
    queryFn: fetchVentas,
    getNextPageParam: (lastPage) => lastPage.nextPage,
    initialPageParam: 1,
  });

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
              detalle={item.detalle}
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