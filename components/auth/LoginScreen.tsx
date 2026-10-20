import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, ActivityIndicator, KeyboardAvoidingView, Platform } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, TYPOGRAPHY, SHADOWS, SPACING } from '../../constants/theme';
import { useAuthStore } from '../../store/useAuthStore';
import apiClient, { API_URL } from '../../api/client';
import { initializeSessionFromUser, destroySession } from '../../api/session';
import RecaptchaModal from './RecaptchaModal';


const TEST_USER = { usuario: 'mfanara', password: 'talleres123456' };

export default function LoginScreen() {
  const login = useAuthStore(state => state.login);
  
  const [form, setForm] = useState({ usuario: '', password: '' });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [captchaModalVisible, setCaptchaModalVisible] = useState(false);
  const [captchaToken, setCaptchaToken] = useState('');

  const fillTestUser = () => {
    setForm(TEST_USER);
    setError('');
    setCaptchaToken('');
  };

  const executeLogin = async (tokenParaEnviar: string) => {
    setLoading(true);
    setError('');

    try {
      // Enviamos Identificador, Pwd y el RecaptchaToken resuelto
      const res = await apiClient.post('/auth/login', {
        Identificador: form.usuario.trim(),
        Pwd: form.password,
        RecaptchaToken: tokenParaEnviar
      });

      const user = res.data?.data?.user;

      if (user) {
        // Inicializamos la cookie de sesión firmada en SecureStore
        await initializeSessionFromUser(user);
        login(user);
      } else {
        setError('Respuesta inesperada del servidor.');
      }

    } catch (err: any) {
      // Los tokens de reCAPTCHA son de un solo uso; reseteamos ante cualquier error
      setCaptchaToken('');

      if (err.response) {
        const msg = err.response.data?.message || (Array.isArray(err.response.data?.errors) ? err.response.data.errors.join(' | ') : '');
        
        if (err.response.status === 403 && /captcha/i.test(msg)) {
          setError('El captcha expiró o no fue válido. Por favor completalo nuevamente.');
        } else if (err.response.status === 400 && /sesi[oó]n activa/i.test(msg)) {
          // Si el servidor indica sesión activa, recuperamos el usuario mediante /auth/me e ingresamos
          try {
            console.log('[Login] Sesión activa detectada en el servidor. Recuperando sesión con /auth/me...');
            const meRes = await apiClient.get('/auth/me');
            const activeUser = meRes.data?.data?.user;
            if (activeUser) {
              await initializeSessionFromUser(activeUser);
              login(activeUser);
              return;
            }
          } catch (meErr) {
            console.warn('[Login] No se pudo recuperar usuario vía /auth/me:', meErr);
            // Si /auth/me fallara, reseteamos la sesión en backend y localmente
            try {
              await apiClient.post('/auth/logout');
            } catch (_) {}
            await destroySession();
            setError('Sesión anterior expirada en el servidor. La sesión fue reseteada, por favor intentá ingresar nuevamente.');
            return;
          }
        } else {
          setError(msg || 'Credenciales incorrectas o error en el servidor.');
        }
      } else {
        setError(`No se pudo conectar con el servidor en ${API_URL}. Verificá que el backend esté corriendo y la IP sea correcta.`);
        console.error('[Login] Error de red:', err);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleStartLogin = () => {
    if (!form.usuario.trim() || !form.password) {
      setError('Por favor completá todos los campos.');
      return;
    }
    setError('');

    // Si ya tenemos token, mandamos el login; si no, abrimos el modal de reCAPTCHA
    if (captchaToken) {
      executeLogin(captchaToken);
    } else {
      setCaptchaModalVisible(true);
    }
  };

  const handleCaptchaSuccess = (token: string) => {
    setCaptchaToken(token);
    setCaptchaModalVisible(false);
    // Ejecuta el login inmediatamente con el token obtenido
    executeLogin(token);
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

        {/* Botón Rápido de Prueba (credenciales reales del seed) */}
        <TouchableOpacity style={styles.testUserBox} onPress={fillTestUser} activeOpacity={0.7}>
          <View>
            <Text style={styles.testUserLabel}>Usuario de prueba (Admin):</Text>
            <Text style={styles.testUserText}>mfanara / talleres123456</Text>
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
            placeholder="Usuario o Correo"
            placeholderTextColor={COLORS.textDisabled}
            value={form.usuario}
            onChangeText={(text) => {
              setForm({ ...form, usuario: text });
              if (captchaToken) setCaptchaToken('');
            }}
            autoCapitalize="none"
          />
        </View>

        <View style={styles.inputContainer}>
          <Ionicons name="lock-closed-outline" size={20} color={COLORS.textDisabled} style={styles.inputIcon} />
          <TextInput
            style={styles.input}
            placeholder="Contraseña"
            placeholderTextColor={COLORS.textDisabled}
            value={form.password}
            onChangeText={(text) => {
              setForm({ ...form, password: text });
              if (captchaToken) setCaptchaToken('');
            }}
            secureTextEntry={!showPassword}
          />
          <TouchableOpacity onPress={() => setShowPassword(!showPassword)} style={styles.eyeIcon}>
            <Ionicons name={showPassword ? "eye-off-outline" : "eye-outline"} size={20} color={COLORS.textDisabled} />
          </TouchableOpacity>
        </View>

        {/* Estado del Captcha */}
        {captchaToken ? (
          <View style={styles.captchaVerifiedBox}>
            <Ionicons name="checkmark-circle" size={16} color={COLORS.success} />
            <Text style={styles.captchaVerifiedText}>Verificación de seguridad completada</Text>
          </View>
        ) : null}

        {/* Botón de Ingreso */}
        <TouchableOpacity style={styles.loginButton} onPress={handleStartLogin} disabled={loading}>
          {loading ? (
            <ActivityIndicator color={COLORS.paper} />
          ) : (
            <Text style={styles.loginButtonText}>Ingresar al sistema</Text>
          )}
        </TouchableOpacity>
      </View>

      {/* Modal interactivo de reCAPTCHA */}
      <RecaptchaModal
        visible={captchaModalVisible}
        onSuccess={handleCaptchaSuccess}
        onClose={() => setCaptchaModalVisible(false)}
      />
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
  captchaVerifiedBox: { flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 12, paddingHorizontal: 4 },
  captchaVerifiedText: { fontSize: 12, color: COLORS.success, fontWeight: '600' },
  loginButton: { backgroundColor: COLORS.primary, height: 50, borderRadius: SPACING.smallRadius, justifyContent: 'center', alignItems: 'center', marginTop: 8 },
  loginButtonText: { color: COLORS.paper, fontSize: 16, fontWeight: 'bold' }
});
