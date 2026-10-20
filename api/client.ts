import axios, { InternalAxiosRequestConfig, AxiosResponse } from 'axios';
import { Platform } from 'react-native';
import { getCookie, saveCookie, removeCookie } from './storage';
import { useAuthStore } from '../store/useAuthStore';

// Determinamos la URL base priorizando EXPO_PUBLIC_API_URL del archivo .env
const resolveBaseUrl = (): string => {
  if (process.env.EXPO_PUBLIC_API_URL) {
    return process.env.EXPO_PUBLIC_API_URL;
  }

  // Fallbacks inteligentes según la plataforma en caso de no haber .env
  if (Platform.OS === 'android') {
    return 'http://10.0.2.2:3003/api';
  }
  if (Platform.OS === 'ios' || Platform.OS === 'web') {
    return 'http://localhost:3003/api';
  }
  return 'http://192.168.100.131:3003/api';
};

export const API_URL = resolveBaseUrl();

const apiClient = axios.create({
  baseURL: API_URL,
  timeout: 15000,
  withCredentials: false,
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  },
});

// Interceptor de Petición: adjunta la cookie firmada almacenada (excepto en login para evitar 'sesión activa')
apiClient.interceptors.request.use(
  async (config: InternalAxiosRequestConfig) => {
    config.withCredentials = false;
    const isLoginRequest = config.url?.includes('/auth/login');
    if (!isLoginRequest) {
      const cookie = await getCookie();
      if (cookie) {
        config.headers.set('Cookie', cookie);
        config.headers['Cookie'] = cookie;
      }
      console.log(`[Axios] ${config.method?.toUpperCase()} ${config.url} | Cookie: ${cookie ? 'PRESENTE' : 'NULL'}`);
    } else {
      console.log(`[Axios] ${config.method?.toUpperCase()} ${config.url}`);
    }
    return config;
  },
  (error: any) => Promise.reject(error)
);

// Interceptor de Respuesta: captura 'set-cookie' (si el entorno lo expone)
apiClient.interceptors.response.use(
  async (response: AxiosResponse) => {
    try {
      const rawSetCookie =
        response.headers['set-cookie'] ||
        (typeof (response.headers as any).get === 'function'
          ? (response.headers as any).get('set-cookie')
          : null);

      if (rawSetCookie) {
        const cookieList = Array.isArray(rawSetCookie) ? rawSetCookie : [rawSetCookie];
        for (const item of cookieList) {
          if (typeof item === 'string' && item.includes('jwt_punto_cell=')) {
            // Extrae la porción 'jwt_punto_cell=s%3A...' previa al primer ';'
            const cleanCookie = item.split(';')[0].trim();
            await saveCookie(cleanCookie);
            break;
          }
        }
      }
    } catch (e) {
      console.warn('[Axios] No se pudo procesar Set-Cookie:', e);
    }
    return response;
  },
  async (error: any) => {
    const isAuthRoute =
      error.config?.url?.includes('/auth/login') ||
      error.config?.url?.includes('/auth/me');

    if (error.response?.status === 401 && !isAuthRoute) {
      console.warn('[Axios] 401 recibido en ruta protegida:', JSON.stringify(error.response?.data));
      await removeCookie();
      useAuthStore.getState().logout();
    }
    return Promise.reject(error);
  }
);

export default apiClient;
