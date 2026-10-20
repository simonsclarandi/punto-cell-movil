import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { COLORS, TYPOGRAPHY, SHADOWS, SPACING } from '../../constants/theme';

export interface TimelinePoint {
  period: string; // 'YYYY-MM-DD' o etiqueta corta
  value: number;
  label?: string;
  formattedValue?: string;
}

interface TimelineBarChartProps {
  title: string;
  subtitle?: string;
  data: TimelinePoint[];
  barColor?: string;
  height?: number;
}

export default function TimelineBarChart({
  title,
  subtitle,
  data,
  barColor = COLORS.primary,
  height = 140,
}: TimelineBarChartProps) {
  if (!data || data.length === 0) {
    return (
      <View style={styles.card}>
        <Text style={styles.title}>{title}</Text>
        <Text style={styles.emptyText}>No hay datos evolutivos para el período seleccionado.</Text>
      </View>
    );
  }

  const maxValue = Math.max(...data.map(p => p.value), 1);
  const totalPeriod = data.reduce((acc, p) => acc + p.value, 0);

  return (
    <View style={styles.card}>
      <View style={styles.header}>
        <View>
          <Text style={styles.title}>{title}</Text>
          {subtitle ? <Text style={styles.subtitle}>{subtitle}</Text> : null}
        </View>
        <Text style={styles.headerTotal}>
          Total: {totalPeriod.toLocaleString('es-AR')}
        </Text>
      </View>

      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.scrollContainer}>
        <View style={[styles.chartArea, { height }]}>
          {data.map((point, index) => {
            const barHeight = Math.max((point.value / maxValue) * (height - 35), 4);
            const shortDate = point.period.length >= 10 ? point.period.substring(5) : point.period;

            return (
              <View key={index} style={styles.columnContainer}>
                <View style={styles.barWrapper}>
                  {point.value > 0 ? (
                    <Text style={styles.valueAboveBar} numberOfLines={1}>
                      {point.value >= 1000 ? `${(point.value / 1000).toFixed(1)}k` : Math.round(point.value)}
                    </Text>
                  ) : null}
                  <View 
                    style={[
                      styles.bar, 
                      { 
                        height: barHeight, 
                        backgroundColor: point.value > 0 ? barColor : COLORS.divider 
                      }
                    ]} 
                  />
                </View>
                <Text style={styles.dateLabel} numberOfLines={1}>
                  {point.label || shortDate}
                </Text>
              </View>
            );
          })}
        </View>
      </ScrollView>
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
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'baseline',
    marginBottom: 16,
  },
  title: {
    fontSize: 14,
    fontWeight: '700',
    color: COLORS.textPrimary,
  },
  subtitle: {
    fontSize: 11,
    color: COLORS.textSecondary,
    marginTop: 2,
  },
  headerTotal: {
    fontSize: 12,
    fontWeight: '800',
    color: COLORS.primary,
  },
  scrollContainer: {
    paddingRight: 10,
  },
  chartArea: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: 10,
    paddingBottom: 4,
  },
  columnContainer: {
    alignItems: 'center',
    width: 36,
  },
  barWrapper: {
    alignItems: 'center',
    justifyContent: 'flex-end',
    flex: 1,
  },
  valueAboveBar: {
    fontSize: 9,
    fontWeight: '700',
    color: COLORS.textSecondary,
    marginBottom: 4,
  },
  bar: {
    width: 14,
    borderRadius: 7,
  },
  dateLabel: {
    fontSize: 10,
    fontWeight: '600',
    color: COLORS.textDisabled,
    marginTop: 6,
  },
  emptyText: {
    fontSize: 12,
    color: COLORS.textDisabled,
    fontStyle: 'italic',
    marginTop: 8,
  },
});
