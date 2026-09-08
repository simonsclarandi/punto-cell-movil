import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Dimensions } from 'react-native';
import { COLORS, TYPOGRAPHY, SHADOWS, SPACING } from '../../constants/theme';

const { width } = Dimensions.get('window');

const Sidebar = ({ moduloActual, onNavigate, onClose }) => {
  const menuItems = [
    { id: 'inventario', label: '📦 Inventario' },
    { id: 'compras', label: '🛒 Compras' },
    { id: 'ventas', label: '📈 Ventas' },
    { id: 'reparaciones', label: '🔧 Reparaciones' },
    { id: 'bitacora', label: '📋 Bitácora' },
  ];

  return (
    <View style={styles.overlay}>
      {/* Fondo oscuro translúcido que cierra el menú al tocarlo */}
      <TouchableOpacity style={styles.backdrop} onPress={onClose} activeOpacity={1} />
      
      {/* Contenedor del Menú */}
      <View style={styles.menu}>
        <View style={styles.header}>
          <Text style={styles.title}>Punto Cell</Text>
          <Text style={styles.subtitle}>Panel de Administración</Text>
        </View>

        <View style={styles.links}>
          {menuItems.map((item) => (
            <TouchableOpacity
              key={item.id}
              style={[styles.menuItem, moduloActual === item.id && styles.menuItemActive]}
              onPress={() => {
                onNavigate(item.id);
                onClose(); // Cierra el menú al seleccionar una opción
              }}
            >
              <Text style={[styles.menuText, moduloActual === item.id && styles.menuTextActive]}>
                {item.label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  overlay: { position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, flexDirection: 'row', zIndex: 1000 },
  backdrop: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)' },
  menu: { position: 'absolute', top: 0, bottom: 0, left: 0, width: '75%', backgroundColor: COLORS.paper, ...SHADOWS.liftPop },
  header: { padding: 24, backgroundColor: COLORS.primaryDark, paddingTop: 60, borderBottomWidth: 1, borderBottomColor: COLORS.primary },
  title: { color: COLORS.paper, fontSize: TYPOGRAPHY.sizes.h3, fontWeight: 'bold' },
  subtitle: { color: COLORS.primaryLight, fontSize: TYPOGRAPHY.sizes.body, marginTop: 4, textTransform: 'uppercase' },
  links: { paddingTop: 10 },
  menuItem: { paddingVertical: 16, paddingHorizontal: 24, borderBottomWidth: 1, borderBottomColor: COLORS.surfaceMuted },
  menuItemActive: { backgroundColor: COLORS.accentSoft, borderRightWidth: 4, borderRightColor: COLORS.primary },
  menuText: { fontSize: TYPOGRAPHY.sizes.h6, color: COLORS.textSecondary, fontWeight: '500' },
  menuTextActive: { color: COLORS.primary, fontWeight: 'bold' },
});

export default Sidebar;