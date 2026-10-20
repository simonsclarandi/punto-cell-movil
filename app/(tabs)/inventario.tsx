import React, { useState } from 'react';
import { View, FlatList, ActivityIndicator, Text, StyleSheet, TouchableOpacity, RefreshControl, TextInput, Switch, ScrollView } from 'react-native';
import { useQuery } from '@tanstack/react-query';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, TYPOGRAPHY, SPACING, SHADOWS } from '../../constants/theme';
import InventoryCard from '../../components/inventario/InventoryCard';
import { useNavigationStore } from '../../store/useNavigationStore';
import { InventoryItem } from '../detalle/inventario/[id]';
import apiClient from '../../api/client';
import { getFullImageUrl } from '../../constants/images';
import { router } from 'expo-router';

interface ExtendedInventoryItem extends InventoryItem {
  precioMayor: number;
  categoria: string;
}

const CATEGORY_MAP: Record<number, string> = {
  1: 'smartphone',
  2: 'tablet',
  3: 'notebook',
  4: 'accesorio',
  5: 'repuesto'
};

const CATEGORIES = [
  { key: 'todas', label: 'Todos', icon: 'grid-outline' },
  { key: 'smartphone', label: 'Celulares', icon: 'phone-portrait-outline' },
  { key: 'tablet', label: 'Tablets', icon: 'tablet-portrait-outline' },
  { key: 'notebook', label: 'Notebooks', icon: 'laptop-outline' },
  { key: 'accesorio', label: 'Accesorios', icon: 'headset-outline' },
  { key: 'repuesto', label: 'Repuestos', icon: 'hardware-chip-outline' },
];

const fetchInventario = async (): Promise<ExtendedInventoryItem[]> => {
  try {
    // Consultamos inventarios, precios y catálogo público (con fotos reales de S3) en paralelo
    const [resInventario, resPrecios, resCatalogo] = await Promise.all([
      apiClient.get('/inventario/inventarios'),
      apiClient.get('/precios/precios-articulos'),
      apiClient.get('/catalogo/productos').catch(() => ({ data: { data: { productos: [] } } }))
    ]);
    
    const inventarioBase = resInventario.data?.data || []; 
    const preciosBase = resPrecios.data?.data || [];
    const catalogoProductos: any[] = resCatalogo.data?.data?.productos || [];

    // Mapeamos imágenes por ID de Inventario, Nombre de Modelo y Nombre de Artículo
    const catalogoById = new Map<number, string>();
    const catalogoByModel = new Map<string, string>();
    const catalogoByName = new Map<string, string>();

    catalogoProductos.forEach((prod) => {
      const imgPortada = prod.imagenPortada || (prod.imagenes && prod.imagenes[0]) || null;
      if (imgPortada) {
        catalogoById.set(Number(prod.id), imgPortada);
        if (prod.modelo) {
          catalogoByModel.set(prod.modelo.toLowerCase().trim(), imgPortada);
        }
        if (prod.name) {
          catalogoByName.set(prod.name.toLowerCase().trim(), imgPortada);
        }
      }
    });

    const resolveItemImage = (item: any): string => {
      // 1. Coincidencia directa por Id de Inventario
      const directMatch = catalogoById.get(item.Id);
      if (directMatch) return getFullImageUrl(directMatch);

      // 2. Coincidencia por Modelo de Artículo
      const modelName = item.articulo?.modelo?.Nombre?.toLowerCase()?.trim();
      if (modelName && catalogoByModel.has(modelName)) {
        return getFullImageUrl(catalogoByModel.get(modelName));
      }

      // 3. Coincidencia por Nombre de Artículo
      const artName = item.articulo?.Nombre?.toLowerCase()?.trim();
      if (artName && catalogoByName.has(artName)) {
        return getFullImageUrl(catalogoByName.get(artName));
      }

      return getFullImageUrl(null);
    };

    return inventarioBase.map((item: any) => {
      const precioItem = preciosBase.find(
        (precio: any) => precio.IdInventario === item.Id 
      );

      const idCat = item.articulo?.modelo?.IdCategoriaArticulo;
      const catSlug = (idCat && CATEGORY_MAP[idCat]) || 'otros';

      return {
        id: item.Id,
        producto: item.articulo ? item.articulo.Nombre : 'Sin nombre',
        modelo: item.articulo?.modelo ? item.articulo.modelo.Nombre : 'Sin modelo',
        categoria: catSlug,
        imei: item.IMEI || 'N/A',
        color: item.color ? item.color.Nombre : 'N/A', 
        stock: item.Stock || 0,
        precioMenor: precioItem ? precioItem.ValorFinal : 0, 
        precioMayor: precioItem?.ValorMayorista || (precioItem ? precioItem.ValorFinal * 0.85 : 0), 
        imagen: resolveItemImage(item), 
      };
    });
  } catch (error) {
    console.error("Error al traer el inventario cruzado:", error);
    throw error;
  }
};

