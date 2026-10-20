import React, { useRef } from 'react';
import { Modal, View, StyleSheet, TouchableOpacity, Text, ActivityIndicator, Platform } from 'react-native';
import { WebView } from 'react-native-webview';
import { Ionicons } from '@expo/vector-icons';
import { COLORS } from '../../constants/theme';

interface RecaptchaModalProps {
  visible: boolean;
  onSuccess: (token: string) => void;
  onClose: () => void;
}

const SITE_KEY = '6LdaTNgtAAAAABxLuvOKtpBmjEmhWcQkQARx0ub4';

export default function RecaptchaModal({ visible, onSuccess, onClose }: RecaptchaModalProps) {
  const webViewRef = useRef<WebView>(null);

  const htmlContent = `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no">
        <title>reCAPTCHA</title>
        <script src="https://www.google.com/recaptcha/enterprise.js?render=explicit" async defer></script>
        <style>
          * { box-sizing: border-box; }
          body, html {
            margin: 0;
            padding: 0;
            width: 100%;
            height: 100%;
            display: flex;
            justify-content: center;
            align-items: center;
            background-color: #ffffff;
            font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
          }
          #container {
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            padding: 20px;
          }
        </style>
      </head>
      <body>
        <div id="container">
          <div id="recaptcha-widget"></div>
        </div>
        <script>
          function post(msg) {
            if (window.ReactNativeWebView && window.ReactNativeWebView.postMessage) {
              window.ReactNativeWebView.postMessage(JSON.stringify(msg));
            } else if (window.parent && window.parent.postMessage) {
              window.parent.postMessage(JSON.stringify(msg), '*');
            }
          }

          function onCallback(token) {
            post({ type: 'TOKEN', token: token });
          }
          function onExpired() {
            post({ type: 'EXPIRED' });
          }
          function onError() {
            post({ type: 'ERROR' });
          }

          function initRecaptcha() {
            if (window.grecaptcha && window.grecaptcha.enterprise && window.grecaptcha.enterprise.render) {
              window.grecaptcha.enterprise.ready(function() {
                try {
                  window.grecaptcha.enterprise.render('recaptcha-widget', {
                    'sitekey': '${SITE_KEY}',
                    'action': 'LOGIN',
                    'callback': onCallback,
                    'expired-callback': onExpired,
                    'error-callback': onError
                  });
                } catch(e) {
                  post({ type: 'ERROR', message: e.message });
                }
              });
            } else {
              setTimeout(initRecaptcha, 150);
            }
          }
          initRecaptcha();
        </script>
      </body>
    </html>
  `;

  const handleMessage = (event: any) => {
    try {
      const data = typeof event.nativeEvent?.data === 'string'
        ? JSON.parse(event.nativeEvent.data)
        : event.nativeEvent?.data;

      if (data?.type === 'TOKEN' && data.token) {
        onSuccess(data.token);
      } else if (data?.type === 'ERROR') {
        console.warn('[reCAPTCHA] Error en widget:', data.message);
      }
    } catch (e) {
      console.error('[reCAPTCHA] Error al procesar token:', e);
    }
  };

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <View style={styles.overlay}>
        <View style={styles.modalContent}>
          <View style={styles.header}>
            <Text style={styles.title}>Verificación de Seguridad</Text>
            <TouchableOpacity onPress={onClose} style={styles.closeBtn} activeOpacity={0.7}>
              <Ionicons name="close" size={24} color={COLORS.textPrimary} />
            </TouchableOpacity>
          </View>
          <Text style={styles.subtitle}>Completá el captcha para continuar con el ingreso</Text>

          <View style={styles.webViewContainer}>
            {Platform.OS === 'web' ? (
              <iframe
                srcDoc={htmlContent}
                style={{ width: '100%', height: '100%', border: 'none' }}
              />
            ) : (
              <WebView
                ref={webViewRef}
                originWhitelist={['*']}
                source={{ html: htmlContent, baseUrl: 'http://localhost' }}
                onMessage={handleMessage}
                javaScriptEnabled={true}
                domStorageEnabled={true}
                startInLoadingState={true}
                renderLoading={() => (
                  <View style={styles.loadingContainer}>
                    <ActivityIndicator size="large" color={COLORS.primary} />
                  </View>
                )}
                style={styles.webView}
              />
            )}
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.65)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modalContent: {
    backgroundColor: COLORS.paper,
    width: '100%',
    maxWidth: 380,
    height: 380,
    borderRadius: 16,
    overflow: 'hidden',
    elevation: 10,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 4,
  },
  title: {
    fontSize: 16,
    fontWeight: 'bold',
    color: COLORS.textPrimary,
  },
  subtitle: {
    fontSize: 12,
    color: COLORS.textSecondary,
    paddingHorizontal: 20,
    marginBottom: 8,
  },
  closeBtn: {
    padding: 4,
  },
  webViewContainer: {
    flex: 1,
    backgroundColor: '#ffffff',
  },
  webView: {
    flex: 1,
    backgroundColor: '#ffffff',
  },
  loadingContainer: {
    ...StyleSheet.absoluteFill,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#ffffff',
  },
});
