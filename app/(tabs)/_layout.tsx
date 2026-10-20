import React from 'react';
import { TouchableOpacity, Alert } from 'react-native';
import { Tabs } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../constants/ThemeContext';
import { useAuthStore } from '../../store/useAuthStore';
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
        headerTitleStyle: { 
          fontWeight: 'bold',
          fontSize: 18,
        },
        headerTitleAlign: 'center',
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
          headerTitle: 'Gestión de Inventario',
          tabBarIcon: ({ color }) => <Ionicons name="cube-outline" size={24} color={color} />,
        }}
      />
      
      {/* 2. VENTAS */}
      <Tabs.Screen
        name="ventas"
        options={{
          title: 'Ventas',
          headerTitle: 'Registro de Ventas',
          tabBarIcon: ({ color }) => <Ionicons name="cash-outline" size={24} color={color} />,
        }}
      />
      
      {/* 3. COMPRAS */}
      <Tabs.Screen
        name="compras"
        options={{
          title: 'Compras',
          headerTitle: 'Historial de Compras',
          tabBarIcon: ({ color }) => <Ionicons name="cart-outline" size={24} color={color} />,
        }}
      />
      
      {/* 4. REPARACIONES */}
      <Tabs.Screen
        name="reparaciones"
        options={{
          title: 'Reparaciones',
          headerTitle: 'Servicio Técnico',
          tabBarIcon: ({ color }) => <Ionicons name="build-outline" size={24} color={color} />,
        }}
      />
      
      {/* 5. BITÁCORA (Acceso exclusivo Administrador / Encargado) */}
      <Tabs.Screen
        name="bitacora"
        options={{
          title: 'Bitácora',
          headerTitle: 'Bitácora de Sistema',
          tabBarIcon: ({ color }) => <Ionicons name="shield-checkmark-outline" size={24} color={color} />,
          href: esAdminOEncargado ? '/bitacora' : null,
        }}
      />
    </Tabs>
  );
}
