import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { COLORS, TYPOGRAPHY, SHADOWS, SPACING } from '../../constants/theme';

const PurchaseCard = ({ id, fecha, proveedor, total, saldo, condicion, estadoPago }) => {
  // Lógica adaptada a la paleta global
  const getStatusStyle = () => {
    if (estadoPago === 3) return { bg: COLORS.success + '20', text: COLORS.success }; // Pagado
    if (estadoPago === 2) return { bg: COLORS.warning + '20', text: COLORS.warning }; // Pago Parcial
    return { bg: COLORS.error + '20', text: COLORS.error }; // Adeudado
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
          <Text style={[styles.amountLabel, { textAlign: 'right' }]}>Saldo</Text>
          <Text style={[styles.amountValue, { textAlign: 'right' }, saldo > 0 && { color: COLORS.error }]}>
            U$S {saldo}
          </Text>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  card: { backgroundColor: COLORS.paper, borderRadius: SPACING.smallRadius, padding: 16, marginBottom: 12, borderWidth: 1, borderColor: COLORS.divider, ...SHADOWS.lift },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 },
  idContainer: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  idText: { fontWeight: 'bold', fontSize: TYPOGRAPHY.sizes.h6, color: COLORS.textPrimary, fontFamily: TYPOGRAPHY.mono },
  dateText: { fontSize: 12, color: COLORS.textSecondary, fontFamily: TYPOGRAPHY.mono },
  statusPill: { paddingHorizontal: 8, paddingVertical: 4, borderRadius: 12 },
  statusText: { fontSize: 10, fontWeight: 'bold', textTransform: 'uppercase' },
  providerName: { fontSize: TYPOGRAPHY.sizes.h5, fontWeight: 'bold', color: COLORS.textPrimary, marginBottom: 16 },
  amountsRow: { flexDirection: 'row', justifyContent: 'space-between', borderTopWidth: 1, borderTopColor: COLORS.dividerSoft, paddingTop: 12 },
  amountBox: { flex: 1 },
  amountLabel: { fontSize: 10, color: COLORS.textSecondary, textTransform: 'uppercase', fontWeight: 'bold', marginBottom: 4 },
  amountValue: { fontSize: TYPOGRAPHY.sizes.h6, fontWeight: '900', color: COLORS.textPrimary },
});

export default PurchaseCard;