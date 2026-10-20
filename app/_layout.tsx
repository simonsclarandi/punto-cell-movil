import React, { useEffect } from 'react';
import { StyleSheet, View, ActivityIndicator } from 'react-native';
import { SafeAreaView, SafeAreaProvider } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { Stack } from 'expo-router';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

import { useAuthStore } from '../store/useAuthStore';
import LoginScreen from '../components/auth/LoginScreen';
import { ThemeProvider } from '../constants/ThemeContext';
import { COLORS } from '../constants/theme';
import apiClient from '../api/client';
import { initializeSessionFromUser, destroySession } from '../api/session';

const queryClient = new QueryClient();

export default function RootLayout() {
  const isAuthenticated = useAuthStore(state => state.isAuthenticated);
  const isLoadingSession = useAuthStore(state => state.isLoadingSession);
  const login = useAuthStore(state => state.login);
  const logout = useAuthStore(state => state.logout);
  const setIsLoadingSession = useAuthStore(state => state.setIsLoadingSession);

  useEffect(() => {
    const bootstrapSession = async () => {
      try {
        // Consultamos /auth/me para recuperar la sesión activa del usuario si existe
        const res = await apiClient.get('/auth/me');
        const user = res.data?.data?.user;
        if (user) {
          console.log('[Bootstrap] Sesión previa recuperada para:', user.Nombre);
          await initializeSessionFromUser(user);
          login(user);
        } else {
          await destroySession();
          logout();
        }
      } catch (err) {
        console.log('[Bootstrap] No hay sesión previa activa.');
      } finally {
        setIsLoadingSession(false);
      }
    };

    bootstrapSession();
  }, []);

  if (isLoadingSession) {
    return (
      <SafeAreaProvider>
        <SafeAreaView style={[styles.safeArea, styles.center]}>
          <StatusBar style="dark" />
          <ActivityIndicator size="large" color={COLORS.primary} />
        </SafeAreaView>
      </SafeAreaProvider>
    );
  }

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

  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider>
        <SafeAreaProvider>
          <SafeAreaView style={styles.safeArea}>
            <StatusBar style="dark" />
            <Stack screenOptions={{ headerShown: false }}>
              <Stack.Screen name="(tabs)" />
              <Stack.Screen name="detalle" options={{ presentation: 'card' }} />
              <Stack.Screen name="dashboard/[modulo]" options={{ presentation: 'card' }} />
            </Stack>
          </SafeAreaView>
        </SafeAreaProvider>
      </ThemeProvider>
    </QueryClientProvider>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: COLORS.background },
  center: { justifyContent: 'center', alignItems: 'center' },
});
