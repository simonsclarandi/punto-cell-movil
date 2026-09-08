import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';

const InventoryDetail = ({ item, onBack }) => {
  if (!item) return null;

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Ficha Técnica #{item.id}</Text>
        <TouchableOpacity onPress={onBack} style={styles.backButton}>
          <Text style={styles.backButtonText}>Volver</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.card}>
        <Text style={styles.sectionTitle}>Dispositivo / Hardware</Text>
        <Text style={styles.label}>Nombre del Equipo</Text>
        <Text style={styles.valueLarge}>{item.producto}</Text>
        <Text style={styles.subValue}>{item.modelo}</Text>

        <View style={styles.row}>
          <View style={styles.column}>
            <Text style={styles.label}>IMEI</Text>
            <Text style={styles.valueMono}>{item.imei || '---'}</Text>
          </View>
          <View style={styles.column}>
            <Text style={styles.label}>Color</Text>
            <Text style={styles.value}>🎨 {item.color || 'N/A'}</Text>
          </View>
        </View>
      </View>

      <View style={styles.card}>
        <Text style={styles.sectionTitle}>Valores de Mercado (USD)</Text>
        <View style={styles.row}>
          <View style={styles.column}>
            <Text style={styles.label}>Mayorista</Text>
            <Text style={styles.value}>U$S {item.precioMenor - 100}</Text>
          </View>
          <View style={styles.column}>
            <Text style={styles.labelFinal}>Precio Público Final</Text>
            <Text style={styles.valueFinal}>U$S {item.precioMenor}</Text>
          </View>
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
  card: { backgroundColor: 'white', padding: 16, borderRadius: 12, marginBottom: 16, shadowColor: '#000', shadowOpacity: 0.05, shadowRadius: 4, elevation: 2 },
  sectionTitle: { fontSize: 12, fontWeight: 'bold', color: '#64748b', textTransform: 'uppercase', marginBottom: 12 },
  label: { fontSize: 10, fontWeight: 'bold', color: '#94a3b8', textTransform: 'uppercase', marginTop: 8 },
  valueLarge: { fontSize: 24, fontWeight: '900', color: '#0f172a' },
  subValue: { fontSize: 14, color: '#64748b', marginBottom: 12 },
  row: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 8 },
  column: { flex: 1 },
  valueMono: { fontSize: 16, fontFamily: 'monospace', color: '#2563eb', fontWeight: 'bold' },
  value: { fontSize: 14, fontWeight: 'bold', color: '#334155' },
  labelFinal: { fontSize: 10, fontWeight: 'bold', color: '#10b981', textTransform: 'uppercase', marginTop: 8 },
  valueFinal: { fontSize: 24, fontWeight: '900', color: '#059669' }
});

export default InventoryDetail;
