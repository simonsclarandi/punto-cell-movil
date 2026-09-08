import React, { useState } from 'react';
import { StyleSheet, View, Text, ScrollView, TouchableOpacity } from 'react-native';
import { SafeAreaView, SafeAreaProvider } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';

import { COLORS, TYPOGRAPHY, SHADOWS, SPACING } from './constants/theme';

// Componentes Estructurales
import Sidebar from './components/layout/Sidebar';
import Header from './components/layout/Header';

// Componentes de UI (Tarjetas)
import InventoryCard from './components/inventario/InventoryCard';
import PurchaseCard from './components/compras/PurchaseCard';

import SaleCard from './components/ventas/SaleCard';
import SaleDetail from './components/ventas/SaleDetail';

import RepairCard from './components/reparaciones/RepairCard';

import LogCard from './components/bitacora/LogCard';

export default function App() {
  const [moduloActual, setModuloActual] = useState('inventario');
  const [menuAbierto, setMenuAbierto] = useState(false);
  const [vistaActual, setVistaActual] = useState('lista');
  const [itemSeleccionado, setItemSeleccionado] = useState(null);

  // --------------------------------------------------------
  // MÓDULO 1: INVENTARIO (Pronto a moverse a /screens)
  // --------------------------------------------------------
  const renderInventario = () => (
    <ScrollView style={styles.container}>
      {mockInventario.map((item) => (
        <InventoryCard 
          key={item.id} producto={item.producto} modelo={item.modelo} 
          stock={item.stock} precio={item.precioMenor} imagen={item.imagen} 
        />
      ))}
    </ScrollView>
  );

  // --------------------------------------------------------
  // MÓDULO 2: COMPRAS (Pronto a moverse a /screens)
  // --------------------------------------------------------
  const renderCompras = () => (
    <ScrollView style={styles.container}>
      <View style={styles.listContainer}>
        {mockCompras.map((compra) => (
          <PurchaseCard 
            key={compra.id} id={compra.id} fecha={compra.fecha} proveedor={compra.proveedor} 
            total={compra.total} saldo={compra.saldo} condicion={compra.condicion} estadoPago={compra.estadoPago} 
          />
        ))}
      </View>
    </ScrollView>
  );

  // --------------------------------------------------------
  // MÓDULOS EN CONSTRUCCIÓN
  // --------------------------------------------------------
  const renderConstruccion = (nombre) => (
    <View style={styles.centerContainer}>
      <Text style={styles.construccionText}>Módulo de {nombre} en desarrollo</Text>
      <Text style={styles.construccionSub}>Se integrará en las próximas unidades.</Text>
    </View>
  );

  const renderReparaciones = () => {
    const activas = mockReparaciones.length;
    const terminados = mockReparaciones.filter(r => r.estado === 'terminado').length;

    return (
      <ScrollView style={styles.container}>
        <View style={{ flexDirection: 'row', gap: 12, marginBottom: 16 }}>
          <View style={{ flex: 1, backgroundColor: 'white', padding: 12, borderRadius: 8, borderWidth: 1, borderColor: '#e2e8f0' }}>
            <Text style={{ fontSize: 10, color: '#64748b', fontWeight: 'bold', textTransform: 'uppercase' }}>Órdenes Activas</Text>
            <Text style={{ fontSize: 18, fontWeight: 'bold', color: '#0f172a' }}>{activas}</Text>
          </View>
          <View style={{ flex: 1, backgroundColor: 'white', padding: 12, borderRadius: 8, borderWidth: 1, borderColor: '#f59e0b' }}>
            <Text style={{ fontSize: 10, color: '#64748b', fontWeight: 'bold', textTransform: 'uppercase' }}>Para Entregar</Text>
            <Text style={{ fontSize: 18, fontWeight: 'bold', color: '#f59e0b' }}>{terminados} equipos</Text>
          </View>
        </View>

        <View style={styles.listContainer}>
          {mockReparaciones.map((orden) => (
            <RepairCard 
              key={orden.id} id={orden.id} fecha={orden.fecha} 
              cliente={orden.cliente} dispositivo={orden.dispositivo} 
              falla={orden.falla} estado={orden.estado} 
            />
          ))}
        </View>
      </ScrollView>
    );
  };

  const renderVentas = () => {
    const facturado = mockVentas.reduce((acc, v) => acc + v.total, 0);
    const pendientes = mockVentas.filter(v => !v.estadoPago).length;

    return (
      <ScrollView style={styles.container}>
        <View style={{ flexDirection: 'row', gap: 12, marginBottom: 16 }}>
          <View style={{ flex: 1, backgroundColor: 'white', padding: 12, borderRadius: 8, borderWidth: 1, borderColor: '#e2e8f0' }}>
            <Text style={{ fontSize: 10, color: '#64748b', fontWeight: 'bold', textTransform: 'uppercase' }}>Facturado</Text>
            <Text style={{ fontSize: 18, fontWeight: 'bold', color: '#0f172a' }}>U$S {facturado}</Text>
          </View>
          <View style={{ flex: 1, backgroundColor: 'white', padding: 12, borderRadius: 8, borderWidth: 1, borderColor: '#f59e0b' }}>
            <Text style={{ fontSize: 10, color: '#64748b', fontWeight: 'bold', textTransform: 'uppercase' }}>Por Cobrar</Text>
            <Text style={{ fontSize: 18, fontWeight: 'bold', color: '#f59e0b' }}>{pendientes} tickets</Text>
          </View>
        </View>

        <View style={styles.listContainer}>
          {mockVentas.map((venta) => (
            <TouchableOpacity key={venta.id} onPress={() => { setItemSeleccionado(venta); setVistaActual('detalle_venta'); }} activeOpacity={0.7}>
              <SaleCard id={venta.id} fecha={venta.fecha} cliente={venta.cliente} vendedor={venta.vendedor} total={venta.total} estadoPago={venta.estadoPago} />
            </TouchableOpacity>
          ))}
        </View>
      </ScrollView>
    );
  };

  const renderBitacora = () => {
    const totalRegistros = mockBitacora.length;
    const accesosFallidos = mockBitacora.filter(l => l.accion.toLowerCase().includes('fallido')).length;

    return (
      <ScrollView style={styles.container}>
        <View style={{ flexDirection: 'row', gap: 12, marginBottom: 16 }}>
          <View style={{ flex: 1, backgroundColor: 'white', padding: 12, borderRadius: 8, borderWidth: 1, borderColor: '#e2e8f0' }}>
            <Text style={{ fontSize: 10, color: '#64748b', fontWeight: 'bold', textTransform: 'uppercase' }}>Registros Hoy</Text>
            <Text style={{ fontSize: 18, fontWeight: 'bold', color: '#0f172a' }}>{totalRegistros}</Text>
          </View>
          <View style={{ flex: 1, backgroundColor: 'white', padding: 12, borderRadius: 8, borderWidth: 1, borderColor: '#ef4444' }}>
            <Text style={{ fontSize: 10, color: '#64748b', fontWeight: 'bold', textTransform: 'uppercase' }}>Accesos Fallidos</Text>
            <Text style={{ fontSize: 18, fontWeight: 'bold', color: '#ef4444' }}>{accesosFallidos}</Text>
          </View>
        </View>

        <View style={styles.listContainer}>
          {mockBitacora.map((log) => (
            <LogCard 
              key={log.id} fecha={log.fecha} sucursal={log.sucursal} 
              usuario={log.usuario} accion={log.accion} 
              detalle={log.detalle} ip={log.ip} 
            />
          ))}
        </View>
      </ScrollView>
    );
  };

  const getContenido = () => {
    if (vistaActual === 'detalle') return <InventoryDetail item={itemSeleccionado} onBack={() => setVistaActual('lista')} />;
    if (vistaActual === 'detalle_venta') return <SaleDetail item={itemSeleccionado} onBack={() => setVistaActual('lista')} />;
    
    switch (moduloActual) {
      case 'inventario': return renderInventario();
      case 'compras': return renderCompras();
      case 'ventas': return renderVentas();
      case 'reparaciones': return renderReparaciones();
      case 'bitacora': return renderBitacora();
      default: return renderInventario();
    }
  };

  const titulos = {
    inventario: 'Gestión de Inventario',
    compras: 'Historial de Compras',
    ventas: 'Registro de Ventas',
    reparaciones: 'Servicio Técnico',
    bitacora: 'Bitácora de Sistema'
  };

  return (
    <SafeAreaProvider>
      <SafeAreaView style={styles.safeArea}>
        <StatusBar style="dark" />
        
        {/* Cabecera Dinámica */}
        <Header 
          titulo={titulos[moduloActual]} 
          onMenuPress={() => setMenuAbierto(true)} 
        />

        {/* Contenido Principal */}
        <View style={styles.content}>
          {getContenido()}
        </View>

        {/* Menú Lateral Superpuesto */}
        {menuAbierto && (
          <Sidebar 
            moduloActual={moduloActual} 
            onNavigate={setModuloActual} 
            onClose={() => setMenuAbierto(false)} 
          />
        )}
      </SafeAreaView>
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: COLORS.background },
  content: { flex: 1 },
  container: { flex: 1, padding: 16 },
  listContainer: { paddingBottom: 20 },
  centerContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 20 },
  construccionText: { fontSize: TYPOGRAPHY.sizes.h5, fontWeight: 'bold', color: COLORS.textSecondary, marginBottom: 8 },
  construccionSub: { fontSize: TYPOGRAPHY.sizes.body, color: COLORS.textDisabled, textAlign: 'center' }
});

