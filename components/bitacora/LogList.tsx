import React from 'react';
import { View, FlatList, ActivityIndicator, Text, StyleSheet } from 'react-native';
import { useInfiniteQuery } from '@tanstack/react-query';
import { COLORS, TYPOGRAPHY, SPACING } from '../../constants/theme';
import LogCard, { LogCardProps } from './LogCard';

interface LogItem extends LogCardProps {
  id: number;
}

interface FetchLogsResponse {
  data: LogItem[];
  nextPage: number | null;
}

const mockBitacoraDB: LogItem[] = Array.from({ length: 40 }).map((_, i) => {
  const isError = i % 7 === 0;
  const isVenta = i % 3 === 0;
  
  let accion = 'Inició sesión';
  let detalle = 'Login exitoso desde dispositivo móvil.';
  let usuario = 'Carlos';
  
  if (isError) {
    accion = 'Acceso fallido';
    detalle = 'Intento de login con contraseña incorrecta repetidas veces.';
    usuario = 'Desconocido';
  } else if (isVenta) {
    accion = 'Venta registrada';
    detalle = `Ticket #${2000 + i} generado con éxito.`;
    usuario = 'Ana';
  }

  return {
    id: 4000 + i,
    fecha: `2026-09-16 11:${String(i % 60).padStart(2, '0')}:${String(i).padStart(2, '0')}`,
    sucursal: i % 2 === 0 ? 'Centro (Córdoba)' : 'Global',
    usuario: usuario,
    accion: accion,
    detalle: detalle,
    ip: `192.168.1.${10 + (i % 20)}`
  };
});

const fetchLogsMock = async ({ pageParam = 0 }: { pageParam?: number }): Promise<FetchLogsResponse> => {
  await new Promise(resolve => setTimeout(resolve, 1000)); 
  const limit = 8;
  const start = pageParam * limit;
  const end = start + limit;
  
  return {
    data: mockBitacoraDB.slice(start, end),
    nextPage: end < mockBitacoraDB.length ? pageParam + 1 : null,
  };
};

export default function LogList() {
  const { data, isLoading, isError, fetchNextPage, hasNextPage, isFetchingNextPage } = useInfiniteQuery({
    queryKey: ['auditoria'],
    queryFn: fetchLogsMock,
    getNextPageParam: (lastPage) => lastPage.nextPage,
    initialPageParam: 0,
  });

  const logsAll = data?.pages.flatMap(page => page.data) || [];
  const totalRegistros = logsAll.length;
  const accesosFallidos = logsAll.filter(l => l.accion.toLowerCase().includes('fallido')).length;

  if (isLoading) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color={COLORS.primary} />
        <Text style={styles.loadingText}>Cargando bitácora de seguridad...</Text>
      </View>
    );
  }

  if (isError) {
    return (
      <View style={styles.centerContainer}>
        <Text style={{ color: COLORS.error, fontWeight: 'bold' }}>Error al cargar los registros.</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.kpiContainer}>
        <View style={[styles.kpiCard, { borderColor: COLORS.divider }]}>
          <Text style={styles.kpiLabel}>Registros Cargados</Text>
          <Text style={styles.kpiValue}>{totalRegistros}</Text>
        </View>
        <View style={[styles.kpiCard, { borderColor: COLORS.error }]}>
          <Text style={styles.kpiLabel}>Accesos Fallidos</Text>
          <Text style={[styles.kpiValue, { color: COLORS.error }]}>{accesosFallidos}</Text>
        </View>
      </View>

      <FlatList
        data={logsAll}
        keyExtractor={(item) => item.id.toString()}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        renderItem={({ item }) => (
          <LogCard 
            fecha={item.fecha} sucursal={item.sucursal} 
            usuario={item.usuario} accion={item.accion} 
            detalle={item.detalle} ip={item.ip} 
          />
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
  container: { flex: 1, backgroundColor: COLORS.background, paddingHorizontal: 16 },
  centerContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  loadingText: { marginTop: 12, color: COLORS.textSecondary, fontWeight: 'bold' },
  kpiContainer: { flexDirection: 'row', gap: 12, marginBottom: 16, marginTop: 16 },
  kpiCard: { flex: 1, backgroundColor: COLORS.paper, padding: 12, borderRadius: SPACING.smallRadius, borderWidth: 1 },
  kpiLabel: { fontSize: TYPOGRAPHY.sizes.eyebrow, color: COLORS.textSecondary, fontWeight: 'bold', textTransform: 'uppercase' },
  kpiValue: { fontSize: TYPOGRAPHY.sizes.h5, fontWeight: 'bold', color: COLORS.textPrimary, marginTop: 4 },
  listContent: { paddingBottom: 40 }
});