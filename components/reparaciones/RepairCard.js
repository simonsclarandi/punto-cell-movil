import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

const RepairCard = ({ id, fecha, cliente, dispositivo, falla, estado }) => {
  const getStatusConfig = () => {
    const normalize = estado?.toLowerCase();
    switch (normalize) {
      case 'entregado': return { bg: '#dcfce7', text: '#166534', label: 'Entregado' };
      case 'terminado': return { bg: '#fef3c7', text: '#92400e', label: 'Terminado' };
      case 'en reparación': return { bg: '#eff6ff', text: '#1e40af', label: 'Reparación' };
      case 'anulado': return { bg: '#fef2f2', text: '#991b1b', label: 'Anulada' };
      default: return { bg: '#f1f5f9', text: '#475569', label: 'Espera' }; // 'en espera'
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
  card: { backgroundColor: '#ffffff', borderRadius: 8, padding: 16, marginBottom: 12, borderWidth: 1, borderColor: '#e2e8f0' },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 },
  idContainer: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  idText: { fontWeight: 'bold', fontSize: 16, color: '#0f172a', fontFamily: 'monospace' },
  dateText: { fontSize: 12, color: '#64748b', fontFamily: 'monospace' },
  statusPill: { paddingHorizontal: 8, paddingVertical: 4, borderRadius: 12 },
  statusText: { fontSize: 10, fontWeight: 'bold', textTransform: 'uppercase' },
  deviceName: { fontSize: 16, fontWeight: 'bold', color: '#0f172a', marginBottom: 2 },
  clientName: { fontSize: 13, color: '#64748b', marginBottom: 12 },
  issueBox: { backgroundColor: '#f8fafc', padding: 10, borderRadius: 6, borderLeftWidth: 3, borderLeftColor: '#cbd5e1' },
  issueLabel: { fontSize: 10, color: '#64748b', textTransform: 'uppercase', fontWeight: 'bold', marginBottom: 4 },
  issueText: { fontSize: 13, color: '#334155' }
});

export default RepairCard;