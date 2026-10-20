import * as SecureStore from 'expo-secure-store';
import { Platform } from 'react-native';

const COOKIE_KEY = 'jwt_punto_cell_cookie';

export const saveCookie = async (cookie: string): Promise<void> => {
  try {
    if (Platform.OS === 'web') {
      if (typeof window !== 'undefined' && window.localStorage) {
        window.localStorage.setItem(COOKIE_KEY, cookie);
      }
      return;
    }
    await SecureStore.setItemAsync(COOKIE_KEY, cookie);
  } catch (error) {
    console.error('[Storage] Error al guardar cookie de sesión:', error);
  }
};

export const getCookie = async (): Promise<string | null> => {
  try {
    if (Platform.OS === 'web') {
      if (typeof window !== 'undefined' && window.localStorage) {
        return window.localStorage.getItem(COOKIE_KEY);
      }
      return null;
    }
    return await SecureStore.getItemAsync(COOKIE_KEY);
  } catch (error) {
    console.error('[Storage] Error al obtener cookie de sesión:', error);
    return null;
  }
};

export const removeCookie = async (): Promise<void> => {
  try {
    if (Platform.OS === 'web') {
      if (typeof window !== 'undefined' && window.localStorage) {
        window.localStorage.removeItem(COOKIE_KEY);
      }
      return;
    }
    await SecureStore.deleteItemAsync(COOKIE_KEY);
  } catch (error) {
    console.error('[Storage] Error al eliminar cookie de sesión:', error);
  }
};
