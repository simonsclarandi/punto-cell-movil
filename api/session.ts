import CryptoJS from 'crypto-js';
import { saveCookie, removeCookie } from './storage';
import { Usuario } from '../store/useAuthStore';

const JWT_SECRET = process.env.EXPO_PUBLIC_JWT_SECRET || 'una_clave_secreta_larga_minimo_8_chars';

// Función auxiliar para codificar en Base64 URL (RFC 7515 / JWT)
function base64Url(source: CryptoJS.lib.WordArray): string {
  let encodedSource = CryptoJS.enc.Base64.stringify(source);
  return encodedSource
    .replace(/=+$/, '')
    .replace(/\+/g, '-')
    .replace(/\//g, '_');
}

/**
 * Genera un token JWT compatible con el backend de PuntoCell (HS256, 8 horas de expiración)
 */
export function generateSessionJwt(
  payload: { id: number; rol: number; sucursal: number; type: string },
  secret: string = JWT_SECRET,
  expiresInSeconds: number = 8 * 3600
): string {
  const header = { alg: 'HS256', typ: 'JWT' };
  const now = Math.floor(Date.now() / 1000);
  const fullPayload = { ...payload, iat: now, exp: now + expiresInSeconds };

  const stringifiedHeader = CryptoJS.enc.Utf8.parse(JSON.stringify(header));
  const encodedHeader = base64Url(stringifiedHeader);

  const stringifiedData = CryptoJS.enc.Utf8.parse(JSON.stringify(fullPayload));
  const encodedData = base64Url(stringifiedData);

  const token = `${encodedHeader}.${encodedData}`;
  const signature = CryptoJS.HmacSHA256(token, secret);
  const encodedSignature = base64Url(signature);

  return `${token}.${encodedSignature}`;
}

/**
 * Firma un valor de cookie con el formato estándar de Express 'cookie-signature'
 * Formato: s:<token>.<hmacSha256Base64SinPadding>
 */
export function signCookieValue(val: string, secret: string = JWT_SECRET): string {
  const hmac = CryptoJS.HmacSHA256(val, secret);
  const base64Hmac = CryptoJS.enc.Base64.stringify(hmac).replace(/=+$/, '');
  return `s:${val}.${base64Hmac}`;
}

/**
 * Genera el encabezado completo de la cookie 'jwt_punto_cell' a partir de los datos del usuario logueado
 */
export function createSessionCookieString(user: { Id: number; IdRol: number; IdSucursal: number }): string {
  const payload = {
    id: user.Id,
    rol: user.IdRol,
    sucursal: user.IdSucursal,
    type: 'session'
  };

  const jwt = generateSessionJwt(payload, JWT_SECRET);
  const signedCookie = signCookieValue(jwt, JWT_SECRET);
  return `jwt_punto_cell=${encodeURIComponent(signedCookie)}`;
}

/**
 * Inicializa y persiste la cookie de sesión firmada en SecureStore a partir del usuario autenticado
 */
export async function initializeSessionFromUser(user: Usuario): Promise<string> {
  const cookieString = createSessionCookieString(user);
  await saveCookie(cookieString);
  return cookieString;
}

/**
 * Elimina la cookie de sesión persistida
 */
export async function destroySession(): Promise<void> {
  await removeCookie();
}
