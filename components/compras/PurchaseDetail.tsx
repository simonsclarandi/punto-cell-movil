import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, ActivityIndicator } from 'react-native';
import { useQuery } from '@tanstack/react-query';
import { COLORS, TYPOGRAPHY, SHADOWS, SPACING } from '../../constants/theme';
import { useNavigationStore } from '../../store/useNavigationStore';
import { PurchaseCardProps } from './PurchaseCard';
import apiClient from '../../api/client';

interface PurchaseDetailProps {
  item: PurchaseCardProps | null;
}

const PurchaseDetail = ({ item }: PurchaseDetailProps) => {
  const setVistaActual = useNavigationStore(state => state.setVistaActual);

  // 1. Buscamos el detalle de la compra en el backend usando el ID
  const { data: compraCompleta, isLoading, isError } = useQuery({
    queryKey: ['compraDetalle', item?.id],
    queryFn: async () => {
      const res = await apiClient.get(`/compras/compras/${item?.id}`);
      return res.data.data;
    },
    enabled: !!item?.id, // Solo ejecuta si hay un ID válido
  });

  if (!item) return null;

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Compra #{item.id}</Text>
        <TouchableOpacity onPress={() => setVistaActual('lista')} style={styles.backButton}>
          <Text style={styles.backButtonText}>Volver</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.card}>
        <Text style={styles.sectionTitle}>Datos del Proveedor</Text>
        <View style={styles.grid}>
          <View style={styles.column}>
            <Text style={styles.label}>Proveedor</Text>
            <Text style={styles.value}>{item.proveedor}</Text>
          </View>
          <View style={styles.column}>
            <Text style={styles.label}>Fecha Ingreso</Text>
            <Text style={styles.valueMono}>{item.fecha}</Text>
          </View>
          <View style={styles.column}>
            <Text style={styles.label}>Condición</Text>
            <Text style={[styles.value, { color: item.estadoPago === 3 ? COLORS.success : COLORS.error }]}>
              {item.condicion}
            </Text>
          </View>
        </View>
      </View>

      {/* 2. Nueva tarjeta para los Renglones / Detalle de la mercadería */}
      <View style={styles.card}>
        <Text style={styles.sectionTitle}>Artículos Ingresados</Text>
        
        {isLoading && (
          <ActivityIndicator size="small" color={COLORS.primary} style={{ marginVertical: 10 }} />
        )}
        
        {isError && (
          <Text style={{ color: COLORS.error, fontSize: 12 }}>Error al cargar los artículos.</Text>
        )}

        {compraCompleta?.detalles?.map((detalle: any, index: number) => (
          <View key={detalle.Id || index} style={styles.itemRow}>
            <View style={{ flex: 1 }}>
              {/* Leemos el nombre del Articulo a través de la relación de Inventario que armaste en el backend */}
              <Text style={styles.itemName}>
                {detalle.inventario?.articulo?.Nombre || 'Producto sin nombre'}
              </Text>
              <Text style={styles.itemMeta}>
                {detalle.Cantidad} un. x U$S {Number(detalle.PrecioCostoUnitario).toFixed(2)}
              </Text>
            </View>
            <View>
              <Text style={styles.itemSubtotal}>
                U$S {(Number(detalle.Cantidad) * Number(detalle.PrecioCostoUnitario)).toFixed(2)}
              </Text>
            </View>
          </View>
        ))}

        {!isLoading && compraCompleta?.detalles?.length === 0 && (
          <Text style={styles.label}>No hay detalles registrados.</Text>
        )}
      </View>

      <View style={styles.card}>
        <View style={styles.totalRow}>
          <View>
            <Text style={styles.totalLabel}>Costo Total</Text>
            <Text style={styles.totalValue}>U$S {item.total}</Text>
          </View>
          <View style={{ alignItems: 'flex-end' }}>
            <Text style={styles.totalLabel}>Saldo a Pagar</Text>
            <Text style={[styles.totalValue, item.saldo > 0 && { color: COLORS.error }]}>U$S {item.saldo}</Text>
          </View>
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
  
  // Nuevos estilos para los items
  itemRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: COLORS.divider },
  itemName: { fontSize: 14, fontWeight: 'bold', color: COLORS.textPrimary, marginBottom: 4 },
  itemMeta: { fontSize: 12, color: COLORS.textSecondary },
  itemSubtotal: { fontSize: 14, fontWeight: 'bold', color: COLORS.textPrimary, fontFamily: TYPOGRAPHY.mono },
  
  totalRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  totalLabel: { fontSize: 12, fontWeight: 'bold', color: COLORS.textSecondary, textTransform: 'uppercase' },
  totalValue: { fontSize: TYPOGRAPHY.sizes.h4, fontWeight: '900', color: COLORS.textPrimary }
});

export default PurchaseDetail;