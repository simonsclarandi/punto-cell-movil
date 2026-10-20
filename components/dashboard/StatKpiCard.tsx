import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, TYPOGRAPHY, SHADOWS, SPACING } from '../../constants/theme';

interface StatKpiCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon: keyof typeof Ionicons.glyphMap;
  accentColor?: string;
}

export default function StatKpiCard({
  title,
  value,
  subtitle,
  icon,
  accentColor = COLORS.primary,
}: StatKpiCardProps) {
  return (
    <View style={styles.card}>
      <View style={styles.topRow}>
        <View style={[styles.iconContainer, { backgroundColor: `${accentColor}18` }]}>
          <Ionicons name={icon} size={18} color={accentColor} />
        </View>
        <Text style={styles.title} numberOfLines={1}>{title}</Text>
      </View>
      <Text style={[styles.value, { color: COLORS.textPrimary }]} numberOfLines={1}>
        {value}
      </Text>
      {subtitle ? (
        <Text style={styles.subtitle} numberOfLines={1}>
          {subtitle}
        </Text>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: COLORS.paper,
    borderRadius: SPACING.borderRadius,
    padding: 14,
    borderWidth: 1,
    borderColor: COLORS.divider,
    ...SHADOWS.lift,
    flex: 1,
    minWidth: '45%',
    marginBottom: 10,
  },
  topRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  iconContainer: {
    width: 32,
    height: 32,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 8,
  },
  title: {
    fontSize: 11,
    fontWeight: '700',
    color: COLORS.textSecondary,
    textTransform: 'uppercase',
    letterSpacing: 0.3,
    flex: 1,
  },
  value: {
    fontSize: 18,
    fontWeight: '900',
    marginBottom: 2,
  },
  subtitle: {
    fontSize: 11,
    color: COLORS.textDisabled,
    fontWeight: '500',
  },
});
