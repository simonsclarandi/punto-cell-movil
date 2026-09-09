import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

const PurchaseCard = ({ id, fecha, proveedor, total, saldo, condicion, estadoPago }) => {
  // Lógica basada en tu función `tonoEstado`
  const getStatusStyle = () => {
    if (estadoPago === 3) return { bg: '#dcfce7', text: '#166534' }; // ok
    if (estadoPago === 2) return { bg: '#f1f5f9', text: '#475569' }; // flat
    return { bg: '#fef2f2', text: '#991b1b' }; // due
  };

  const statusStyle = getStatusStyle();

  return (
    <View style={styles.card}>
      <View style={styles.header}>
        <View style={styles.idContainer}>
          <Text style={styles.idText}>#{id}</Text>
          <Text style={styles.dateText}>{fecha}</Text>
        </View>
        <View style={[styles.statusPill, { backgroundColor: statusStyle.bg }]}>
          <Text style={[styles.statusText, { color: statusStyle.text }]}>{condicion}</Text>
        </View>
      </View>

      <Text style={styles.providerName}>{proveedor}</Text>

      <View style={styles.amountsRow}>
        <View style={styles.amountBox}>
          <Text style={styles.amountLabel}>Total</Text>
          <Text style={styles.amountValue}>U$S {total}</Text>
        </View>
        <View style={styles.amountBox}>
          <Text style={styles.amountLabel}>Saldo</Text>
          <Text style={[styles.amountValue, saldo > 0 && { color: '#991b1b' }]}>
            U$S {saldo}
          </Text>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#ffffff',
    borderRadius: 8,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  idContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  idText: {
    fontWeight: 'bold',
    fontSize: 16,
    color: '#0f172a',
    fontFamily: 'monospace',
  },
  dateText: {
    fontSize: 12,
    color: '#64748b',
    fontFamily: 'monospace',
  },
  statusPill: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusText: {
    fontSize: 10,
    fontWeight: 'bold',
    textTransform: 'uppercase',
  },
  providerName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#0f172a',
    marginBottom: 16,
  },
  amountsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    borderTopWidth: 1,
    borderTopColor: '#f1f5f9',
    paddingTop: 12,
  },
  amountBox: {
    flex: 1,
  },
  amountLabel: {
    fontSize: 10,
    color: '#64748b',
    textTransform: 'uppercase',
    fontWeight: 'bold',
    marginBottom: 4,
  },
  amountValue: {
    fontSize: 16,
    fontWeight: '900',
    color: '#0f172a',
  },
});

export default PurchaseCard;