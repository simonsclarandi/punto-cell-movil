import React, { useState } from 'react';
import { View, FlatList, ActivityIndicator, Text, StyleSheet, TextInput, Switch, RefreshControl, TouchableOpacity } from 'react-native';
import { useInfiniteQuery } from '@tanstack/react-query';
import { COLORS, TYPOGRAPHY, SPACING, SHADOWS } from '../../constants/theme';
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
      sucursal: item.sucursal ? item.sucursal.Nombre : (item.IdSucursal ? `Sucursal #${item.IdSucursal}` : 'Global'),
      usuario: item.empleado ? `${item.empleado.Nombre} ${item.empleado.Apellido}`.trim() : (item.IdEmpleado ? `Usuario #${item.IdEmpleado}` : 'Sistema / Anónimo'),
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
  const [busqueda, setBusqueda] = useState('');
  const [soloFallos, setSoloFallos] = useState(false);

  const { data, isLoading, isError, fetchNextPage, hasNextPage, isFetchingNextPage, refetch, isRefetching } = useInfiniteQuery({
    queryKey: ['auditoria'],
    queryFn: fetchLogs,
    getNextPageParam: (lastPage) => lastPage.nextPage,
    initialPageParam: 1, 
  });

  const logsAll = data?.pages.flatMap(page => page.data) || [];

  // Aplicación de los filtros
  const logsFiltrados = logsAll.filter(item => {
    const texto = busqueda.toLowerCase();
    const coincideBusqueda = 
      item.usuario.toLowerCase().includes(texto) ||
      item.accion.toLowerCase().includes(texto) ||
      item.detalle.toLowerCase().includes(texto);
      
    const esFallo = item.accion.toLowerCase().includes('fallido') || item.accion.toLowerCase().includes('rechaz');
    const coincideEstado = soloFallos ? esFallo : true;
    
    return coincideBusqueda && coincideEstado;
  });

  const totalRegistros = logsAll.length;
  const accesosFallidos = logsAll.filter(l => l.accion.toLowerCase().includes('fall') || l.accion.toLowerCase().includes('rechaz')).length;

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
          placeholder="Buscar usuario, acción o detalle..."
          placeholderTextColor={COLORS.textDisabled}
          value={busqueda}
          onChangeText={setBusqueda}
        />
        <View style={styles.switchesContainer}>
          <View style={styles.switchRow}>
            <Switch 
              value={soloFallos} 
              onValueChange={setSoloFallos}
              trackColor={{ false: COLORS.divider, true: COLORS.error }}
              thumbColor={soloFallos ? '#FFFFFF' : COLORS.textDisabled}
            />
            <Text style={[styles.switchLabel, soloFallos && { color: COLORS.error, fontWeight: 'bold' }]}>
              Mostrar solo accesos fallidos / rechazados
            </Text>
          </View>
        </View>
      </View>

      <View style={styles.kpiContainer}>
        <View style={[styles.kpiCard, { borderColor: COLORS.divider }]}>
          <Text style={styles.kpiLabel}>Registros Cargados</Text>
          <Text style={styles.kpiValue}>{totalRegistros}</Text>
        </View>
        <View style={[styles.kpiCard, { borderColor: COLORS.error }]}>
          <Text style={styles.kpiLabel}>Fallos Críticos</Text>
          <Text style={[styles.kpiValue, { color: COLORS.error }]}>{accesosFallidos}</Text>
        </View>
      </View>

      <FlatList
        data={logsFiltrados}
        keyExtractor={(item) => item.id.toString()}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          <Text style={styles.emptyText}>No se encontraron registros con estos filtros.</Text>
        }
        renderItem={({ item }) => (
          <LogCard 
            fecha={item.fecha} sucursal={item.sucursal} 
            usuario={item.usuario} accion={item.accion} 
            detalle={item.detalle} ip={item.ip} 
          />
        )}
        onEndReached={() => { if (hasNextPage && !busqueda && !soloFallos) fetchNextPage(); }}
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
  loadingText: { marginTop: 12, color: COLORS.textSecondary, fontWeight: 'bold' },
  kpiContainer: { flexDirection: 'row', gap: 12, marginBottom: 16, marginTop: 16, paddingHorizontal: 16 },
  kpiCard: { flex: 1, backgroundColor: COLORS.paper, padding: 12, borderRadius: SPACING.smallRadius, borderWidth: 1 },
  kpiLabel: { fontSize: TYPOGRAPHY.sizes.eyebrow, color: COLORS.textSecondary, fontWeight: 'bold', textTransform: 'uppercase' },
  kpiValue: { fontSize: TYPOGRAPHY.sizes.h5, fontWeight: 'bold', color: COLORS.textPrimary, marginTop: 4 },
  listContent: { paddingBottom: 40, paddingHorizontal: 16 },
  
  // Estilos de los Filtros
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