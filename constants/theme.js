// constants/theme.js

export const COLORS = {
  // Paleta Principal (Light Theme por defecto)
  primary: '#12684e',
  primaryLight: '#e7f1ec',
  primaryDark: '#0d5240',
  
  secondary: '#625e57',
  secondaryLight: '#f0eee9',
  
  success: '#12684e',
  warning: '#9a6510',
  error: '#a93b32',
  info: '#12684e',

  // Fondos y Textos
  background: '#f6f5f2',
  paper: '#ffffff',
  textPrimary: '#1d1b18',
  textSecondary: '#625e57',
  textDisabled: '#918c83',
  divider: '#e7e4de',

  // Custom Punto Cell (Variables PC)
  surfaceMuted: '#fbfaf8',
  dividerSoft: '#f0eee9',
  accentSoft: '#e7f1ec',
};

export const TYPOGRAPHY = {
  // React Native usa las fuentes del sistema por defecto. 
  // Para iOS usa San Francisco, para Android Roboto.
  sans: 'System', 
  // Para la clase .mono que usás en tickets e IDs
  mono: 'monospace', 
  
  sizes: {
    h1: 32,
    h2: 28,
    h3: 25,
    h4: 23,
    h5: 19,
    h6: 15,
    body: 13,
    caption: 11,
    eyebrow: 10,
  }
};

export const SPACING = {
  rowHeight: 46,
  controlHeight: 32,
  borderRadius: 10,
  smallRadius: 7,
};

// Sombras nativas (Reemplazo de pc.lift y pc.liftPop)
export const SHADOWS = {
  lift: {
    shadowColor: '#0f1729',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 2, // Exclusivo para Android
  },
  liftPop: {
    shadowColor: '#0f1729',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 6,
  }
};