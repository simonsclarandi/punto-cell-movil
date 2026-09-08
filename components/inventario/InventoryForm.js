import React, { useState } from 'react';
import { View, Text, TextInput, StyleSheet, ScrollView, TouchableOpacity, Switch } from 'react-native';

const InventoryForm = ({ onCancel }) => {
  const [esSerializado, setEsSerializado] = useState(true);

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.pageTitle}>Registrar Ingreso</Text>

      <View style={styles.card}>
        <View style={styles.switchRow}>
          <Text style={styles.sectionTitle}>1. Detalles del Producto</Text>
          <Switch value={esSerializado} onValueChange={setEsSerializado} />
        </View>

        <Text style={styles.label}>Modelo *</Text>
        <TextInput style={styles.input} placeholder="Ej. iPhone 13 Pro" />

        {esSerializado && (
          <>
            <Text style={styles.label}>IMEI / Serial *</Text>
            <TextInput style={styles.input} placeholder="15 dígitos" keyboardType="numeric" maxLength={15} />
          </>
        )}

        <Text style={styles.label}>Color</Text>
        <TextInput style={styles.input} placeholder="Ej. Graphite" />
      </View>

      <View style={styles.card}>
        <Text style={styles.sectionTitle}>2. Precios (USD)</Text>
        <Text style={styles.label}>Precio Público (Venta) *</Text>
        <TextInput style={styles.inputHighlight} placeholder="U$S 0.00" keyboardType="decimal-pad" />
      </View>

      <View style={styles.buttonRow}>
        <TouchableOpacity style={styles.cancelButton} onPress={onCancel}>
          <Text style={styles.cancelText}>Cancelar</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.saveButton}>
          <Text style={styles.saveText}>GUARDAR INGRESO</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f8fafc', padding: 16 },
  pageTitle: { fontSize: 24, fontWeight: 'bold', marginBottom: 20 },
  card: { backgroundColor: 'white', padding: 16, borderRadius: 12, marginBottom: 16 },
  sectionTitle: { fontSize: 14, fontWeight: 'bold', color: '#0f172a', marginBottom: 16 },
  switchRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 },
  label: { fontSize: 12, color: '#64748b', marginBottom: 4 },
  input: { borderWidth: 1, borderColor: '#e2e8f0', borderRadius: 8, padding: 12, marginBottom: 12, backgroundColor: '#f8fafc' },
  inputHighlight: { borderWidth: 1, borderColor: '#86efac', borderRadius: 8, padding: 12, marginBottom: 12, backgroundColor: '#f0fdf4', fontSize: 16, fontWeight: 'bold' },
  buttonRow: { flexDirection: 'row', justifyContent: 'flex-end', gap: 12, paddingBottom: 40 },
  cancelButton: { padding: 16, borderRadius: 8, backgroundColor: 'white', borderWidth: 1, borderColor: '#e2e8f0' },
  cancelText: { color: '#64748b', fontWeight: 'bold' },
  saveButton: { padding: 16, borderRadius: 8, backgroundColor: '#2563eb' },
  saveText: { color: 'white', fontWeight: 'bold' }
});

export default InventoryForm;
