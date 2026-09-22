import React from 'react';
import { View, FlatList, ActivityIndicator, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { useInfiniteQuery } from '@tanstack/react-query';
import { COLORS } from '../../constants/theme';
import RepairCard, { RepairItem } from './RepairCard';
import { useNavigationStore } from '../../store/useNavigationStore';
import apiClient from '../../api/client';

interface FetchRepairsResponse {
  data: RepairItem[];
  nextPage: number | null;
}

const fetchReparaciones = async ({ pageParam = 1 }: { pageParam?: number }): Promise<FetchRepairsResponse> => {
  try {
    const limit = 15; // Un límite más alto evita el bucle de onEndReached
    const response = await apiClient.get('/reparaciones/ordenes-reparacion', {
      params: { page: pageParam, limit: limit } 
    });
    
    const payload = response.data.data;
    const reparacionesBase = Array.isArray(payload) ? payload : (payload.data || payload.rows || []);

    const reparacionesMapeadas = reparacionesBase.map((item: any) => ({
      id: item.Id,
      fecha: item.FechaEmision ? item.FechaEmision.split('T')[0] : '',
      // Ahora el backend sí nos va a mandar el cliente
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

export default function RepairList() {
  const setItemSeleccionado = useNavigationStore(state => state.setItemSeleccionado);
  const setVistaActual = useNavigationStore(state => state.setVistaActual);

  const { data, isLoading, isError, fetchNextPage, hasNextPage, isFetchingNextPage } = useInfiniteQuery({
    queryKey: ['reparaciones'],
    queryFn: fetchReparaciones,
    getNextPageParam: (lastPage) => lastPage.nextPage,
    initialPageParam: 1,
  });

  const reparacionesAll = data?.pages.flatMap(page => page.data) || [];

  if (isLoading) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color={COLORS.primary} />
        <Text style={styles.loadingText}>Cargando órdenes...</Text>
      </View>
    );
  }

  if (isError) return <View style={styles.centerContainer}><Text style={{ color: COLORS.error }}>Error al cargar los datos.</Text></View>;

  const activas = reparacionesAll.filter(r => r.estado !== 'entregado' && r.estado !== 'cancelado').length;
  const terminados = reparacionesAll.filter(r => r.estado === 'terminado' || r.estado === 'para entregar').length;

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
      <FlatList
        data={reparacionesAll}
        keyExtractor={(item) => item.id.toString()}
        contentContainerStyle={{ padding: 16, paddingBottom: 40 }}
        ListHeaderComponent={renderHeader} 
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
        onEndReached={() => { if (hasNextPage && !isFetchingNextPage) fetchNextPage(); }}
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
  loadingText: { marginTop: 10, color: COLORS.textSecondary, fontWeight: 'bold' },
  kpiContainer: { flexDirection: 'row', gap: 12, marginBottom: 16 },
  kpiCard: { flex: 1, backgroundColor: COLORS.paper, padding: 12, borderRadius: 8, borderWidth: 1 },
  kpiLabel: { fontSize: 10, color: COLORS.textSecondary, fontWeight: 'bold', textTransform: 'uppercase' },
  kpiValue: { fontSize: 18, fontWeight: 'bold' }
});