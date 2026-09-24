import React, { useState } from 'react';
import { View, FlatList, ActivityIndicator, Text, StyleSheet, TouchableOpacity, RefreshControl, TextInput, Switch } from 'react-native';
import { useQuery } from '@tanstack/react-query';
import { COLORS, TYPOGRAPHY, SPACING, SHADOWS } from '../../constants/theme';
import InventoryCard from './InventoryCard';
import { useNavigationStore } from '../../store/useNavigationStore';
import { InventoryItem } from './InventoryDetail';
import apiClient from '../../api/client';

interface ExtendedInventoryItem extends InventoryItem {
  precioMayor: number;
}

const fetchInventario = async (): Promise<ExtendedInventoryItem[]> => {
  try {
    const [resInventario, resPrecios] = await Promise.all([
      apiClient.get('/inventario/inventarios'),
      apiClient.get('/precios/precios-articulos') 
    ]);
    
    const inventarioBase = resInventario.data.data; 
    const preciosBase = resPrecios.data.data;

    return inventarioBase.map((item: any) => {
      const precioItem = preciosBase.find(
        (precio: any) => precio.IdInventario === item.Id 
      );

      return {
        id: item.Id,
        producto: item.articulo ? item.articulo.Nombre : 'Sin nombre',
        modelo: item.articulo?.modelo ? item.articulo.modelo.Nombre : 'Sin modelo',
        imei: item.IMEI || 'N/A',
        color: item.color ? item.color.Nombre : 'N/A', 
        stock: item.Stock || 0,
        precioMenor: precioItem ? precioItem.ValorFinal : 0, 
        precioMayor: precioItem?.ValorMayorista || (precioItem ? precioItem.ValorFinal * 0.85 : 0), 
        imagen: 'https://picsum.photos/150', 
      };
    });
  } catch (error) {
    console.error("Error al traer el inventario cruzado:", error);
    throw error;
  }
};

export default function InventoryList() {
  const setItemSeleccionado = useNavigationStore(state => state.setItemSeleccionado);
  const setVistaActual = useNavigationStore(state => state.setVistaActual);

  const [busqueda, setBusqueda] = useState('');
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
    
    return coincideBusqueda && coincideStock;
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
              setItemSeleccionado(item);
              setVistaActual('detalle');
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
    marginBottom: 12,
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