export default function InventoryList() {
  // Ya no traemos setVistaActual, solo usamos setItemSeleccionado
  const setItemSeleccionado = useNavigationStore(state => state.setItemSeleccionado);

  const [busqueda, setBusqueda] = useState('');
  const [categoriaSeleccionada, setCategoriaSeleccionada] = useState('todas');
  const [mostrarAgotados, setMostrarAgotados] = useState(false);
  const [esMayorista, setEsMayorista] = useState(false);

  const { data, isLoading, isError, refetch, isRefetching } = useQuery({
    queryKey: ['inventario'],
    queryFn: fetchInventario,
  });

  const inventarioFiltrado = (data || []).filter(item => {
    const texto = busqueda.toLowerCase();
    const coincideBusqueda = 
      item.producto.toLowerCase().includes(texto) ||
      item.modelo.toLowerCase().includes(texto) ||
      (item.imei || '').toLowerCase().includes(texto);
      
    const coincideStock = mostrarAgotados ? item.stock === 0 : item.stock > 0;
    
    const coincideCategoria = 
      categoriaSeleccionada === 'todas' || 
      item.categoria.toLowerCase() === categoriaSeleccionada.toLowerCase();

    return coincideBusqueda && coincideStock && coincideCategoria;
  });

  if (isLoading) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color={COLORS.primary} />
        <Text style={styles.loadingText}>Cargando catálogo...</Text>
      </View>
    );
  }

  if (isError) {
    return (
      <View style={styles.centerContainer}>
        <Text style={{ color: COLORS.error }}>Error al cargar el inventario.</Text>
        <TouchableOpacity onPress={() => refetch()} style={styles.retryButton}>
          <Text style={styles.retryText}>Reintentar</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.filterContainer}>
        <TextInput
          style={styles.searchInput}
          placeholder="Buscar producto, modelo o IMEI..."
          placeholderTextColor={COLORS.textDisabled}
          value={busqueda}
          onChangeText={setBusqueda}
        />

        {/* Selector Horizontal de Categorías */}
        <ScrollView 
          horizontal 
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.categoryContainer}
        >
          {CATEGORIES.map((cat) => {
            const isSelected = categoriaSeleccionada === cat.key;
            return (
              <TouchableOpacity
                key={cat.key}
                onPress={() => setCategoriaSeleccionada(cat.key)}
                style={[
                  styles.categoryChip,
                  isSelected && styles.categoryChipSelected
                ]}
                activeOpacity={0.7}
              >
                <Ionicons 
                  name={cat.icon as any} 
                  size={15} 
                  color={isSelected ? '#ffffff' : COLORS.textSecondary} 
                  style={{ marginRight: 6 }}
                />
                <Text style={[
                  styles.categoryText,
                  isSelected && styles.categoryTextSelected
                ]}>
                  {cat.label}
                </Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>

        <View style={styles.switchesContainer}>
          <View style={styles.switchRow}>
            <Switch 
              value={mostrarAgotados} 
              onValueChange={setMostrarAgotados}
              trackColor={{ false: COLORS.divider, true: COLORS.primaryLight }}
              thumbColor={mostrarAgotados ? COLORS.primary : COLORS.textDisabled}
            />
            <Text style={styles.switchLabel}>Solo agotados</Text>
          </View>
          <View style={styles.switchRow}>
            <Switch 
              value={esMayorista} 
              onValueChange={setEsMayorista}
              trackColor={{ false: COLORS.divider, true: COLORS.primaryLight }}
              thumbColor={esMayorista ? COLORS.primary : COLORS.textDisabled}
            />
            <Text style={[styles.switchLabel, esMayorista && { color: COLORS.primary, fontWeight: 'bold' }]}>
              Precio mayorista
            </Text>
          </View>
        </View>
      </View>

      <FlatList
        data={inventarioFiltrado}
        keyExtractor={(item) => item.id.toString()}
        contentContainerStyle={styles.listPadding}
        ListEmptyComponent={
          <Text style={styles.emptyText}>No se encontraron productos con estos filtros.</Text>
        }
        renderItem={({ item }) => (
          <TouchableOpacity 
            activeOpacity={0.7} 
            onPress={() => {
              // Guardamos en Zustand y navegamos con Expo Router
              setItemSeleccionado(item);
              router.push(`/detalle/inventario/${item.id}`);
            }}
          >
            <InventoryCard 
              producto={item.producto} 
              modelo={item.modelo} 
              stock={item.stock} 
              precio={esMayorista ? item.precioMayor : item.precioMenor} 
              imagen={item.imagen} 
            />
          </TouchableOpacity>
        )}
        refreshControl={
          <RefreshControl 
            refreshing={isRefetching} 
            onRefresh={refetch}
            colors={[COLORS.primary]} 
            tintColor={COLORS.primary} 
          />
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  centerContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  loadingText: { marginTop: 10, color: COLORS.textSecondary, fontWeight: 'bold' },
  retryButton: { marginTop: 12, padding: 10, backgroundColor: COLORS.primaryLight, borderRadius: SPACING.smallRadius },
  retryText: { color: COLORS.primary, fontWeight: 'bold' },
  listPadding: { padding: 16, paddingBottom: 40 },
  filterContainer: {
    backgroundColor: COLORS.paper,
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.divider,
    ...SHADOWS.lift,
  },
  searchInput: {
    backgroundColor: COLORS.surfaceMuted,
    borderRadius: SPACING.smallRadius,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 14,
    color: COLORS.textPrimary,
    borderWidth: 1,
    borderColor: COLORS.divider,
    marginBottom: 8,
  },
  categoryContainer: {
    paddingVertical: 4,
    marginBottom: 10,
    gap: 8,
  },
  categoryChip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.surfaceMuted,
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: COLORS.divider,
    marginRight: 6,
  },
  categoryChipSelected: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primary,
  },
  categoryText: {
    fontSize: 13,
    fontWeight: '600',
    color: COLORS.textSecondary,
  },
  categoryTextSelected: {
    color: '#ffffff',
    fontWeight: 'bold',
  },
  switchesContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  switchRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  switchLabel: {
    fontSize: 12,
    color: COLORS.textSecondary,
  },
  emptyText: {
    textAlign: 'center',
    color: COLORS.textDisabled,
    marginTop: 20,
    fontSize: 14,
  }
});