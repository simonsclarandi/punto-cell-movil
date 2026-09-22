import React from 'react';
import { View, FlatList, ActivityIndicator, Text, StyleSheet } from 'react-native';
import { useInfiniteQuery } from '@tanstack/react-query';
import { COLORS, TYPOGRAPHY, SPACING } from '../../constants/theme';
import LogCard, { LogCardProps } from './LogCard';
import apiClient from '../../api/client';

interface LogItem extends LogCardProps {
  id: number;
}

interface FetchLogsResponse {
  data: LogItem[];
  nextPage: number | null;
}

const fetchLogs = async ({ pageParam = 1 }: { pageParam?: number }): Promise<FetchLogsResponse> => {
  try {
    const limit = 15; 
    // Pegamos a la ruta de auditoría expuesta en auditoria.routes.js
    const response = await apiClient.get('/auditoria/bitacoras', {
      params: { 
        page: pageParam, 
        limit: limit 
      }
    });
    
    const payload = response.data.data;
    const logsBase = Array.isArray(payload) ? payload : (payload.data || payload.rows || []);

    const logsMapeados = logsBase.map((item: any) => ({
      id: item.Id,
      fecha: item.Fecha ? item.Fecha.replace('T', ' ').substring(0, 19) : '',
      
      // Si el backend no cruza las tablas, mostramos el ID como fallback. 
      // Los logs automáticos del sistema tienen IdEmpleado e IdSucursal en null.
      sucursal: item.sucursal ? item.sucursal.Nombre : (item.IdSucursal ? `Sucursal #${item.IdSucursal}` : 'Global'),
      usuario: item.empleado ? `${item.empleado.Nombre} ${item.empleado.Apellido}`.trim() : (item.IdEmpleado ? `Usuario #${item.IdEmpleado}` : 'Sistema'),
      
      // Mapeamos a los nombres de columna exactos de bitacora.model.js
      accion: item.Accion || 'Acción registrada',
      detalle: item.Detalle || 'Sin detalle',
      ip: item.IpAddress || 'Desconocida'
    }));

    return {
      data: logsMapeados,
      nextPage: logsBase.length === limit ? pageParam + 1 : null,
    };
  } catch (error) {
    console.error("Error al traer la bitácora:", error);
    throw error;
  }
};

export default function LogList() {
  const { data, isLoading, isError, fetchNextPage, hasNextPage, isFetchingNextPage } = useInfiniteQuery({
    queryKey: ['auditoria'],
    queryFn: fetchLogs,
    getNextPageParam: (lastPage) => lastPage.nextPage,
    initialPageParam: 1, 
  });

  const logsAll = data?.pages.flatMap(page => page.data) || [];
  const totalRegistros = logsAll.length;
  const accesosFallidos = logsAll.filter(l => l.accion.toLowerCase().includes('fall')).length;

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