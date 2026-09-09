import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';

const SaleDetail = ({ item, onBack }) => {
  if (!item) return null;

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Ticket #{item.id}</Text>
        <TouchableOpacity onPress={onBack} style={styles.backButton}>
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
            <Text style={[styles.value, { color: item.estadoPago ? '#10b981' : '#f59e0b' }]}>
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
  container: { flex: 1, backgroundColor: '#f8fafc', padding: 16 },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 },
  headerTitle: { fontSize: 20, fontWeight: 'bold', color: '#0f172a' },
  backButton: { backgroundColor: '#e2e8f0', paddingHorizontal: 16, paddingVertical: 8, borderRadius: 8 },
  backButtonText: { fontWeight: 'bold', color: '#0f172a' },
  card: { backgroundColor: 'white', padding: 16, borderRadius: 12, marginBottom: 16, borderWidth: 1, borderColor: '#e2e8f0' },
  sectionTitle: { fontSize: 12, fontWeight: 'bold', color: '#64748b', textTransform: 'uppercase', marginBottom: 12 },
  label: { fontSize: 10, fontWeight: 'bold', color: '#94a3b8', textTransform: 'uppercase', marginTop: 8 },
  value: { fontSize: 14, fontWeight: 'bold', color: '#334155' },
  valueMono: { fontSize: 14, fontFamily: 'monospace', color: '#2563eb', fontWeight: 'bold' },
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: 16 },
  column: { width: '45%' },
  productRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 8, borderBottomWidth: 1, borderBottomColor: '#f1f5f9' },
  productName: { fontSize: 14, fontWeight: 'bold', color: '#0f172a' },
  productSpec: { fontSize: 12, color: '#64748b' },
  productPrice: { fontSize: 14, fontWeight: 'bold', color: '#0f172a' },
  totalRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  totalLabel: { fontSize: 16, fontWeight: 'bold', color: '#334155' },
  totalValue: { fontSize: 24, fontWeight: '900', color: '#2563eb' }
});

export default SaleDetail;