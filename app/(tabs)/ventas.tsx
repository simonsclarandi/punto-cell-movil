import React, { useState } from 'react';
import { View, FlatList, ActivityIndicator, Text, StyleSheet, TouchableOpacity, TextInput, Switch, RefreshControl } from 'react-native';
import { useInfiniteQuery } from '@tanstack/react-query';
import { COLORS, SPACING, SHADOWS } from '../../constants/theme';
import SaleCard, { SaleItem } from '../../components/ventas/SaleCard';
import { useNavigationStore } from '../../store/useNavigationStore';
import apiClient from '../../api/client';
import { router } from 'expo-router';

interface FetchSalesResponse {
  data: SaleItem[];
  nextPage: number | null;
}

const fetchVentas = async ({ pageParam = 1 }: { pageParam?: number }): Promise<FetchSalesResponse> => {
  try {
    const limit = 15;
    // Usamos /ventas/historico porque es el endpoint que incluye las relaciones cliente y empleado
    const response = await apiClient.get('/ventas/historico');
    
    const ventasBase: any[] = response.data?.data || [];

    const ventasMapeadas: SaleItem[] = ventasBase.map((item: any) => ({
      id: item.Id,
      fecha: item.Fecha ? item.Fecha.replace('T', ' ').substring(0, 16) : '',
      cliente: item.cliente ? `${item.cliente.Nombre} ${item.cliente.Apellido || ''}`.trim() : 'Consumidor Final',
      vendedor: item.empleado ? `${item.empleado.Nombre} ${item.empleado.Apellido || ''}`.trim() : 'Vendedor Desconocido',
      total: parseFloat(item.TotalVenta) || 0,
      estadoPago: item.EstadoPago === true,
      detalle: (item.detalles || []).map((d: any) => ({
        nombre: d.inventario?.articulo?.Nombre || 'Artículo',
        cantidad: d.Cantidad,
        subtotal: Number(d.Cantidad) * Number(d.PrecioUnitario)
      }))
    }));

    // Paginación en cliente ya que el endpoint devuelve el histórico completo
    const startIndex = (pageParam - 1) * limit;
    const paginatedData = ventasMapeadas.slice(startIndex, startIndex + limit);

    return {
      data: paginatedData,
      nextPage: startIndex + limit < ventasMapeadas.length ? pageParam + 1 : null,
    };
  } catch (error) {
    console.error('[Ventas] Error al traer el historial de ventas:', error);
    throw error;
  }
};

export default function SaleList() {
  const setItemSeleccionado = useNavigationStore(state => state.setItemSeleccionado);

  const [busqueda, setBusqueda] = useState('');
  const [soloPendientes, setSoloPendientes] = useState(false);

  const { data, isLoading, isError, fetchNextPage, hasNextPage, isFetchingNextPage, refetch, isRefetching } = useInfiniteQuery({
    queryKey: ['ventas'],
    queryFn: fetchVentas,
    getNextPageParam: (lastPage) => lastPage.nextPage,
    initialPageParam: 1,
  });

  const ventasAll = data?.pages.flatMap(page => page.data) || [];

  const ventasFiltradas = ventasAll.filter(item => {
    const texto = busqueda.toLowerCase();
    const coincideBusqueda = 
      item.cliente.toLowerCase().includes(texto) ||
      item.vendedor.toLowerCase().includes(texto) ||
      item.id.toString().includes(texto);
      
    const coincideEstado = soloPendientes ? item.estadoPago === false : true;
    
    return coincideBusqueda && coincideEstado;
  });

  if (isLoading) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color={COLORS.primary} />
        <Text style={styles.loadingText}>Cargando historial de ventas...</Text>
      </View>
    );
  }

  if (isError) {
    return (
      <View style={styles.centerContainer}>
        <Text style={{ color: COLORS.error, fontWeight: 'bold' }}>Error al cargar las ventas.</Text>
        <TouchableOpacity onPress={() => refetch()} style={styles.retryButton}>
          <Text style={styles.retryText}>Reintentar</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Barra de Filtros */}
      <View style={styles.filterContainer}>
        <TextInput
          style={styles.searchInput}
          placeholder="Buscar cliente, vendedor o # ticket..."
          placeholderTextColor={COLORS.textDisabled}
          value={busqueda}
          onChangeText={setBusqueda}
        />
        <View style={styles.switchesContainer}>
          <View style={styles.switchRow}>
            <Switch 
              value={soloPendientes} 
              onValueChange={setSoloPendientes}
              trackColor={{ false: COLORS.divider, true: COLORS.warning }}
              thumbColor={soloPendientes ? '#FFFFFF' : COLORS.textDisabled}
            />
            <Text style={[styles.switchLabel, soloPendientes && { color: COLORS.warning, fontWeight: 'bold' }]}>
              Mostrar solo pendientes de cobro
            </Text>
          </View>
        </View>
      </View>

      <FlatList
        data={ventasFiltradas}
        keyExtractor={(item) => item.id.toString()}
        contentContainerStyle={{ padding: 16, paddingBottom: 40 }}
        ListEmptyComponent={
          <Text style={styles.emptyText}>No se encontraron ventas con estos filtros.</Text>
        }
        renderItem={({ item }) => (
          <TouchableOpacity 
            activeOpacity={0.7} 
            onPress={() => {
              setItemSeleccionado(item);
              router.push(`/detalle/venta/${item.id}`);
            }}
          >
            <SaleCard 
              id={item.id} fecha={item.fecha} cliente={item.cliente} 
              vendedor={item.vendedor} total={item.total} estadoPago={item.estadoPago} 
              detalle={item.detalle}
            />
          </TouchableOpacity>
        )}
        onEndReached={() => { if (hasNextPage && !busqueda && !soloPendientes) fetchNextPage(); }}
        onEndReachedThreshold={0.5} 
        refreshControl={
          <RefreshControl 
            refreshing={isRefetching} 
            onRefresh={refetch}
            colors={[COLORS.primary]} 
            tintColor={COLORS.primary} 
          />
        }
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
  loadingText: { marginTop: 10, color: COLORS.textSecondary, fontWeight: 'bold' },
  retryButton: { marginTop: 12, padding: 10, backgroundColor: COLORS.primaryLight, borderRadius: SPACING.smallRadius },
  retryText: { color: COLORS.primary, fontWeight: 'bold' },
  filterContainer: {
    backgroundColor: COLORS.paper,
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.divider,
    ...SHADOWS.lift,
  },
  searchInput: {
    backgroundColor: COLORS.surfaceMuted,
    borderRadius: SPACING.smallRadius,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 14,
    color: COLORS.textPrimary,
    borderWidth: 1,
    borderColor: COLORS.divider,
    marginBottom: 12,
  },
  switchesContainer: {
    flexDirection: 'row',
    justifyContent: 'flex-start',
  },
  switchRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  switchLabel: {
    fontSize: 12,
    color: COLORS.textSecondary,
  },
  emptyText: {
    textAlign: 'center',
    color: COLORS.textDisabled,
    marginTop: 20,
    fontSize: 14,
  }
});
