import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, ActivityIndicator } from 'react-native';
import { useQuery } from '@tanstack/react-query';
import { COLORS, TYPOGRAPHY, SHADOWS, SPACING } from '../../constants/theme';
import { useNavigationStore } from '../../store/useNavigationStore';
import { SaleItem } from './SaleCard';
import apiClient from '../../api/client';

interface SaleDetailProps {
  item: SaleItem | null;
}

const SaleDetail = ({ item }: SaleDetailProps) => {
  const setVistaActual = useNavigationStore(state => state.setVistaActual);

  // 1. Buscamos el detalle de la venta en el backend usando el ID
  const { data: ventaCompleta, isLoading, isError } = useQuery({
    queryKey: ['ventaDetalle', item?.id],
    queryFn: async () => {
      const res = await apiClient.get(`/ventas/${item?.id}`);
      return res.data.data;
    },
    enabled: !!item?.id, // Solo ejecuta si hay un ID válido
  });

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
        
        {isLoading && (
          <ActivityIndicator size="small" color={COLORS.primary} style={{ marginVertical: 10 }} />
        )}
        
        {isError && (
          <Text style={{ color: COLORS.error, fontSize: 12 }}>Error al cargar los artículos.</Text>
        )}

        {/* 2. Mapeamos los detalles reales que devuelve Node.js */}
        {ventaCompleta?.detalles?.map((prod: any, index: number) => (
          <View key={prod.Id || index} style={styles.productRow}>
            <View>
              {/* Leemos el nombre del Articulo a través de la relación de Inventario armada en el backend */}
              <Text style={styles.productName}>
                {prod.inventario?.articulo?.Nombre || 'Producto sin nombre'}
              </Text>
              <Text style={styles.productSpec}>
                Cant: {prod.Cantidad} x U$S {Number(prod.PrecioUnitario).toFixed(2)}
              </Text>
            </View>
            <Text style={styles.productPrice}>
              U$S {(Number(prod.Cantidad) * Number(prod.PrecioUnitario)).toFixed(2)}
            </Text>
          </View>
        ))}

        {!isLoading && ventaCompleta?.detalles?.length === 0 && (
          <Text style={styles.label}>No hay detalles registrados en esta venta.</Text>
        )}
      </View>

      <View style={styles.card}>
        <View style={styles.totalRow}>
          <Text style={styles.totalLabel}>Total Facturado</Text>
          <Text style={styles.totalValue}>U$S {item.total}</Text>
        </View>
        
        {/* Opcional: Mostrar el equivalente en Pesos si ya cargó la info completa */}
        {!isLoading && ventaCompleta?.TotalVentaARS && (
           <View style={[styles.totalRow, { marginTop: 8 }]}>
             <Text style={styles.totalLabel}>Equivalente ARS</Text>
             <Text style={[styles.totalValue, { fontSize: TYPOGRAPHY.sizes.h6, color: COLORS.textSecondary }]}>
               ${Number(ventaCompleta.TotalVentaARS).toLocaleString('es-AR')}
             </Text>
           </View>
        )}
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