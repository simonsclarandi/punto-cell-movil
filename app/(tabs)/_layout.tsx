import React from 'react';
import { TouchableOpacity, Alert, View, Text, StyleSheet } from 'react-native';
import { Tabs, router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../constants/ThemeContext';
import { useAuthStore } from '../../store/useAuthStore';
import { COLORS, SHADOWS } from '../../constants/theme';
import apiClient from '../../api/client';
import { removeCookie } from '../../api/storage';

export default function TabLayout() {
  const { theme } = useTheme();
  const logout = useAuthStore(state => state.logout);
  const usuario = useAuthStore(state => state.usuario);

  const esAdminOEncargado = usuario ? (usuario.IdRol === 1 || usuario.IdRol === 2) : false;

  const handleLogout = () => {
    Alert.alert(
      'Cerrar sesión',
      '¿Estás seguro de que deseás salir del sistema?',
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Salir',
          style: 'destructive',
          onPress: async () => {
            try {
              await apiClient.post('/auth/logout');
            } catch (e) {
              console.log('[Logout] Error al notificar al backend:', e);
            } finally {
              await removeCookie();
              logout();
            }
          },
        },
      ]
    );
  };

  const renderHeaderWithDashboard = (title: string, modulo: string) => (
    <View style={styles.headerTitleRow}>
      <TouchableOpacity 
        style={styles.dashboardButton}
        onPress={() => router.push(`/dashboard/${modulo}`)}
        activeOpacity={0.7}
      >
        <Ionicons name="stats-chart" size={13} color="#ffffff" style={{ marginRight: 4 }} />
        <Text style={styles.dashboardButtonText}>Dashboard</Text>
      </TouchableOpacity>
      <Text style={[styles.headerTitleText, { color: theme.textPrimary }]}>{title}</Text>
    </View>
  );

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: theme.primary,
        tabBarInactiveTintColor: theme.textDisabled,
        tabBarStyle: {
          backgroundColor: theme.paper,
          borderTopColor: theme.divider,
          height: 60,
          paddingBottom: 8,
          paddingTop: 8,
        },
        headerStyle: { 
          backgroundColor: theme.background,
          shadowColor: 'transparent',
          elevation: 0, 
        },
        headerTintColor: theme.textPrimary,
        headerTitleAlign: 'left',
        headerRight: () => (
          <TouchableOpacity
            onPress={handleLogout}
            style={{ marginRight: 16, padding: 6 }}
            activeOpacity={0.7}
          >
            <Ionicons name="log-out-outline" size={24} color={theme.error} />
          </TouchableOpacity>
        ),
      }}
    >
      {/* 1. INVENTARIO */}
      <Tabs.Screen
        name="inventario"
        options={{
          title: 'Inventario',
          headerTitle: () => renderHeaderWithDashboard('Inventario', 'inventario'),
          tabBarIcon: ({ color }) => <Ionicons name="cube-outline" size={24} color={color} />,
        }}
      />
      
      {/* 2. VENTAS */}
      <Tabs.Screen
        name="ventas"
        options={{
          title: 'Ventas',
          headerTitle: () => renderHeaderWithDashboard('Ventas', 'ventas'),
          tabBarIcon: ({ color }) => <Ionicons name="cash-outline" size={24} color={color} />,
        }}
      />
      
      {/* 3. COMPRAS */}
      <Tabs.Screen
        name="compras"
        options={{
          title: 'Compras',
          headerTitle: () => renderHeaderWithDashboard('Compras', 'compras'),
          tabBarIcon: ({ color }) => <Ionicons name="cart-outline" size={24} color={color} />,
        }}
      />
      
      {/* 4. REPARACIONES */}
      <Tabs.Screen
        name="reparaciones"
        options={{
          title: 'Reparaciones',
          headerTitle: () => renderHeaderWithDashboard('Reparaciones', 'reparaciones'),
          tabBarIcon: ({ color }) => <Ionicons name="build-outline" size={24} color={color} />,
        }}
      />
      
      {/* 5. BITÁCORA (Acceso exclusivo Administrador / Encargado) */}
      <Tabs.Screen
        name="bitacora"
        options={{
          title: 'Bitácora',
          headerTitle: () => renderHeaderWithDashboard('Bitácora', 'bitacora'),
          tabBarIcon: ({ color }) => <Ionicons name="shield-checkmark-outline" size={24} color={color} />,
          href: esAdminOEncargado ? '/bitacora' : null,
        }}
      />
    </Tabs>
  );
}

const styles = StyleSheet.create({
  headerTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginLeft: 4,
  },
  dashboardButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.primary,
    paddingHorizontal: 9,
    paddingVertical: 5,
    borderRadius: 14,
    marginRight: 10,
    ...SHADOWS.lift,
  },
  dashboardButtonText: {
    color: '#ffffff',
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 0.2,
  },
  headerTitleText: {
    fontSize: 17,
    fontWeight: '800',
  },
});