// DATOS ESTÁTICOS (Temporalmente aquí, luego los sacaremos)
const mockInventario = [
  { id: 1, producto: 'iPhone 13 Pro', modelo: '256GB', color: 'Gold', imei: '358940183901235', stock: 5, precioMenor: 850, imagen: 'https://images.fravega.com/f500/5d1b62e26c82f4e43a138564c40c7aee.jpg' },
  { id: 2, producto: 'Samsung Galaxy S23 Ultra', modelo: '128GB', color: 'Phantom Black', imei: '351294857392018', stock: 0, precioMenor: 700, imagen: 'https://http2.mlstatic.com/D_NQ_NP_620906-MLA96419961344_102025-O.webp' },
];

const mockCompras = [
  { id: 1024, fecha: '2026-08-30', proveedor: 'Distribuidora Apple AR', total: 4500, saldo: 0, estadoPago: 3, condicion: 'Pagado' },
  { id: 1025, fecha: '2026-09-01', proveedor: 'Samsung Mayorista', total: 3200, saldo: 1500, estadoPago: 2, condicion: 'Pago Parcial' },
];

const mockVentas = [
  { id: 2001, fecha: '2026-09-04 10:30', cliente: 'María López', vendedor: 'Carlos', total: 850, estadoPago: true, detalle: [{ nombre: 'iPhone 13 Pro', cantidad: 1, subtotal: 850 }] },
  { id: 2002, fecha: '2026-09-04 14:15', cliente: 'Juan Pérez', vendedor: 'Ana', total: 1150, estadoPago: false, detalle: [{ nombre: 'Samsung S23 Ultra', cantidad: 1, subtotal: 700 }, { nombre: 'Motorola Edge 40', cantidad: 1, subtotal: 450 }] }
];

