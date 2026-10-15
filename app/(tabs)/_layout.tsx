import React from 'react';
import { Tabs } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../constants/ThemeContext';

export default function TabLayout() {
  const { theme } = useTheme();

  return (
    <Tabs
      screenOptions={{
        // ─── Estilos de la barra inferior (BottomNav) ───
        tabBarActiveTintColor: theme.primary,
        tabBarInactiveTintColor: theme.textDisabled,
        tabBarStyle: {
          backgroundColor: theme.paper,
          borderTopColor: theme.divider,
          height: 60,
          paddingBottom: 8,
          paddingTop: 8,
        },
        
        // ─── Estilos de la barra superior (Header) ───
        headerStyle: { 
          backgroundColor: theme.background, // Podés cambiarlo a theme.paper o theme.primary
          shadowColor: 'transparent', // Le quita la sombra para que se funda mejor con el fondo
          elevation: 0, 
        },
        headerTintColor: theme.textPrimary, // Color del texto del título
        headerTitleStyle: { 
          fontWeight: 'bold',
          fontSize: 18,
        },
        headerTitleAlign: 'center', // Centra el título en Android e iOS
      }}
    >
      {/* 1. INVENTARIO */}
      <Tabs.Screen
        name="inventario"
        options={{
          title: 'Inventario', // Texto chiquito de la barra inferior
          headerTitle: 'Gestión de Inventario', // Texto grande del header superior
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
      
      {/* 5. BITÁCORA */}
      <Tabs.Screen
        name="bitacora"
        options={{
          title: 'Bitácora',
          headerTitle: 'Bitácora de Sistema',
          tabBarIcon: ({ color }) => <Ionicons name="shield-checkmark-outline" size={24} color={color} />,
        }}
      />
    </Tabs>
  );
}