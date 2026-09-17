import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { COLORS, TYPOGRAPHY, SHADOWS, SPACING } from '../../constants/theme';

export interface RepairItem {
  id: number;
  fecha: string;
  cliente: string;
  dispositivo: string;
  falla: string;
  estado: string;
}

const RepairCard = ({ id, fecha, cliente, dispositivo, falla, estado }: RepairItem) => {
  const getStatusConfig = () => {
    const normalize = estado?.toLowerCase();
    switch (normalize) {
      case 'entregado': return { bg: COLORS.success + '20', text: COLORS.success, label: 'Entregado' };
      case 'terminado': return { bg: COLORS.warning + '20', text: COLORS.warning, label: 'Terminado' };
      case 'en reparación': return { bg: COLORS.info + '20', text: COLORS.info, label: 'Reparación' };
      case 'anulado': return { bg: COLORS.error + '20', text: COLORS.error, label: 'Anulada' };
      default: return { bg: COLORS.secondary + '20', text: COLORS.secondary, label: 'Espera' }; 
    }
  };

  const status = getStatusConfig();

  return (
    <View style={styles.card}>
      <View style={styles.header}>
        <View style={styles.idContainer}>
          <Text style={styles.idText}>#{id}</Text>
          <Text style={styles.dateText}>{fecha}</Text>
        </View>
        <View style={[styles.statusPill, { backgroundColor: status.bg }]}>
          <Text style={[styles.statusText, { color: status.text }]}>{status.label}</Text>
        </View>
      </View>

      <Text style={styles.deviceName}>{dispositivo}</Text>
      <Text style={styles.clientName}>Cliente: {cliente}</Text>

      <View style={styles.issueBox}>
        <Text style={styles.issueLabel}>Falla / Detalle</Text>
        <Text style={styles.issueText}>{falla}</Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  card: { backgroundColor: COLORS.paper, borderRadius: SPACING.smallRadius, padding: 16, marginBottom: 12, borderWidth: 1, borderColor: COLORS.divider, ...SHADOWS.lift },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 },
  idContainer: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  idText: { fontWeight: 'bold', fontSize: TYPOGRAPHY.sizes.h6, color: COLORS.textPrimary, fontFamily: TYPOGRAPHY.mono },
  dateText: { fontSize: 12, color: COLORS.textSecondary, fontFamily: TYPOGRAPHY.mono },
  statusPill: { paddingHorizontal: 8, paddingVertical: 4, borderRadius: 12 },
  statusText: { fontSize: 10, fontWeight: 'bold', textTransform: 'uppercase' },
  deviceName: { fontSize: TYPOGRAPHY.sizes.h6, fontWeight: 'bold', color: COLORS.textPrimary, marginBottom: 2 },
  clientName: { fontSize: 13, color: COLORS.textSecondary, marginBottom: 12 },
  issueBox: { backgroundColor: COLORS.surfaceMuted, padding: 10, borderRadius: 6, borderLeftWidth: 3, borderLeftColor: COLORS.divider },
  issueLabel: { fontSize: 10, color: COLORS.textSecondary, textTransform: 'uppercase', fontWeight: 'bold', marginBottom: 4 },
  issueText: { fontSize: 13, color: COLORS.textPrimary }
});

export default RepairCard;