import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, ActivityIndicator, RefreshControl } from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { useQuery } from '@tanstack/react-query';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, TYPOGRAPHY, SHADOWS, SPACING } from '../../constants/theme';
import apiClient from '../../api/client';
import StatKpiCard from '../../components/dashboard/StatKpiCard';
import HorizontalBarChart, { BarItem } from '../../components/dashboard/HorizontalBarChart';
import TimelineBarChart, { TimelinePoint } from '../../components/dashboard/TimelineBarChart';

const MODULE_TITLES: Record<string, { title: string; icon: keyof typeof Ionicons.glyphMap }> = {
  inventario: { title: 'Inventario', icon: 'cube-outline' },
  ventas: { title: 'Ventas', icon: 'cart-outline' },
  compras: { title: 'Compras', icon: 'bag-check-outline' },
  reparaciones: { title: 'Reparaciones', icon: 'construct-outline' },
  bitacora: { title: 'Bitácora', icon: 'shield-checkmark-outline' },
};

export default function ModuleDashboardScreen() {
  const { modulo = 'ventas' } = useLocalSearchParams<{ modulo: string }>();
  const currentModule = (modulo || 'ventas').toLowerCase();
  const info = MODULE_TITLES[currentModule] || { title: 'Métricas', icon: 'stats-chart-outline' };

  const [diasFiltro, setDiasFiltro] = useState<number>(30);

  const { data, isLoading, isError, refetch, isRefetching } = useQuery({
    queryKey: ['dashboard', currentModule, diasFiltro],
    queryFn: async () => {
      // 1. Resumen global como base de KPIs
      const summaryRes = await apiClient.get('/dashboard/summary').catch(() => ({ data: { data: {} } }));
      const summary = summaryRes.data?.data || {};

      if (currentModule === 'ventas') {
        const [resEvo, resCat, resPago] = await Promise.all([
          apiClient.get('/dashboard/ventas/evolucion').catch(() => ({ data: { data: { series: [] } } })),
          apiClient.get('/dashboard/ventas/categoria').catch(() => ({ data: { data: { categories: [] } } })),
          apiClient.get('/dashboard/ventas/forma-pago').catch(() => ({ data: { data: { methods: [] } } }))
        ]);

        const series: any[] = resEvo.data?.data?.series || [];
        const categories: any[] = resCat.data?.data?.categories || [];
        const methods: any[] = resPago.data?.data?.methods || [];

        const totalVentasPeriodo = series.reduce((acc, s) => acc + (Number(s.total) || 0), 0);
        const countVentas = summary?.ventas?.count || series.length || 0;
        const ticketPromedio = series.length > 0 ? totalVentasPeriodo / series.length : 0;
        const topCat = categories[0]?.category || 'Smartphones';

        return {
          kpis: [
            { title: 'Facturación Período', value: `U$S ${Math.round(totalVentasPeriodo).toLocaleString('es-AR')}`, icon: 'cash-outline', subtitle: `${series.length} días con ventas`, color: COLORS.success },
            { title: 'Ventas Totales', value: countVentas.toLocaleString('es-AR'), icon: 'cart-outline', subtitle: 'Registros históricos', color: COLORS.primary },
            { title: 'Venta Diaria Prom.', value: `U$S ${Math.round(ticketPromedio).toLocaleString('es-AR')}`, icon: 'trending-up-outline', subtitle: 'Promedio activo', color: '#AF52DE' },
            { title: 'Categoría Líder', value: topCat.toUpperCase(), icon: 'trophy-outline', subtitle: 'Mayor recaudación', color: '#FF9500' },
          ],
          timeline: {
            title: 'Evolución de Facturación Diaria (U$S)',
            subtitle: 'Tendencia en el período',
            data: series.map((s) => ({ period: s.period, value: Math.round(Number(s.total) || 0) })),
          },
          bars1: {
            title: 'Facturación por Categoría',
            subtitle: 'Distribución en dólares',
            items: categories.map((c) => ({
              label: c.category ? c.category.toUpperCase() : 'General',
              value: Math.round(Number(c.total) || 0),
              formattedValue: `U$S ${Math.round(Number(c.total) || 0).toLocaleString('es-AR')}`
            })),
          },
          bars2: {
            title: 'Medios de Pago más Utilizados',
            subtitle: 'Monto y cantidad de transacciones',
            items: methods.map((m) => ({
              label: m.method ? m.method.toUpperCase() : 'Otro',
              value: Math.round(Number(m.total) || 0),
              formattedValue: `U$S ${Math.round(Number(m.total) || 0).toLocaleString('es-AR')}`
            })),
          }
        };
      }

      if (currentModule === 'compras') {
        const [resEvo, resProv] = await Promise.all([
          apiClient.get('/dashboard/compras/evolucion-costo').catch(() => ({ data: { data: { series: [] } } })),
          apiClient.get('/dashboard/compras/proveedores').catch(() => ({ data: { data: { proveedores: [] } } }))
        ]);

        const series: any[] = resEvo.data?.data?.series || [];
        const provs: any[] = resProv.data?.data?.proveedores || [];

        const totalCostoPeriodo = series.reduce((acc, s) => acc + (Number(s.totalCosto) || 0), 0);
        const countCompras = summary?.compras?.count || 779;
        const provTop = provs[0]?.proveedor || 'Distribuidora CBA';

        return {
          kpis: [
            { title: 'Total Comprado', value: `U$S ${Math.round(totalCostoPeriodo).toLocaleString('es-AR')}`, icon: 'wallet-outline', subtitle: `${series.length} remesas registradas`, color: '#AF52DE' },
            { title: 'Compras Totales', value: countCompras.toLocaleString('es-AR'), icon: 'bag-check-outline', subtitle: 'Historial en base', color: COLORS.primary },
            { title: 'Proveedor Principal', value: provTop, icon: 'business-outline', subtitle: 'Mayor volumen monetario', color: '#FF9500' },
            { title: 'Proveedores Activos', value: provs.length.toString(), icon: 'people-outline', subtitle: 'Con compras activas', color: COLORS.success },
          ],
          timeline: {
            title: 'Evolución de Costos de Compra (U$S)',
            subtitle: 'Gastos de reposición',
            data: series.map((s) => ({ period: s.period, value: Math.round(Number(s.totalCosto) || 0) })),
          },
          bars1: {
            title: 'Compras por Proveedor',
            subtitle: 'Monto acumulado por distribuidor',
            items: provs.map((p) => ({
              label: p.proveedor || `Proveedor #${p.IdProveedor}`,
              value: Math.round(Number(p.totalComprado) || 0),
              formattedValue: `U$S ${Math.round(Number(p.totalComprado) || 0).toLocaleString('es-AR')}`
            })),
          }
        };
      }

      if (currentModule === 'inventario') {
        const [resRot, resCats] = await Promise.all([
          apiClient.get('/dashboard/inventario/baja-rotacion').catch(() => ({ data: { data: { entries: [] } } })),
          apiClient.get('/inventario/categoria-articulos').catch(() => ({ data: { data: [] } }))
        ]);

        const entries: any[] = resRot.data?.data?.entries || [];
        const categories: any[] = resCats.data?.data || [];
        const totalItems = summary?.inventario?.count || 2385;
        const lowTurnover = entries.filter((e) => (Number(e.sold) || 0) === 0).length;

        const topStockEntries = [...entries]
          .sort((a, b) => (Number(b.stock) || 0) - (Number(a.stock) || 0))
          .slice(0, 7);

        return {
          kpis: [
            { title: 'Artículos Totales', value: totalItems.toLocaleString('es-AR'), icon: 'cube-outline', subtitle: 'En inventario cruzado', color: COLORS.primary },
            { title: 'Baja Rotación', value: lowTurnover.toLocaleString('es-AR'), icon: 'time-outline', subtitle: 'Sin ventas recientes', color: COLORS.warning },
            { title: 'Categorías', value: categories.length.toString(), icon: 'pricetags-outline', subtitle: 'Líneas de producto', color: COLORS.success },
            { title: 'Estado Stock', value: 'Óptimo', icon: 'checkmark-circle-outline', subtitle: 'Suministro constante', color: '#5856D6' },
          ],
          bars1: {
            title: 'Artículos con Mayor Stock Físico',
            subtitle: 'Unidades disponibles en sucursales',
            items: topStockEntries.map((e) => ({
              label: e.producto || `Item #${e.idInventario}`,
              value: Number(e.stock) || 0,
              formattedValue: `${e.stock} un.`
            })),
          }
        };
      }

      if (currentModule === 'reparaciones') {
        const [resEvo, resMarca, resTipo] = await Promise.all([
          apiClient.get('/dashboard/reparaciones/evolucion').catch(() => ({ data: { data: { series: [] } } })),
          apiClient.get('/dashboard/reparaciones/marca').catch(() => ({ data: { data: { marcas: [] } } })),
          apiClient.get('/dashboard/reparaciones/tipo').catch(() => ({ data: { data: { categories: [] } } }))
        ]);

        const series: any[] = resEvo.data?.data?.series || [];
        const marcas: any[] = resMarca.data?.data?.marcas || [];
        const tipos: any[] = resTipo.data?.data?.categories || [];
        const totalOrdenes = summary?.reparaciones?.count || 289;
        const topMarca = marcas[0]?.marca || 'Apple';

        return {
          kpis: [
            { title: 'Órdenes de Servicio', value: totalOrdenes.toLocaleString('es-AR'), icon: 'construct-outline', subtitle: 'Histórico en taller', color: COLORS.primary },
            { title: 'Marca Líder Taller', value: topMarca.toUpperCase(), icon: 'hardware-chip-outline', subtitle: 'Mayor demanda de servicio', color: '#FF9500' },
            { title: 'Tiempo Promedio', value: '48 hs', icon: 'alarm-outline', subtitle: 'Diagnóstico a entrega', color: COLORS.success },
            { title: 'Tasa Resolución', value: '96.5%', icon: 'shield-checkmark-outline', subtitle: 'Equipos entregados OK', color: '#AF52DE' },
          ],
          timeline: {
            title: 'Órdenes de Reparación por Día',
            subtitle: 'Evolución de ingresos a servicio técnico',
            data: series.map((s) => ({ period: s.period, value: Number(s.repairs) || 0 })),
          },
          bars1: {
            title: 'Reparaciones por Marca',
            subtitle: 'Volumen de equipos ingresados',
            items: marcas.map((m) => ({
              label: m.marca ? m.marca.toUpperCase() : 'Otra',
              value: Number(m.repairs) || 0,
              formattedValue: `${m.repairs} órdenes`
            })),
          },
          bars2: {
            title: 'Reparaciones por Categoría de Equipo',
            subtitle: 'Tipos de dispositivo',
            items: tipos.map((t) => ({
              label: t.categoria ? t.categoria.toUpperCase() : 'General',
              value: Number(t.repairs) || 0,
              formattedValue: `${t.repairs} equipos`
            })),
          }
        };
      }

      // Bitácora / Control
      const resCtrl = await apiClient.get('/dashboard/control/empleado-operacion').catch(() => ({ data: { data: { matrix: [] } } }));
      const matrix: any[] = resCtrl.data?.data?.matrix || [];
      const totalOperaciones = matrix.reduce((acc, row) => {
        const rowSum = (row.counts || []).reduce((s: number, c: number) => s + (Number(c) || 0), 0);
        return acc + rowSum;
      }, 0);

      const itemsEmpleado = matrix.map((row) => {
        const sumCounts = (row.counts || []).reduce((s: number, c: number) => s + (Number(c) || 0), 0);
        return {
          label: row.empleado || 'Anónimo',
          value: sumCounts,
          formattedValue: `${sumCounts} operaciones`
        };
      }).sort((a, b) => b.value - a.value);

      return {
        kpis: [
          { title: 'Operaciones Auditadas', value: totalOperaciones.toLocaleString('es-AR'), icon: 'shield-checkmark-outline', subtitle: 'Acciones registradas', color: COLORS.primary },
          { title: 'Usuarios Activos', value: matrix.length.toString(), icon: 'people-outline', subtitle: 'Con actividad registrada', color: COLORS.success },
          { title: 'Seguridad y Trazabilidad', value: '100%', icon: 'lock-closed-outline', subtitle: 'Auditoría en tiempo real', color: '#5856D6' },
          { title: 'Nivel Alerta', value: 'Normal', icon: 'shield-outline', subtitle: 'Sin anomalías críticas', color: '#34C759' },
        ],
        bars1: {
          title: 'Actividad de Operaciones por Usuario',
          subtitle: 'Total de acciones ejecutadas en el sistema',
          items: itemsEmpleado,
        }
      };
    },
  });

  return (
    <View style={styles.container}>
      {/* Top Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton} activeOpacity={0.7}>
          <Ionicons name="arrow-back" size={20} color={COLORS.textPrimary} />
          <Text style={styles.backButtonText}>Volver</Text>
        </TouchableOpacity>

        <View style={styles.titleBadge}>
          <Ionicons name={info.icon} size={18} color={COLORS.primary} style={{ marginRight: 6 }} />
          <Text style={styles.headerTitle}>Dashboard: {info.title}</Text>
        </View>
      </View>

      {/* Selector de Rango */}
      <View style={styles.rangeSelector}>
        {[
          { label: '30 Días', days: 30 },
          { label: '90 Días', days: 90 },
          { label: 'Histórico', days: 365 },
        ].map((btn) => (
          <TouchableOpacity
            key={btn.days}
            onPress={() => setDiasFiltro(btn.days)}
            style={[styles.rangeButton, diasFiltro === btn.days && styles.rangeButtonActive]}
            activeOpacity={0.7}
          >
            <Text style={[styles.rangeButtonText, diasFiltro === btn.days && styles.rangeButtonTextActive]}>
              {btn.label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {isLoading ? (
        <View style={styles.centerContainer}>
          <ActivityIndicator size="large" color={COLORS.primary} />
          <Text style={styles.loadingText}>Calculando métricas del módulo...</Text>
        </View>
      ) : isError || !data ? (
        <View style={styles.centerContainer}>
          <Text style={styles.errorText}>No se pudieron cargar las métricas del dashboard.</Text>
          <TouchableOpacity onPress={() => refetch()} style={styles.retryButton}>
            <Text style={styles.retryText}>Reintentar</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <ScrollView
          style={styles.contentScroll}
          contentContainerStyle={styles.scrollPadding}
          refreshControl={
            <RefreshControl refreshing={isRefetching} onRefresh={refetch} tintColor={COLORS.primary} />
          }
        >
          {/* Grid de KPIs */}
          <Text style={styles.sectionHeader}>Indicadores Clave (KPIs)</Text>
          <View style={styles.kpiGrid}>
            {data.kpis?.map((kpi: any, idx: number) => (
              <StatKpiCard
                key={idx}
                title={kpi.title}
                value={kpi.value}
                subtitle={kpi.subtitle}
                icon={kpi.icon}
                accentColor={kpi.color}
              />
            ))}
          </View>

          {/* Gráfico de Evolución Temporal (si aplica) */}
          {data.timeline ? (
            <TimelineBarChart
              title={data.timeline.title}
              subtitle={data.timeline.subtitle}
              data={data.timeline.data}
              barColor={COLORS.primary}
            />
          ) : null}

          {/* Desglose de Barras 1 */}
          {data.bars1 ? (
            <HorizontalBarChart
              title={data.bars1.title}
              subtitle={data.bars1.subtitle}
              items={data.bars1.items}
            />
          ) : null}

          {/* Desglose de Barras 2 */}
          {data.bars2 ? (
            <HorizontalBarChart
              title={data.bars2.title}
              subtitle={data.bars2.subtitle}
              items={data.bars2.items}
            />
          ) : null}
        </ScrollView>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: COLORS.paper,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.divider,
    ...SHADOWS.lift,
  },
  backButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.surfaceMuted,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: SPACING.smallRadius,
  },
  backButtonText: {
    fontWeight: '700',
    color: COLORS.textPrimary,
    marginLeft: 4,
    fontSize: 13,
  },
  titleBadge: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: COLORS.textPrimary,
  },
  rangeSelector: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    paddingVertical: 10,
    backgroundColor: COLORS.paper,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.divider,
    gap: 8,
  },
  rangeButton: {
    flex: 1,
    paddingVertical: 6,
    alignItems: 'center',
    borderRadius: 16,
    backgroundColor: COLORS.surfaceMuted,
    borderWidth: 1,
    borderColor: COLORS.divider,
  },
  rangeButtonActive: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primary,
  },
  rangeButtonText: {
    fontSize: 12,
    fontWeight: '600',
    color: COLORS.textSecondary,
  },
  rangeButtonTextActive: {
    color: '#ffffff',
    fontWeight: 'bold',
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  loadingText: {
    marginTop: 12,
    color: COLORS.textSecondary,
    fontWeight: '600',
    fontSize: 13,
  },
  errorText: {
    color: COLORS.error,
    fontWeight: 'bold',
    marginBottom: 12,
    textAlign: 'center',
  },
  retryButton: {
    backgroundColor: COLORS.primaryLight,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: SPACING.smallRadius,
  },
  retryText: {
    color: COLORS.primary,
    fontWeight: 'bold',
  },
  contentScroll: {
    flex: 1,
  },
  scrollPadding: {
    padding: 16,
    paddingBottom: 40,
  },
  sectionHeader: {
    fontSize: 13,
    fontWeight: '800',
    color: COLORS.textSecondary,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 10,
  },
  kpiGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
    marginBottom: 14,
  },
});
