import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { COLORS, TYPOGRAPHY, SHADOWS, SPACING } from '../../constants/theme';
import { useNavigationStore } from '../../store/useNavigationStore';

export interface InventoryItem {
  id: number;
  producto: string;
  modelo: string;
  color?: string; 
  imei?: string;
  stock: number;
  precioMenor: number;
  imagen: string;
}

interface InventoryDetailProps {
  item: InventoryItem | null;
}

const InventoryDetail = ({ item }: InventoryDetailProps) => {
  const setVistaActual = useNavigationStore(state => state.setVistaActual);

  if (!item) return null;

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Ficha Técnica #{item.id}</Text>
        <TouchableOpacity onPress={() => setVistaActual('lista')} style={styles.backButton}>
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
  container: { flex: 1, backgroundColor: COLORS.background, padding: 16 },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 },
  headerTitle: { fontSize: TYPOGRAPHY.sizes.h4, fontWeight: 'bold', color: COLORS.textPrimary },
  backButton: { backgroundColor: COLORS.divider, paddingHorizontal: 16, paddingVertical: 8, borderRadius: SPACING.smallRadius },
  backButtonText: { fontWeight: 'bold', color: COLORS.textPrimary },
  card: { backgroundColor: COLORS.paper, padding: 16, borderRadius: SPACING.borderRadius, marginBottom: 16, borderWidth: 1, borderColor: COLORS.divider, ...SHADOWS.lift },
  sectionTitle: { fontSize: 12, fontWeight: 'bold', color: COLORS.textSecondary, textTransform: 'uppercase', marginBottom: 12 },
  label: { fontSize: 10, fontWeight: 'bold', color: COLORS.textDisabled, textTransform: 'uppercase', marginTop: 8 },
  valueLarge: { fontSize: TYPOGRAPHY.sizes.h3, fontWeight: '900', color: COLORS.textPrimary },
  subValue: { fontSize: 14, color: COLORS.textSecondary, marginBottom: 12 },
  row: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 8 },
  column: { flex: 1 },
  valueMono: { fontSize: 16, fontFamily: TYPOGRAPHY.mono, color: COLORS.primary, fontWeight: 'bold' },
  value: { fontSize: 14, fontWeight: 'bold', color: COLORS.textPrimary },
  labelFinal: { fontSize: 10, fontWeight: 'bold', color: COLORS.success, textTransform: 'uppercase', marginTop: 8 },
  valueFinal: { fontSize: TYPOGRAPHY.sizes.h3, fontWeight: '900', color: COLORS.success }
});

export default InventoryDetail;