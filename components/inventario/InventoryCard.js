import React from 'react';
import { View, Text, Image, StyleSheet } from 'react-native';

const InventoryCard = ({ producto, modelo, stock, precio, imagen }) => {
  // Colores Stock
  const getStockColor = () => {
    if (stock === 0) return '#d32f2f'; // agotado 
    if (stock <= 2) return '#ed6c02';  // crítico 
    return '#2e7d32';                  // normal
  };

  return (
    <View style={styles.card}>
      <Image source={{ uri: imagen }} style={styles.image} />
      
      <View style={styles.infoContainer}>
        <Text style={styles.title}>{producto}</Text>
        <Text style={styles.subtitle}>{modelo}</Text>
        
        <View style={styles.row}>
          <Text style={[styles.stock, { color: getStockColor() }]}>
            Stock: {stock} un.
          </Text>
          <Text style={styles.price}>USD {precio}</Text>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    backgroundColor: '#ffffff',
    borderRadius: 8,
    padding: 12,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  image: { width: 60, height: 60, borderRadius: 8, marginRight: 12 },
  infoContainer: { flex: 1, justifyContent: 'center' },
  title: { fontSize: 16, fontWeight: '600', marginBottom: 2 },
  subtitle: { fontSize: 12, color: '#666', marginBottom: 8 },
  row: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  stock: { fontSize: 13, fontWeight: '500' },
  price: { fontSize: 15, fontWeight: 'bold', color: '#1976d2' }
});

export default InventoryCard;
