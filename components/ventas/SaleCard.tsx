import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { COLORS, TYPOGRAPHY, SHADOWS, SPACING } from '../../constants/theme';

export interface SaleProduct {
  nombre: string;
  cantidad: number;
  subtotal: number;
}

export interface SaleItem {
  id: number;
  fecha: string;
  cliente: string;
  vendedor: string;
  total: number;
  estadoPago: boolean;
  detalle: SaleProduct[];
}

const SaleCard = ({ id, fecha, cliente, vendedor, total, estadoPago }: SaleItem) => {
  return (
    <View style={styles.card}>
      <View style={styles.header}>
        <View style={styles.idContainer}>
          <Text style={styles.idText}>#{id}</Text>
          <Text style={styles.dateText}>{fecha}</Text>
        </View>
        <View style={[styles.statusPill, { backgroundColor: estadoPago ? COLORS.success + '20' : COLORS.error + '20' }]}>
          <Text style={[styles.statusText, { color: estadoPago ? COLORS.success : COLORS.error }]}>
            {estadoPago ? 'Pagada' : 'Pendiente'}
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
  card: { backgroundColor: COLORS.paper, borderRadius: SPACING.smallRadius, padding: 16, marginBottom: 12, borderWidth: 1, borderColor: COLORS.divider, ...SHADOWS.lift },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 },
  idContainer: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  idText: { fontWeight: 'bold', fontSize: TYPOGRAPHY.sizes.h6, color: COLORS.textPrimary, fontFamily: TYPOGRAPHY.mono },
  dateText: { fontSize: 12, color: COLORS.textSecondary, fontFamily: TYPOGRAPHY.mono },
  statusPill: { paddingHorizontal: 8, paddingVertical: 4, borderRadius: 12 },
  statusText: { fontSize: 10, fontWeight: 'bold', textTransform: 'uppercase' },
  clientName: { fontSize: TYPOGRAPHY.sizes.h5, fontWeight: 'bold', color: COLORS.textPrimary, marginBottom: 2 },
  sellerName: { fontSize: 12, color: COLORS.textSecondary, marginBottom: 16 },
  amountsRow: { flexDirection: 'row', justifyContent: 'space-between', borderTopWidth: 1, borderTopColor: COLORS.dividerSoft, paddingTop: 12 },
  amountBox: { flex: 1 },
  amountLabel: { fontSize: 10, color: COLORS.textSecondary, textTransform: 'uppercase', fontWeight: 'bold', marginBottom: 4 },
  amountValue: { fontSize: TYPOGRAPHY.sizes.h6, fontWeight: '900', color: COLORS.textPrimary },
});

export default SaleCard;