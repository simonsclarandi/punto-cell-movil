import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { COLORS, TYPOGRAPHY, SHADOWS, SPACING } from '../../constants/theme';

export interface BarItem {
  label: string;
  value: number;
  formattedValue?: string;
  color?: string;
  sublabel?: string;
}

interface HorizontalBarChartProps {
  title: string;
  subtitle?: string;
  items: BarItem[];
  maxItems?: number;
}

const PALETTE = ['#007AFF', '#34C759', '#FF9500', '#AF52DE', '#FF2D55', '#5856D6', '#5AC8FA'];

export default function HorizontalBarChart({
  title,
  subtitle,
  items,
  maxItems = 6,
}: HorizontalBarChartProps) {
  const displayItems = items.slice(0, maxItems);
  const maxValue = Math.max(...displayItems.map(i => i.value), 1);
  const totalValue = displayItems.reduce((acc, i) => acc + i.value, 0);

  if (!displayItems.length) {
    return (
      <View style={styles.card}>
        <Text style={styles.title}>{title}</Text>
        <Text style={styles.emptyText}>No hay datos registrados para este período.</Text>
      </View>
    );
  }

  return (
    <View style={styles.card}>
      <View style={styles.header}>
        <Text style={styles.title}>{title}</Text>
        {subtitle ? <Text style={styles.subtitle}>{subtitle}</Text> : null}
      </View>

      <View style={styles.barsList}>
        {displayItems.map((item, index) => {
          const percentage = totalValue > 0 ? ((item.value / totalValue) * 100).toFixed(0) : '0';
          const barWidthPercent = `${Math.min(Math.max((item.value / maxValue) * 100, 3), 100)}%`;
          const barColor = item.color || PALETTE[index % PALETTE.length];

          return (
            <View key={index} style={styles.barRow}>
              <View style={styles.labelsRow}>
                <Text style={styles.itemLabel} numberOfLines={1}>
                  {item.label}
                </Text>
                <Text style={styles.itemValue}>
                  {item.formattedValue || item.value.toLocaleString('es-AR')}
                  <Text style={styles.itemPercent}> ({percentage}%)</Text>
                </Text>
              </View>

              <View style={styles.track}>
                <View 
                  style={[
                    styles.fill, 
                    { width: barWidthPercent as any, backgroundColor: barColor }
                  ]} 
                />
              </View>
            </View>
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: COLORS.paper,
    borderRadius: SPACING.borderRadius,
    padding: 16,
    borderWidth: 1,
    borderColor: COLORS.divider,
    marginBottom: 14,
    ...SHADOWS.lift,
  },
  header: {
    marginBottom: 14,
  },
  title: {
    fontSize: 14,
    fontWeight: '700',
    color: COLORS.textPrimary,
    letterSpacing: 0.2,
  },
  subtitle: {
    fontSize: 11,
    color: COLORS.textSecondary,
    marginTop: 2,
  },
  barsList: {
    gap: 12,
  },
  barRow: {
    flexDirection: 'column',
  },
  labelsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 5,
  },
  itemLabel: {
    fontSize: 13,
    fontWeight: '600',
    color: COLORS.textPrimary,
    flex: 1,
    marginRight: 8,
  },
  itemValue: {
    fontSize: 12,
    fontWeight: '700',
    color: COLORS.textPrimary,
  },
  itemPercent: {
    fontSize: 11,
    color: COLORS.textSecondary,
    fontWeight: '500',
  },
  track: {
    height: 8,
    backgroundColor: COLORS.surfaceMuted,
    borderRadius: 4,
    overflow: 'hidden',
  },
  fill: {
    height: '100%',
    borderRadius: 4,
  },
  emptyText: {
    fontSize: 12,
    color: COLORS.textDisabled,
    fontStyle: 'italic',
    marginTop: 8,
  },
});