const mockReparaciones = [
  { id: 3001, fecha: '2026-09-02', cliente: 'Martín Gómez', dispositivo: 'Samsung Galaxy A54', falla: 'Cambio de módulo (pantalla rota)', estado: 'en reparación' },
  { id: 3002, fecha: '2026-09-03', cliente: 'Lucía Fernández', dispositivo: 'iPhone 11', falla: 'Cambio de batería', estado: 'terminado' },
  { id: 3003, fecha: '2026-09-04', cliente: 'Diego Molina', dispositivo: 'Motorola G20', falla: 'Pin de carga no funciona', estado: 'en espera' },
];

const mockBitacora = [
  { id: 4001, fecha: '04/09/2026 18:30:15', sucursal: 'Centro (Córdoba)', usuario: 'Carlos', accion: 'Venta registrada', detalle: 'Ticket #2001 generado con éxito por U$S 850.', ip: '192.168.1.5' },
  { id: 4002, fecha: '04/09/2026 18:05:10', sucursal: 'Norte (Córdoba)', usuario: 'Ana', accion: 'Acceso fallido', detalle: 'Intento de login con contraseña incorrecta.', ip: '181.45.22.10' },
  { id: 4003, fecha: '04/09/2026 17:50:00', sucursal: 'Global', usuario: 'Admin', accion: 'Actualización de Inventario', detalle: 'Se modificó el precio de Samsung Galaxy S23 Ultra.', ip: '192.168.1.2' },
  { id: 4004, fecha: '04/09/2026 09:00:12', sucursal: 'Centro (Córdoba)', usuario: 'Carlos', accion: 'Inició sesión', detalle: 'Login exitoso.', ip: '192.168.1.5' },
];