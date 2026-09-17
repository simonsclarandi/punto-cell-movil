import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Platform } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, SHADOWS } from '../../constants/theme';
import { useNavigationStore } from '../../store/useNavigationStore';

type IconName = keyof typeof Ionicons.glyphMap;

interface MenuItem {
  id: string;
  label: string;
  icon: IconName;
  activeIcon: IconName;
}

const BottomNav = () => {
  const moduloActual = useNavigationStore(state => state.moduloActual);
  const cambiarModulo = useNavigationStore(state => state.cambiarModulo);

  const menuItems: MenuItem[] = [
    { id: 'inventario', label: 'Inventario', icon: 'cube-outline', activeIcon: 'cube' },
    { id: 'compras', label: 'Compras', icon: 'cart-outline', activeIcon: 'cart' },
    { id: 'ventas', label: 'Ventas', icon: 'cash-outline', activeIcon: 'cash' },
    { id: 'reparaciones', label: 'Reparaciones', icon: 'build-outline', activeIcon: 'build' },
    { id: 'bitacora', label: 'Bitácora', icon: 'shield-outline', activeIcon: 'shield' },
  ];

  return (
    <View style={styles.container}>
      {menuItems.map((item) => {
        const isActive = moduloActual === item.id;
        
        return (
          <TouchableOpacity
            key={item.id}
            style={styles.tab}
            activeOpacity={0.7}
            onPress={() => cambiarModulo(item.id)}
          >
            <Ionicons
              name={isActive ? item.activeIcon : item.icon}
              size={24}
              color={isActive ? COLORS.primary : COLORS.textDisabled}
            />
            <Text style={[styles.label, isActive && styles.labelActive]}>
              {item.label}
            </Text>
          </TouchableOpacity>
        );
      })}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    backgroundColor: COLORS.paper,
    paddingTop: 12,
    
    paddingBottom: Platform.OS === 'ios' ? 24 : 12, 
    borderTopWidth: 1,
    borderTopColor: COLORS.divider,
    
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -3 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 8,
  },
  tab: {
    alignItems: 'center',
    justifyContent: 'center',
    flex: 1,
  },
  label: {
    fontSize: 10,
    marginTop: 4,
    color: COLORS.textDisabled,
    fontWeight: '500',
  },
  labelActive: {
    color: COLORS.primary,
    fontWeight: 'bold',
  },
});

export default BottomNav;