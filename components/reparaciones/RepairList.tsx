import React, { useState } from 'react';
import { View, FlatList, ActivityIndicator, Text, StyleSheet, TouchableOpacity, TextInput, RefreshControl, ScrollView } from 'react-native';
import { useInfiniteQuery } from '@tanstack/react-query';
import { COLORS, TYPOGRAPHY, SPACING, SHADOWS } from '../../constants/theme';
import RepairCard, { RepairItem } from './RepairCard';
import { useNavigationStore } from '../../store/useNavigationStore';
import apiClient from '../../api/client';

interface FetchRepairsResponse {
  data: RepairItem[];
  nextPage: number | null;
}

const fetchReparaciones = async ({ pageParam = 1 }: { pageParam?: number }): Promise<FetchRepairsResponse> => {
  try {
    const limit = 15;
    const response = await apiClient.get('/reparaciones/ordenes-reparacion', {
      params: { page: pageParam, limit: limit } 
    });
    
    const payload = response.data.data;
    const reparacionesBase = Array.isArray(payload) ? payload : (payload.data || payload.rows || []);

    const reparacionesMapeadas = reparacionesBase.map((item: any) => ({
      id: item.Id,
      fecha: item.FechaEmision ? item.FechaEmision.split('T')[0] : '',
      cliente: item.dispositivo?.cliente 
        ? `${item.dispositivo.cliente.Nombre} ${item.dispositivo.cliente.Apellido}`.trim() 
        : 'Cliente Desconocido',
      dispositivo: item.dispositivo?.modelo?.Nombre || 'Dispositivo en revisión',
      falla: item.FallaReportada || 'Revisión técnica',
      estado: item.estado ? item.estado.Nombre.toLowerCase() : 'pendiente',
    }));

    return {
      data: reparacionesMapeadas,
      nextPage: reparacionesBase.length >= limit ? pageParam + 1 : null,
    };
  } catch (error) {
    console.error("Error al traer reparaciones:", error);
    throw error;
  }
};

type FiltroEstado = 'activas' | 'en espera' | 'en reparación' | 'terminado' | 'entregado' | 'anulado' | 'todas';

const FILTROS_ESTADO: { value: FiltroEstado, label: string }[] = [
  { value: 'activas', label: 'Activas' },
  { value: 'en espera', label: 'Espera' },
  { value: 'en reparación', label: 'Reparación' },
  { value: 'terminado', label: 'Terminado' },
  { value: 'entregado', label: 'Entregado' },
  { value: 'anulado', label: 'Anulada' },
  { value: 'todas', label: 'Todas' },
];

