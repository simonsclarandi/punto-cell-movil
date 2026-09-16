import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, TYPOGRAPHY, SHADOWS, SPACING } from '../../constants/theme';

const LogCard = ({ fecha, sucursal, usuario, accion, detalle, ip }) => {
  // Lógica de colores e íconos
  const getActionTheme = () => {
    const acc = accion.toLowerCase();
    if (acc.includes('fallido') || acc.includes('elimin') || acc.includes('anul')) {
      return { color: COLORS.error, icon: 'close-circle' };
    }
    if (acc.includes('venta') || acc.includes('compra') || acc.includes('pago')) {
      return { color: COLORS.success, icon: 'cash' };
    }
    if (acc.includes('login') || acc.includes('sesión')) {
      return { color: COLORS.info, icon: 'log-in' };
    }
    if (acc.includes('inventario') || acc.includes('stock')) {
      return { color: COLORS.warning, icon: 'cube' };
    }
    return { color: COLORS.textSecondary, icon: 'information-circle' };
  };

  const theme = getActionTheme();

  return (
    <View style={styles.card}>
      {/* HEADER: Fecha y Sucursal */}
      <View style={styles.header}>
        <View style={styles.dateContainer}>
          <Ionicons name="calendar-outline" size={12} color={COLORS.textSecondary} />
          <Text style={styles.dateText}>{fecha}</Text>
        </View>
        <View style={styles.branchPill}>
          <Text style={styles.branchText}>{sucursal}</Text>
        </View>
      </View>

      {/* MAIN: Acción y Usuario */}
      <View style={styles.mainRow}>
        <View style={styles.actionContainer}>
          <Ionicons name={theme.icon} size={18} color={theme.color} />
          <Text style={[styles.actionText, { color: theme.color }]}>{accion}</Text>
        </View>
        <View style={styles.userContainer}>
          <Ionicons name="person-outline" size={14} color={COLORS.textSecondary} />
          <Text style={styles.userText}>{usuario}</Text>
        </View>
      </View>

      {/* BODY: Detalle */}
      <Text style={styles.detailText} numberOfLines={2}>
        {detalle}
      </Text>

      {/* FOOTER: IP */}
      <View style={styles.footer}>
        <Text style={styles.ipText}>IP: {ip}</Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: COLORS.paper,
    borderRadius: SPACING.borderRadius,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: COLORS.divider,
    ...SHADOWS.lift,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 14,
  },
  dateContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  dateText: {
    fontSize: 12,
    color: COLORS.textSecondary,
    fontFamily: TYPOGRAPHY.mono,
  },
  branchPill: {
    backgroundColor: COLORS.surfaceMuted,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: SPACING.smallRadius,
    borderWidth: 1,
    borderColor: COLORS.dividerSoft,
  },
  branchText: {
    fontSize: TYPOGRAPHY.sizes.eyebrow,
    fontWeight: 'bold',
    color: COLORS.textSecondary,
    textTransform: 'uppercase',
  },
  mainRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  actionContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  actionText: {
    fontSize: TYPOGRAPHY.sizes.h6,
    fontWeight: 'bold',
  },
  userContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  userText: {
    fontSize: TYPOGRAPHY.sizes.body,
    fontWeight: '600',
    color: COLORS.textPrimary,
  },
  detailText: {
    fontSize: TYPOGRAPHY.sizes.body,
    color: COLORS.textSecondary,
    marginBottom: 12,
    lineHeight: 18,
  },
  footer: {
    borderTopWidth: 1,
    borderTopColor: COLORS.dividerSoft,
    paddingTop: 10,
    alignItems: 'flex-end',
  },
  ipText: {
    fontSize: 10,
    color: COLORS.textDisabled,
    fontFamily: TYPOGRAPHY.mono,
  },
});

export default LogCard;