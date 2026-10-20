import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, ActivityIndicator, Image } from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { useQuery } from '@tanstack/react-query';
import { COLORS, TYPOGRAPHY, SHADOWS, SPACING } from '../../../constants/theme';
import { useNavigationStore } from '../../../store/useNavigationStore';
import { getFullImageUrl } from '../../../constants/images';
import apiClient from '../../../api/client';

export interface InventoryItem {
  id: number;
  producto: string;
  modelo: string;
  categoria?: string;
  color?: string; 
  imei?: string;
  stock: number;
  precioMenor: number;
  precioMayor?: number;
  imagen: string;
}

export default function InventoryDetail() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const itemState = useNavigationStore(state => state.itemSeleccionado) as InventoryItem | null;
  const targetId = id || itemState?.id;

  // Consulta por ID como respaldo en caso de recargar o perder el estado
  const { data: itemData, isLoading, isError } = useQuery({
    queryKey: ['inventarioDetalle', targetId],
    queryFn: async () => {
      const [resInv, resPrecios, resCat] = await Promise.all([
        apiClient.get(`/inventario/inventarios/${targetId}`),
        apiClient.get('/precios/precios-articulos').catch(() => ({ data: { data: [] } })),
        apiClient.get('/catalogo/productos').catch(() => ({ data: { data: { productos: [] } } }))
      ]);

      const inv = resInv.data?.data;
      const precios = resPrecios.data?.data || [];
      const precioItem = precios.find((p: any) => p.IdInventario === Number(targetId));
      
      const catalogo = resCat.data?.data?.productos || [];
      const catProd = catalogo.find((c: any) => Number(c.id) === Number(targetId)) ||
        catalogo.find((c: any) => c.name?.toLowerCase().trim() === inv.articulo?.Nombre?.toLowerCase().trim());
      const rawImg = catProd?.imagenPortada || catProd?.imagenes?.[0] || null;

      const CATEGORY_MAP: Record<number, string> = {
        1: 'smartphone',
        2: 'tablet',
        3: 'notebook',
        4: 'accesorio',
        5: 'repuesto'
      };
      const catId = inv.articulo?.modelo?.IdCategoriaArticulo;
      const catName = (catId && CATEGORY_MAP[catId]) || catProd?.categoria || 'General';

      return {
        id: inv.Id,
        producto: inv.articulo?.Nombre || 'Sin nombre',
        modelo: inv.articulo?.modelo?.Nombre || 'Sin modelo',
        categoria: catName,
        imei: inv.IMEI || '---',
        color: inv.color?.Nombre || 'N/A',
        stock: inv.Stock || 0,
        precioMenor: precioItem ? precioItem.ValorFinal : 0,
        precioMayor: precioItem?.ValorFinal ? Number(precioItem.ValorFinal) * 0.85 : 0,
        imagen: getFullImageUrl(rawImg),
      };
    },
    enabled: !itemState && !!targetId,
  });

  const item = itemState || itemData;

  if (isLoading) {
    return (
      <View style={[styles.container, styles.center]}>
        <ActivityIndicator size="large" color={COLORS.primary} />
        <Text style={{ marginTop: 12, color: COLORS.textSecondary }}>Cargando datos del producto...</Text>
      </View>
    );
  }

  if (!item) {
    return (
      <View style={[styles.container, styles.center]}>
        <Text style={{ marginBottom: 16, color: isError ? COLORS.error : COLORS.textPrimary }}>
          {isError ? 'Error al consultar el producto en el servidor.' : 'No se encontró el detalle del producto.'}
        </Text>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Text style={styles.backButtonText}>Volver al listado</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Ficha Técnica #{item.id}</Text>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Text style={styles.backButtonText}>Volver</Text>
        </TouchableOpacity>
      </View>

      {item.imagen ? (
        <View style={styles.imageContainer}>
          <Image source={{ uri: item.imagen }} style={styles.productImage} resizeMode="contain" />
        </View>
      ) : null}

      <View style={styles.card}>
        <Text style={styles.sectionTitle}>Dispositivo / Hardware</Text>
        <Text style={styles.label}>Nombre del Equipo</Text>
        <Text style={styles.valueLarge}>{item.producto}</Text>
        <Text style={styles.subValue}>{item.modelo}</Text>

        <View style={styles.row}>
          <View style={styles.column}>
            <Text style={styles.label}>Categoría</Text>
            <Text style={styles.value}>🏷️ {item.categoria ? item.categoria.charAt(0).toUpperCase() + item.categoria.slice(1) : 'General'}</Text>
          </View>
          <View style={styles.column}>
            <Text style={styles.label}>Color</Text>
            <Text style={styles.value}>🎨 {item.color || 'N/A'}</Text>
          </View>
        </View>

        <View style={styles.row}>
          <View style={styles.column}>
            <Text style={styles.label}>IMEI</Text>
            <Text style={styles.valueMono}>{item.imei || '---'}</Text>
          </View>
          <View style={styles.column}>
            <Text style={styles.label}>Stock Disponible</Text>
            <Text style={[styles.value, { color: item.stock > 0 ? COLORS.success : COLORS.error }]}>
              {item.stock} unidades
            </Text>
          </View>
        </View>
      </View>

      <View style={styles.card}>
        <Text style={styles.sectionTitle}>Valores de Mercado (USD)</Text>
        <View style={styles.row}>
          <View style={styles.column}>
            <Text style={styles.label}>Mayorista</Text>
            <Text style={styles.value}>U$S {item.precioMayor ? Number(item.precioMayor).toFixed(2) : (Number(item.precioMenor) * 0.85).toFixed(2)}</Text>
          </View>
          <View style={styles.column}>
            <Text style={styles.labelFinal}>Precio Público Final</Text>
            <Text style={styles.valueFinal}>U$S {Number(item.precioMenor).toFixed(2)}</Text>
          </View>
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background, padding: 16 },
  center: { justifyContent: 'center', alignItems: 'center' },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 },
  headerTitle: { fontSize: TYPOGRAPHY.sizes.h4, fontWeight: 'bold', color: COLORS.textPrimary },
  backButton: { backgroundColor: COLORS.divider, paddingHorizontal: 16, paddingVertical: 8, borderRadius: SPACING.smallRadius },
  backButtonText: { fontWeight: 'bold', color: COLORS.textPrimary },
  imageContainer: {
    backgroundColor: COLORS.paper,
    borderRadius: SPACING.borderRadius,
    padding: 16,
    marginBottom: 16,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: COLORS.divider,
    ...SHADOWS.lift
  },
  productImage: {
    width: '100%',
    height: 180,
  },
  card: { backgroundColor: COLORS.paper, padding: 16, borderRadius: SPACING.borderRadius, marginBottom: 16, borderWidth: 1, borderColor: COLORS.divider, ...SHADOWS.lift },
  sectionTitle: { fontSize: 12, fontWeight: 'bold', color: COLORS.textSecondary, textTransform: 'uppercase', marginBottom: 12 },
  label: { fontSize: 10, fontWeight: 'bold', color: COLORS.textDisabled, textTransform: 'uppercase', marginTop: 8 },
  valueLarge: { fontSize: TYPOGRAPHY.sizes.h3, fontWeight: '900', color: COLORS.textPrimary },
  subValue: { fontSize: 14, color: COLORS.textSecondary, marginBottom: 12 },
  row: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 8, flexWrap: 'wrap', gap: 8 },
  column: { flex: 1, minWidth: 100 },
  valueMono: { fontSize: 16, fontFamily: TYPOGRAPHY.mono, color: COLORS.primary, fontWeight: 'bold' },
  value: { fontSize: 14, fontWeight: 'bold', color: COLORS.textPrimary },
  labelFinal: { fontSize: 10, fontWeight: 'bold', color: COLORS.success, textTransform: 'uppercase', marginTop: 8 },
  valueFinal: { fontSize: TYPOGRAPHY.sizes.h3, fontWeight: '900', color: COLORS.success }
});
