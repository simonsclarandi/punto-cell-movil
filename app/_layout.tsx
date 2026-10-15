import React from 'react';
import { StyleSheet } from 'react-native';
import { SafeAreaView, SafeAreaProvider } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { Stack } from 'expo-router';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

// Importamos el estado de autenticación y el login
import { useAuthStore } from '../store/useAuthStore';
import LoginScreen from '../components/auth/LoginScreen';

// Tu nuevo Contexto de Tema y Colores
import { ThemeProvider } from '../constants/ThemeContext';
import { COLORS } from '../constants/theme';

const queryClient = new QueryClient();

export default function RootLayout() {
  // Leemos el estado global de zustand tal como lo hacías antes
  const isAuthenticated = useAuthStore(state => state.isAuthenticated);

  // Si no está logueado, devolvemos la pantalla de Login y cortamos la ejecución
  if (!isAuthenticated) {
    return (
      <SafeAreaProvider>
        <SafeAreaView style={styles.safeArea}>
          <StatusBar style="dark" />
          <LoginScreen />
        </SafeAreaView>
      </SafeAreaProvider>
    );
  }

  // Si está logueado, envuelve la app con Providers y el Enrutador
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider>
        <SafeAreaProvider>
          <SafeAreaView style={styles.safeArea}>
            <StatusBar style="dark" />
            
            {/* 
              Stack de Expo Router reemplaza a tu getContenido() 
              Maneja la superposición de pantallas automáticamente.
            */}
            <Stack screenOptions={{ headerShown: false }}>
              {/* Las solapas principales */}
              <Stack.Screen name="(tabs)" />
              {/* La carpeta de detalles (se abrirán como tarjetas por encima) */}
              <Stack.Screen name="detalle" options={{ presentation: 'card' }} />
            </Stack>

          </SafeAreaView>
        </SafeAreaProvider>
      </ThemeProvider>
    </QueryClientProvider>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: COLORS.background },
});