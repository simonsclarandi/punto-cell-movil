import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

const LogCard = ({ fecha, sucursal, usuario, accion, detalle, ip }) => {
  // Lógica de colores basada en tu getEstiloAccion
  const getActionColor = () => {
    const acc = accion.toLowerCase();
    if (acc.includes('fallido') || acc.includes('elimin') || acc.includes('anul')) return '#dc2626'; // Rojo (Error)
    if (acc.includes('venta') || acc.includes('compra') || acc.includes('pago')) return '#16a34a'; // Verde (Éxito)
    if (acc.includes('login') || acc.includes('sesión')) return '#2563eb'; // Azul (Info)
    if (acc.includes('inventario') || acc.includes('stock')) return '#d97706'; // Naranja (Warning)
    return '#475569'; // Gris (Neutral)
  };

  const colorAccion = getActionColor();

  return (
    <View style={styles.card}>
      <View style={styles.header}>
        <Text style={styles.dateText}>{fecha}</Text>
        <View style={styles.branchPill}>
          <Text style={styles.branchText}>{sucursal}</Text>
        </View>
      </View>

      <View style={styles.mainRow}>
        <Text style={[styles.actionText, { color: colorAccion }]}>{accion}</Text>
        <Text style={styles.userText}>{usuario}</Text>
      </View>

      <Text style={styles.detailText} numberOfLines={2}>{detalle}</Text>
      <Text style={styles.ipText}>IP: {ip}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  card: { backgroundColor: '#ffffff', borderRadius: 8, padding: 16, marginBottom: 12, borderWidth: 1, borderColor: '#e2e8f0' },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 },
  dateText: { fontSize: 12, color: '#64748b', fontFamily: 'monospace' },
  branchPill: { backgroundColor: '#f1f5f9', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 12 },
  branchText: { fontSize: 10, fontWeight: 'bold', color: '#475569', textTransform: 'uppercase' },
  mainRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 },
  actionText: { fontSize: 14, fontWeight: 'bold' },
  userText: { fontSize: 13, fontWeight: '600', color: '#0f172a' },
  detailText: { fontSize: 13, color: '#64748b', marginBottom: 8, lineHeight: 18 },
  ipText: { fontSize: 10, color: '#94a3b8', fontFamily: 'monospace', textAlign: 'right' }
});

export default LogCard;