export default function RepairList() {
  const setItemSeleccionado = useNavigationStore(state => state.setItemSeleccionado);
  const setVistaActual = useNavigationStore(state => state.setVistaActual);

  const [busqueda, setBusqueda] = useState('');
  const [filtroEstado, setFiltroEstado] = useState<FiltroEstado>('activas');

  const { data, isLoading, isError, fetchNextPage, hasNextPage, isFetchingNextPage, refetch, isRefetching } = useInfiniteQuery({
    queryKey: ['reparaciones'],
    queryFn: fetchReparaciones,
    getNextPageParam: (lastPage) => lastPage.nextPage,
    initialPageParam: 1,
  });

  const reparacionesAll = data?.pages.flatMap(page => page.data) || [];

  const reparacionesFiltradas = reparacionesAll.filter(item => {
    const texto = busqueda.toLowerCase();
    const coincideBusqueda = 
      item.cliente.toLowerCase().includes(texto) ||
      item.dispositivo.toLowerCase().includes(texto) ||
      item.id.toString().includes(texto) ||
      item.falla.toLowerCase().includes(texto);
      
    let coincideEstado = true;
    if (filtroEstado === 'activas') {
      coincideEstado = !['entregado', 'anulado', 'cancelado'].includes(item.estado);
    } else if (filtroEstado !== 'todas') {
      coincideEstado = item.estado === filtroEstado;
    }
    
    return coincideBusqueda && coincideEstado;
  });

  const activas = reparacionesAll.filter(r => !['entregado', 'anulado', 'cancelado'].includes(r.estado)).length;
  const terminados = reparacionesAll.filter(r => r.estado === 'terminado' || r.estado === 'para entregar').length;

  if (isLoading) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color={COLORS.primary} />
        <Text style={styles.loadingText}>Cargando órdenes...</Text>
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

  const renderHeader = () => (
    <View style={styles.kpiContainer}>
      <View style={[styles.kpiCard, { borderColor: COLORS.divider }]}>
        <Text style={styles.kpiLabel}>Órdenes Activas</Text>
        <Text style={[styles.kpiValue, { color: COLORS.textPrimary }]}>{activas}</Text>
      </View>
      <View style={[styles.kpiCard, { borderColor: COLORS.warning }]}>
        <Text style={styles.kpiLabel}>Para Entregar</Text>
        <Text style={[styles.kpiValue, { color: COLORS.warning }]}>{terminados} equipos</Text>
      </View>
    </View>
  );

  return (
    <View style={styles.container}>
      
      <View style={styles.filterContainer}>
        <TextInput
          style={styles.searchInput}
          placeholder="Buscar cliente, dispositivo, # orden..."
          placeholderTextColor={COLORS.textDisabled}
          value={busqueda}
          onChangeText={setBusqueda}
        />
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.tabsContainer}>
          {FILTROS_ESTADO.map((tab) => (
            <TouchableOpacity 
              key={tab.value} 
              style={[styles.tab, filtroEstado === tab.value && styles.tabActive]}
              onPress={() => setFiltroEstado(tab.value)}
            >
              <Text style={[styles.tabText, filtroEstado === tab.value && styles.tabTextActive]}>
                {tab.label}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      <FlatList
        data={reparacionesFiltradas}
        keyExtractor={(item) => item.id.toString()}
        contentContainerStyle={{ padding: 16, paddingBottom: 40 }}
        ListHeaderComponent={renderHeader} 
        ListEmptyComponent={
          <Text style={styles.emptyText}>No se encontraron reparaciones con estos filtros.</Text>
        }
        renderItem={({ item }) => (
          <TouchableOpacity 
            activeOpacity={0.7} 
            onPress={() => {
              setItemSeleccionado(item);
              setVistaActual('detalle_reparacion');
            }}
          >
            <RepairCard 
              id={item.id} fecha={item.fecha} cliente={item.cliente} 
              dispositivo={item.dispositivo} falla={item.falla} estado={item.estado} 
            />
          </TouchableOpacity>
        )}
        onEndReached={() => { if (hasNextPage && !busqueda && filtroEstado === 'todas') fetchNextPage(); }}
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
  kpiContainer: { flexDirection: 'row', gap: 12, marginBottom: 16 },
  kpiCard: { flex: 1, backgroundColor: COLORS.paper, padding: 12, borderRadius: 8, borderWidth: 1 },
  kpiLabel: { fontSize: 10, color: COLORS.textSecondary, fontWeight: 'bold', textTransform: 'uppercase' },
  kpiValue: { fontSize: 18, fontWeight: 'bold' },
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
  tabsContainer: {
    flexDirection: 'row',
    gap: 8,
    paddingRight: 16, 
  },
  tab: {
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: COLORS.divider,
    backgroundColor: COLORS.surfaceMuted,
  },
  tabActive: {
    backgroundColor: COLORS.primaryLight,
    borderColor: COLORS.primary,
  },
  tabText: {
    fontSize: 12,
    color: COLORS.textSecondary,
    fontWeight: 'bold',
  },
  tabTextActive: {
    color: COLORS.primary,
  },
  emptyText: {
    textAlign: 'center',
    color: COLORS.textDisabled,
    marginTop: 20,
    fontSize: 14,
  }
});