import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { COLORS, TYPOGRAPHY, SHADOWS, SPACING } from '../../constants/theme';
import { useNavigationStore } from '../../store/useNavigationStore';

const RepairDetail = ({ item }) => {
  const setVistaActual = useNavigationStore(state => state.setVistaActual);

  if (!item) return null;

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Orden #{item.id}</Text>
        <TouchableOpacity onPress={() => setVistaActual('lista')} style={styles.backButton}>
          <Text style={styles.backButtonText}>Volver</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.card}>
        <Text style={styles.sectionTitle}>Datos del Equipo</Text>
        <Text style={styles.label}>Dispositivo</Text>
        <Text style={styles.valueLarge}>{item.dispositivo}</Text>

        <View style={styles.grid}>
          <View style={styles.column}>
            <Text style={styles.label}>Cliente</Text>
            <Text style={styles.value}>{item.cliente}</Text>
          </View>
          <View style={styles.column}>
            <Text style={styles.label}>Fecha Ingreso</Text>
            <Text style={styles.valueMono}>{item.fecha}</Text>
          </View>
        </View>
      </View>

      <View style={styles.card}>
        <Text style={styles.sectionTitle}>Diagnóstico y Estado</Text>
        <Text style={styles.label}>Falla Reportada</Text>
        <Text style={[styles.value, { marginBottom: 16 }]}>{item.falla}</Text>
        
        <Text style={styles.label}>Estado Actual</Text>
        <Text style={[styles.valueLarge, { color: item.estado === 'terminado' ? COLORS.warning : COLORS.info, textTransform: 'capitalize' }]}>
          {item.estado}
        </Text>
      </View>
    </ScrollView>
  );
};

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

export default RepairDetail;