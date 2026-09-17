import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { COLORS, TYPOGRAPHY, SHADOWS, SPACING } from '../../constants/theme';
import { useNavigationStore } from '../../store/useNavigationStore';
import { SaleItem } from './SaleCard';

interface SaleDetailProps {
  item: SaleItem | null;
}

const SaleDetail = ({ item }: SaleDetailProps) => {
  const setVistaActual = useNavigationStore(state => state.setVistaActual);

  if (!item) return null;

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Ticket #{item.id}</Text>
        <TouchableOpacity onPress={() => setVistaActual('lista')} style={styles.backButton}>
          <Text style={styles.backButtonText}>Volver</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.card}>
        <Text style={styles.sectionTitle}>Datos de la Venta</Text>
        <View style={styles.grid}>
          <View style={styles.column}>
            <Text style={styles.label}>Cliente</Text>
            <Text style={styles.value}>{item.cliente}</Text>
          </View>
          <View style={styles.column}>
            <Text style={styles.label}>Vendedor</Text>
            <Text style={styles.value}>{item.vendedor}</Text>
          </View>
          <View style={styles.column}>
            <Text style={styles.label}>Fecha</Text>
            <Text style={styles.valueMono}>{item.fecha}</Text>
          </View>
          <View style={styles.column}>
            <Text style={styles.label}>Estado</Text>
            <Text style={[styles.value, { color: item.estadoPago ? COLORS.success : COLORS.warning }]}>
              {item.estadoPago ? 'Pagada' : 'Pendiente'}
            </Text>
          </View>
        </View>
      </View>

      <View style={styles.card}>
        <Text style={styles.sectionTitle}>Productos</Text>
        {item.detalle.map((prod, index) => (
          <View key={index} style={styles.productRow}>
            <View>
              <Text style={styles.productName}>{prod.nombre}</Text>
              <Text style={styles.productSpec}>Cant: {prod.cantidad}</Text>
            </View>
            <Text style={styles.productPrice}>U$S {prod.subtotal}</Text>
          </View>
        ))}
      </View>

      <View style={styles.card}>
        <View style={styles.totalRow}>
          <Text style={styles.totalLabel}>Total Facturado</Text>
          <Text style={styles.totalValue}>U$S {item.total}</Text>
        </View>
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
  value: { fontSize: 14, fontWeight: 'bold', color: COLORS.textPrimary },
  valueMono: { fontSize: 14, fontFamily: TYPOGRAPHY.mono, color: COLORS.primary, fontWeight: 'bold' },
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: 16 },
  column: { width: '45%' },
  productRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 8, borderBottomWidth: 1, borderBottomColor: COLORS.dividerSoft },
  productName: { fontSize: 14, fontWeight: 'bold', color: COLORS.textPrimary },
  productSpec: { fontSize: 12, color: COLORS.textSecondary },
  productPrice: { fontSize: 14, fontWeight: 'bold', color: COLORS.textPrimary },
  totalRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  totalLabel: { fontSize: TYPOGRAPHY.sizes.h6, fontWeight: 'bold', color: COLORS.textPrimary },
  totalValue: { fontSize: TYPOGRAPHY.sizes.h4, fontWeight: '900', color: COLORS.primary }
});

export default SaleDetail;