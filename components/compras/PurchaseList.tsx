import React, { useState } from 'react';
import { View, FlatList, ActivityIndicator, Text, StyleSheet, TouchableOpacity, TextInput, Switch, RefreshControl } from 'react-native';
import { useInfiniteQuery } from '@tanstack/react-query';
import { COLORS, TYPOGRAPHY, SPACING, SHADOWS } from '../../constants/theme';
import PurchaseCard, { PurchaseCardProps } from './PurchaseCard';
import { useNavigationStore } from '../../store/useNavigationStore';
import apiClient from '../../api/client';

interface FetchComprasResponse {
  data: PurchaseCardProps[];
  nextPage: number | null;
}

const fetchCompras = async ({ pageParam = 1 }: { pageParam?: number }): Promise<FetchComprasResponse> => {
  try {
    const limit = 15;
    const response = await apiClient.get('/compras/compras', {
      params: { 
        page: pageParam, 
        limit: limit 
      }
    });
    
    const comprasBase = response.data.data;

    const comprasMapeadas = comprasBase.map((item: any) => {
      let condicionTexto = 'Pendiente';
      if (item.EstadoPago === 2) condicionTexto = 'Pago Parcial';
      if (item.EstadoPago === 3) condicionTexto = 'Pagado';

      return {
        id: item.Id,
        fecha: item.Fecha ? item.Fecha.split('T')[0] : '', 
        proveedor: item.proveedor ? item.proveedor.Nombre : `Proveedor #${item.IdProveedor}`,
        total: parseFloat(item.TotalCosto) || 0,
        saldo: parseFloat(item.SaldoPendiente) || 0,
        estadoPago: item.EstadoPago || 1,
        condicion: condicionTexto
      };
    });

    return {
      data: comprasMapeadas,
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
        <Text style={{ color: COLORS.error, fontWeight: 'bold' }}>Error al cargar los datos.</Text>
        <TouchableOpacity onPress={() => refetch()} style={{ marginTop: 12, padding: 10, backgroundColor: COLORS.primaryLight, borderRadius: SPACING.smallRadius }}>
          <Text style={{ color: COLORS.primary, fontWeight: 'bold' }}>Reintentar</Text>
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
              setVistaActual('detalle_compra');
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