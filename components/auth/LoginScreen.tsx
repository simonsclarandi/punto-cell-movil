import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, ActivityIndicator, Alert, KeyboardAvoidingView, Platform } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, TYPOGRAPHY, SHADOWS, SPACING } from '../../constants/theme';
import { useAuthStore } from '../../store/useAuthStore';

const TEST_USER = { usuario: 'admin', password: 'talleres123456' };

export default function LoginScreen() {
  const login = useAuthStore(state => state.login);
  
  const [form, setForm] = useState({ usuario: '', password: '' });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const fillTestUser = () => {
    setForm(TEST_USER);
    setError('');
  };

  const handleLogin = () => {
    if (!form.usuario || !form.password) {
      setError('Por favor completá todos los campos.');
      return;
    }

    setLoading(true);
    setError('');

    // Simulamos la latencia de la API (1.5 segundos)
    setTimeout(() => {
      setLoading(false);
      // Validación mock tal como en tu web
      if (form.usuario === TEST_USER.usuario && form.password === TEST_USER.password) {
        login({ username: form.usuario, rol: 'admin' }); // Guarda sesión
      } else {
        setError('Usuario o contraseña incorrectos.');
      }
    }, 1500);
  };

  return (
    <KeyboardAvoidingView 
      style={styles.container} 
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      {/* Header / Logo */}
      <View style={styles.logoContainer}>
        <View style={styles.iconBox}>
          <Ionicons name="phone-portrait-outline" size={36} color={COLORS.paper} />
        </View>
        <Text style={styles.title}>Punto <Text style={{ color: COLORS.primary }}>Cell</Text></Text>
        <Text style={styles.subtitle}>Sistema de Gestión Integral</Text>
      </View>

      {/* Tarjeta del Formulario */}
      <View style={styles.card}>
        <Text style={styles.cardTitle}>Iniciar sesión</Text>
        <Text style={styles.cardSubtitle}>Ingresá tus credenciales para continuar</Text>

        {/* Botón Rápido de Prueba (igual al web) */}
        <TouchableOpacity style={styles.testUserBox} onPress={fillTestUser} activeOpacity={0.7}>
          <View>
            <Text style={styles.testUserLabel}>Usuario de prueba:</Text>
            <Text style={styles.testUserText}>admin / talleres123456</Text>
          </View>
          <Ionicons name="arrow-forward-outline" size={16} color={COLORS.primary} />
        </TouchableOpacity>

        {/* Mensaje de Error */}
        {error ? (
          <View style={styles.errorBox}>
            <Ionicons name="alert-circle" size={18} color={COLORS.error} />
            <Text style={styles.errorText}>{error}</Text>
          </View>
        ) : null}

        {/* Inputs */}
        <View style={styles.inputContainer}>
          <Ionicons name="person-outline" size={20} color={COLORS.textDisabled} style={styles.inputIcon} />
          <TextInput
            style={styles.input}
            placeholder="Usuario"
            value={form.usuario}
            onChangeText={(text) => setForm({ ...form, usuario: text })}
            autoCapitalize="none"
          />
        </View>

        <View style={styles.inputContainer}>
          <Ionicons name="lock-closed-outline" size={20} color={COLORS.textDisabled} style={styles.inputIcon} />
          <TextInput
            style={styles.input}
            placeholder="Contraseña"
            value={form.password}
            onChangeText={(text) => setForm({ ...form, password: text })}
            secureTextEntry={!showPassword}
          />
          <TouchableOpacity onPress={() => setShowPassword(!showPassword)} style={styles.eyeIcon}>
            <Ionicons name={showPassword ? "eye-off-outline" : "eye-outline"} size={20} color={COLORS.textDisabled} />
          </TouchableOpacity>
        </View>

        {/* Botón de Ingreso */}
        <TouchableOpacity style={styles.loginButton} onPress={handleLogin} disabled={loading}>
          {loading ? (
            <ActivityIndicator color={COLORS.paper} />
          ) : (
            <Text style={styles.loginButtonText}>Ingresar al sistema</Text>
          )}
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background, justifyContent: 'center', padding: 20 },
  logoContainer: { alignItems: 'center', marginBottom: 40 },
  iconBox: { width: 64, height: 64, backgroundColor: COLORS.primary, borderRadius: 16, justifyContent: 'center', alignItems: 'center', marginBottom: 16, ...SHADOWS.liftPop },
  title: { fontSize: 32, fontWeight: '900', color: COLORS.textPrimary },
  subtitle: { fontSize: 14, color: COLORS.textSecondary, fontWeight: '500', marginTop: 4 },
  card: { backgroundColor: COLORS.paper, padding: 24, borderRadius: 20, borderWidth: 1, borderColor: COLORS.divider, ...SHADOWS.lift },
  cardTitle: { fontSize: TYPOGRAPHY.sizes.h5, fontWeight: 'bold', color: COLORS.textPrimary, marginBottom: 4 },
  cardSubtitle: { fontSize: 13, color: COLORS.textSecondary, marginBottom: 24 },
  testUserBox: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', backgroundColor: COLORS.accentSoft, padding: 12, borderRadius: SPACING.smallRadius, borderWidth: 1, borderColor: COLORS.primaryLight, marginBottom: 20, borderStyle: 'dashed' },
  testUserLabel: { fontSize: 11, fontWeight: 'bold', color: COLORS.primaryDark },
  testUserText: { fontSize: 12, color: COLORS.textSecondary, fontFamily: TYPOGRAPHY.mono, marginTop: 2 },
  errorBox: { flexDirection: 'row', alignItems: 'center', backgroundColor: COLORS.error + '15', padding: 12, borderRadius: SPACING.smallRadius, marginBottom: 16, gap: 8 },
  errorText: { color: COLORS.error, fontSize: 12, fontWeight: '600', flex: 1 },
  inputContainer: { flexDirection: 'row', alignItems: 'center', backgroundColor: COLORS.surfaceMuted, borderWidth: 1, borderColor: COLORS.divider, borderRadius: SPACING.smallRadius, marginBottom: 16, paddingHorizontal: 12, height: 50 },
  inputIcon: { marginRight: 10 },
  input: { flex: 1, height: '100%', color: COLORS.textPrimary, fontSize: 15 },
  eyeIcon: { padding: 4 },
  loginButton: { backgroundColor: COLORS.primary, height: 50, borderRadius: SPACING.smallRadius, justifyContent: 'center', alignItems: 'center', marginTop: 8 },
  loginButtonText: { color: COLORS.paper, fontSize: 16, fontWeight: 'bold' }
});