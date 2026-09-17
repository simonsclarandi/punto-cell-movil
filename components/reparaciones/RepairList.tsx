import React from 'react';
import { View, FlatList, ActivityIndicator, Text, StyleSheet, TouchableOpacity, RefreshControl } from 'react-native';
import { useQuery } from '@tanstack/react-query';
import { COLORS } from '../../constants/theme';
import RepairCard, { RepairItem } from './RepairCard';
import { useNavigationStore } from '../../store/useNavigationStore';

const mockReparaciones: RepairItem[] = [
  { id: 3001, fecha: '2026-09-02', cliente: 'Martín Gómez', dispositivo: 'Samsung Galaxy A54', falla: 'Cambio de módulo (pantalla rota)', estado: 'en reparación' },
  { id: 3002, fecha: '2026-09-03', cliente: 'Lucía Fernández', dispositivo: 'iPhone 11', falla: 'Cambio de batería', estado: 'terminado' },
  { id: 3003, fecha: '2026-09-04', cliente: 'Diego Molina', dispositivo: 'Motorola G20', falla: 'Pin de carga no funciona', estado: 'en espera' },
];

const fetchReparaciones = async (): Promise<RepairItem[]> => {
  await new Promise(resolve => setTimeout(resolve, 800)); 
  return mockReparaciones;
};

export default function RepairList() {
  const setItemSeleccionado = useNavigationStore(state => state.setItemSeleccionado);
  const setVistaActual = useNavigationStore(state => state.setVistaActual);

  const { data, isLoading, isError, refetch, isRefetching } = useQuery({
    queryKey: ['reparaciones'],
    queryFn: fetchReparaciones,
  });

  if (isLoading) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color={COLORS.primary} />
        <Text style={styles.loadingText}>Cargando órdenes...</Text>
      </View>
    );
  }

  if (isError) return <View style={styles.centerContainer}><Text style={{ color: COLORS.error }}>Error al cargar los datos.</Text></View>;

  const activas = data?.length || 0;
  const terminados = data?.filter(r => r.estado === 'terminado').length || 0;

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
        data={data}
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
        refreshControl={
          <RefreshControl refreshing={isRefetching} onRefresh={refetch} colors={[COLORS.primary]} tintColor={COLORS.primary} />
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