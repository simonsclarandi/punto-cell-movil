import React, { useState } from 'react';
import { View, FlatList, ActivityIndicator, Text, StyleSheet, TouchableOpacity, TextInput, Switch, RefreshControl } from 'react-native';
import { useInfiniteQuery } from '@tanstack/react-query';
import { COLORS, SPACING, SHADOWS } from '../../constants/theme';
import PurchaseCard, { PurchaseCardProps } from '../../components/compras/PurchaseCard';
import { useNavigationStore } from '../../store/useNavigationStore';
import apiClient from '../../api/client';
import { router } from 'expo-router';

interface FetchComprasResponse {
  data: PurchaseCardProps[];
  nextPage: number | null;
}

const fetchCompras = async ({ pageParam = 1 }: { pageParam?: number }): Promise<FetchComprasResponse> => {
  try {
    const limit = 15;
    // Traemos compras y proveedores en paralelo para mapear los nombres (sin parámetros de paginación conflictivos con SQL Server)
    const [resCompras, resProveedores] = await Promise.all([
      apiClient.get('/compras/compras'),
      apiClient.get('/compras/proveedores').catch(() => ({ data: { data: [] } }))
    ]);
    
    const proveedores: any[] = resProveedores.data?.data || [];
    const provMap: Record<number, string> = {};
    proveedores.forEach((p) => {
      provMap[p.Id] = p.Nombre;
    });

    const comprasBase: any[] = resCompras.data?.data || [];

    const comprasMapeadas = comprasBase.map((item: any) => {
      let condicionTexto = 'Pendiente';
      if (item.EstadoPago === 2) condicionTexto = 'Pago Parcial';
      if (item.EstadoPago === 3) condicionTexto = 'Pagado';

      const nombreProveedor = item.proveedor?.Nombre || provMap[item.IdProveedor] || `Proveedor #${item.IdProveedor}`;

      return {
        id: item.Id,
        fecha: item.Fecha ? item.Fecha.split('T')[0] : '', 
        proveedor: nombreProveedor,
        total: parseFloat(item.TotalCosto) || 0,
        saldo: parseFloat(item.SaldoPendiente) || 0,
        estadoPago: item.EstadoPago || 1,
        condicion: condicionTexto
      };
    });

    // Paginación en cliente para renderizado suave
    const startIndex = (pageParam - 1) * limit;
    const paginatedData = comprasMapeadas.slice(startIndex, startIndex + limit);

    return {
      data: paginatedData,
      nextPage: startIndex + limit < comprasMapeadas.length ? pageParam + 1 : null,
    };
  } catch (error) {
    console.error('[Compras] Error al traer el historial de compras:', error);
    throw error;
  }
};

export default function PurchaseList() {
  const setItemSeleccionado = useNavigationStore(state => state.setItemSeleccionado);

  const [busqueda, setBusqueda] = useState('');
  const [soloDeudas, setSoloDeudas] = useState(false);

  const { data, isLoading, isError, fetchNextPage, hasNextPage, isFetchingNextPage, refetch, isRefetching } = useInfiniteQuery({
    queryKey: ['compras'],
    queryFn: fetchCompras,
    getNextPageParam: (lastPage) => lastPage.nextPage,
    initialPageParam: 1, 
  });

  const comprasAll = data?.pages.flatMap(page => page.data) || [];

  const comprasFiltradas = comprasAll.filter(item => {
    const texto = busqueda.toLowerCase();
    const coincideBusqueda = 
      item.proveedor.toLowerCase().includes(texto) ||
      item.id.toString().includes(texto);
    const coincideEstado = soloDeudas ? item.saldo > 0 : true;
    
    return coincideBusqueda && coincideEstado;
  });

  if (isLoading) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color={COLORS.primary} />
        <Text style={styles.loadingText}>Cargando historial de compras...</Text>
      </View>
    );
  }

  if (isError) {
    return (
      <View style={styles.centerContainer}>
        <Text style={{ color: COLORS.error, fontWeight: 'bold' }}>Error al cargar las compras.</Text>
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
          placeholder="Buscar proveedor o # factura..."
          placeholderTextColor={COLORS.textDisabled}
          value={busqueda}
          onChangeText={setBusqueda}
        />
        <View style={styles.switchesContainer}>
          <View style={styles.switchRow}>
            <Switch 
              value={soloDeudas} 
              onValueChange={setSoloDeudas}
              trackColor={{ false: COLORS.divider, true: COLORS.error }}
              thumbColor={soloDeudas ? '#FFFFFF' : COLORS.textDisabled}
            />
            <Text style={[styles.switchLabel, soloDeudas && { color: COLORS.error, fontWeight: 'bold' }]}>
              Mostrar solo cuentas por pagar
            </Text>
          </View>
        </View>
      </View>

      <FlatList
        data={comprasFiltradas}
        keyExtractor={(item) => item.id.toString()}
        contentContainerStyle={{ padding: 16, paddingBottom: 40 }}
        ListEmptyComponent={
          <Text style={styles.emptyText}>No se encontraron compras con estos filtros.</Text>
        }
        renderItem={({ item }) => (
          <TouchableOpacity 
            activeOpacity={0.7} 
            onPress={() => {
              setItemSeleccionado(item);
              router.push(`/detalle/compra/${item.id}`);
            }}
          >
            <PurchaseCard 
              id={item.id} fecha={item.fecha} proveedor={item.proveedor} 
              total={item.total} saldo={item.saldo} condicion={item.condicion} estadoPago={item.estadoPago} 
            />
          </TouchableOpacity>
        )}
        onEndReached={() => { if (hasNextPage && !busqueda && !soloDeudas) fetchNextPage(); }}
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
