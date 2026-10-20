import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, ActivityIndicator } from 'react-native';
import { useQuery } from '@tanstack/react-query';
import { COLORS, TYPOGRAPHY, SHADOWS, SPACING } from '../../../constants/theme';
import { useNavigationStore } from '../../../store/useNavigationStore';
import { RepairItem } from '../../../components/reparaciones/RepairCard';
import apiClient from '../../../api/client';
import { router, useLocalSearchParams } from 'expo-router';

export default function RepairDetail() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const item = useNavigationStore(state => state.itemSeleccionado) as RepairItem | null;
  const targetId = id || item?.id;

  // Traemos el detalle completo de la orden de reparación
  const { data: ordenCompleta, isLoading, isError } = useQuery({
    queryKey: ['reparacionDetalle', targetId],
    queryFn: async () => {
      const res = await apiClient.get(`/reparaciones/ordenes-reparacion/${targetId}`);
      return res.data.data;
    },
    enabled: !!targetId, 
  });

  // La observación en el backend vive en el historial de 'seguimientos'
  const seguimientos = ordenCompleta?.seguimientos || [];
  const ultimoSeguimiento = seguimientos.length > 0 ? seguimientos[seguimientos.length - 1] : null;
  const observacionTecnica = ultimoSeguimiento?.ObservacionTecnico || ordenCompleta?.Observaciones || '';

  const dispositivoNombre = ordenCompleta?.dispositivo?.modelo?.Nombre || item?.dispositivo || 'Dispositivo';
  const clienteNombre = ordenCompleta?.dispositivo?.cliente 
    ? `${ordenCompleta.dispositivo.cliente.Nombre} ${ordenCompleta.dispositivo.cliente.Apellido || ''}`.trim()
    : (item?.cliente || 'Cliente');

  const fallasArray = ordenCompleta?.fallas || [];
  const fallasTexto = fallasArray.length > 0 
    ? fallasArray.map((f: any) => f.Nombre).filter(Boolean).join(', ')
    : (item?.falla || 'Revisión técnica');

  const estadoTexto = ordenCompleta?.estado?.Nombre || item?.estado || 'En espera';
  const fechaEmision = (ordenCompleta?.FechaEmision || item?.fecha || '').split('T')[0];

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Orden #{targetId}</Text>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Text style={styles.backButtonText}>Volver</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.card}>
        <Text style={styles.sectionTitle}>Datos del Equipo</Text>
        <Text style={styles.label}>Dispositivo</Text>
        <Text style={styles.valueLarge}>{dispositivoNombre}</Text>

        <View style={styles.grid}>
          <View style={styles.column}>
            <Text style={styles.label}>Cliente</Text>
            <Text style={styles.value}>{clienteNombre}</Text>
          </View>
          <View style={styles.column}>
            <Text style={styles.label}>Fecha Ingreso</Text>
            <Text style={styles.valueMono}>{fechaEmision}</Text>
          </View>
        </View>
      </View>

      <View style={styles.card}>
        <Text style={styles.sectionTitle}>Diagnóstico y Estado</Text>
        <Text style={styles.label}>Falla Reportada</Text>
        <Text style={[styles.value, { marginBottom: 16 }]}>{fallasTexto}</Text>
        
        <Text style={styles.label}>Estado Actual</Text>
        <Text style={[styles.valueLarge, { color: String(estadoTexto).toLowerCase() === 'terminado' ? COLORS.warning : COLORS.info, textTransform: 'capitalize' }]}>
          {estadoTexto}
        </Text>

        {isLoading && (
          <ActivityIndicator size="small" color={COLORS.primary} style={{ marginTop: 10, alignSelf: 'flex-start' }} />
        )}

        {isError && (
          <Text style={{ color: COLORS.error, fontSize: 12, marginTop: 8 }}>Error al consultar el detalle técnico.</Text>
        )}

        {observacionTecnica ? (
          <View style={{ marginTop: 16, paddingTop: 16, borderTopWidth: 1, borderTopColor: COLORS.dividerSoft }}>
            <Text style={styles.label}>Observaciones Técnicas</Text>
            <Text style={[styles.value, { fontWeight: 'normal', color: COLORS.textSecondary, marginTop: 4 }]}>
              {observacionTecnica}
            </Text>
          </View>
        ) : null}

        {ordenCompleta?.TotalReparacion && (
          <View style={{ marginTop: 16, paddingTop: 16, borderTopWidth: 1, borderTopColor: COLORS.dividerSoft }}>
            <Text style={styles.label}>Total Presupuestado</Text>
            <Text style={[styles.valueLarge, { color: COLORS.primary }]}>
              U$S {Number(ordenCompleta.TotalReparacion).toFixed(2)}
            </Text>
          </View>
        )}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.surfaceMuted, padding: 16 },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 },
  headerTitle: { fontSize: TYPOGRAPHY.sizes.h4, fontWeight: 'bold', color: COLORS.textPrimary },
  backButton: { backgroundColor: COLORS.divider, paddingHorizontal: 16, paddingVertical: 8, borderRadius: SPACING.smallRadius },
  backButtonText: { fontWeight: 'bold', color: COLORS.textPrimary },
  card: { backgroundColor: COLORS.paper, padding: 16, borderRadius: SPACING.borderRadius, marginBottom: 16, borderWidth: 1, borderColor: COLORS.divider, ...SHADOWS.lift },
  sectionTitle: { fontSize: 12, fontWeight: 'bold', color: COLORS.textSecondary, textTransform: 'uppercase', marginBottom: 12 },
  label: { fontSize: 10, fontWeight: 'bold', color: COLORS.textDisabled, textTransform: 'uppercase', marginTop: 8 },
  valueLarge: { fontSize: 22, fontWeight: '900', color: COLORS.textPrimary, marginBottom: 12 },
  value: { fontSize: 14, fontWeight: 'bold', color: COLORS.textPrimary },
  valueMono: { fontSize: 14, fontFamily: TYPOGRAPHY.mono, color: COLORS.primary, fontWeight: 'bold' },
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: 16 },
  column: { width: '45%' },
});
