import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, TYPOGRAPHY, SHADOWS, SPACING } from '../../constants/theme';

export interface LogCardProps {
  fecha: string;
  sucursal: string;
  usuario: string;
  accion: string;
  detalle: string;
  ip: string;
}

const LogCard = ({ fecha, sucursal, usuario, accion, detalle, ip }: LogCardProps) => {
  const getActionTheme = () => {
    const acc = accion.toLowerCase();
    if (acc.includes('fallido') || acc.includes('elimin') || acc.includes('anul') || acc.includes('rechaz')) {
      return { color: COLORS.error, icon: 'close-circle' as const, bg: COLORS.error + '18' };
    }
    if (acc.includes('venta') || acc.includes('compra') || acc.includes('pago')) {
      return { color: COLORS.success, icon: 'cash' as const, bg: COLORS.success + '18' };
    }
    if (acc.includes('login') || acc.includes('sesión') || acc.includes('ingres')) {
      return { color: COLORS.info, icon: 'log-in' as const, bg: COLORS.info + '18' };
    }
    if (acc.includes('inventario') || acc.includes('stock') || acc.includes('artículo')) {
      return { color: COLORS.warning, icon: 'cube' as const, bg: COLORS.warning + '18' };
    }
    return { color: COLORS.textSecondary, icon: 'information-circle' as const, bg: COLORS.surfaceMuted };
  };

  const theme = getActionTheme();

  return (
    <View style={styles.card}>
      {/* 1. Encabezado: Acción con su ícono temático y Sucursal */}
      <View style={styles.header}>
        <View style={styles.actionContainer}>
          <View style={[styles.iconBadge, { backgroundColor: theme.bg }]}>
            <Ionicons name={theme.icon} size={16} color={theme.color} />
          </View>
          <Text style={[styles.actionText, { color: theme.color }]} numberOfLines={1} ellipsizeMode="tail">
            {accion}
          </Text>
        </View>
        {sucursal ? (
          <View style={styles.branchPill}>
            <Text style={styles.branchText} numberOfLines={1} ellipsizeMode="tail">
              {sucursal}
            </Text>
          </View>
        ) : null}
      </View>

      {/* 2. Metadatos: Usuario (con flex seguro) y Fecha */}
      <View style={styles.metaRow}>
        <View style={styles.userContainer}>
          <Ionicons name="person-circle-outline" size={15} color={COLORS.primary} />
          <Text style={styles.userText} numberOfLines={1} ellipsizeMode="tail">
            {usuario}
          </Text>
        </View>
        <View style={styles.dateContainer}>
          <Ionicons name="calendar-outline" size={12} color={COLORS.textSecondary} />
          <Text style={styles.dateText}>{fecha}</Text>
        </View>
      </View>

      {/* 3. Detalle de la Operación */}
      {detalle ? (
        <View style={styles.detailContainer}>
          <Text style={styles.detailText} numberOfLines={3} ellipsizeMode="tail">
            {detalle}
          </Text>
        </View>
      ) : null}

      {/* 4. Footer: IP de red */}
      <View style={styles.footer}>
        <Ionicons name="shield-checkmark-outline" size={11} color={COLORS.textDisabled} />
        <Text style={styles.ipText}>IP: {ip || 'Local / N/A'}</Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: COLORS.paper,
    borderRadius: SPACING.borderRadius,
    padding: 14,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: COLORS.divider,
    overflow: 'hidden',
    ...SHADOWS.lift,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
    gap: 8,
  },
  actionContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    minWidth: 0,
  },
  iconBadge: {
    width: 28,
    height: 28,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
    flexShrink: 0,
  },
  actionText: {
    flex: 1,
    fontSize: 14,
    fontWeight: 'bold',
  },
  branchPill: {
    backgroundColor: COLORS.surfaceMuted,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: SPACING.smallRadius,
    borderWidth: 1,
    borderColor: COLORS.dividerSoft,
    flexShrink: 0,
    maxWidth: 120,
  },
  branchText: {
    fontSize: 10,
    fontWeight: 'bold',
    color: COLORS.textSecondary,
    textTransform: 'uppercase',
  },
  metaRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
    gap: 8,
  },
  userContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    minWidth: 0,
  },
  userText: {
    flex: 1,
    fontSize: 13,
    fontWeight: '600',
    color: COLORS.textPrimary,
  },
  dateContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    flexShrink: 0,
  },
  dateText: {
    fontSize: 11,
    color: COLORS.textSecondary,
    fontFamily: TYPOGRAPHY.mono,
  },
  detailContainer: {
    backgroundColor: COLORS.surfaceMuted,
    borderRadius: SPACING.smallRadius,
    padding: 10,
    marginBottom: 8,
  },
  detailText: {
    fontSize: 12,
    color: COLORS.textSecondary,
    lineHeight: 17,
  },
  footer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
    gap: 4,
    borderTopWidth: 1,
    borderTopColor: COLORS.dividerSoft,
    paddingTop: 8,
  },
  ipText: {
    fontSize: 10,
    color: COLORS.textDisabled,
    fontFamily: TYPOGRAPHY.mono,
  },
});

export default LogCard;
