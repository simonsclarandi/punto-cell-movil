import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

const SaleCard = ({ id, fecha, cliente, vendedor, total, estadoPago }) => {
  const isSaldada = estadoPago;

  return (
    <View style={styles.card}>
      <View style={styles.header}>
        <View style={styles.idContainer}>
          <Text style={styles.idText}>#{id}</Text>
          <Text style={styles.dateText}>{fecha}</Text>
        </View>
        <View style={[styles.statusPill, { backgroundColor: isSaldada ? '#dcfce7' : '#fef2f2' }]}>
          <Text style={[styles.statusText, { color: isSaldada ? '#166534' : '#991b1b' }]}>
            {isSaldada ? 'Pagada' : 'Pendiente'}
          </Text>
        </View>
      </View>

      <Text style={styles.clientName}>{cliente}</Text>
      <Text style={styles.sellerName}>Vendedor: {vendedor}</Text>

      <View style={styles.amountsRow}>
        <View style={styles.amountBox}>
          <Text style={styles.amountLabel}>Total Facturado</Text>
          <Text style={styles.amountValue}>U$S {total}</Text>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  card: { backgroundColor: '#ffffff', borderRadius: 8, padding: 16, marginBottom: 12, borderWidth: 1, borderColor: '#e2e8f0' },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 },
  idContainer: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  idText: { fontWeight: 'bold', fontSize: 16, color: '#0f172a', fontFamily: 'monospace' },
  dateText: { fontSize: 12, color: '#64748b', fontFamily: 'monospace' },
  statusPill: { paddingHorizontal: 8, paddingVertical: 4, borderRadius: 12 },
  statusText: { fontSize: 10, fontWeight: 'bold', textTransform: 'uppercase' },
  clientName: { fontSize: 18, fontWeight: 'bold', color: '#0f172a', marginBottom: 2 },
  sellerName: { fontSize: 12, color: '#64748b', marginBottom: 16 },
  amountsRow: { flexDirection: 'row', justifyContent: 'space-between', borderTopWidth: 1, borderTopColor: '#f1f5f9', paddingTop: 12 },
  amountBox: { flex: 1 },
  amountLabel: { fontSize: 10, color: '#64748b', textTransform: 'uppercase', fontWeight: 'bold', marginBottom: 4 },
  amountValue: { fontSize: 16, fontWeight: '900', color: '#0f172a' },
});

export default SaleCard;