import React from 'react';
import { View, Text, Image, StyleSheet } from 'react-native';
import { COLORS, TYPOGRAPHY, SHADOWS, SPACING } from '../../constants/theme';

// props
interface InventoryCardProps {
  producto: string;
  modelo: string;
  stock: number;
  precio: number;
  imagen: string;
}

const InventoryCard = ({ producto, modelo, stock, precio, imagen }: InventoryCardProps) => {
  const getStockColor = () => {
    if (stock === 0) return COLORS.error; 
    if (stock <= 2) return COLORS.warning;  
    return COLORS.success;                  
  };

  const precioFormateado = Number(precio || 0).toFixed(2);

  return (
    <View style={styles.card}>
      <Image 
        source={{ uri: imagen }} 
        style={styles.image} 
        resizeMode="contain"
      />
      
      <View style={styles.infoContainer}>
        <Text style={styles.title} numberOfLines={1}>{producto}</Text>
        <Text style={styles.subtitle} numberOfLines={1}>{modelo}</Text>
        
        <View style={styles.row}>
          <Text style={[styles.stock, { color: getStockColor() }]}>
            Stock: {stock} un.
          </Text>
          <Text style={styles.price}>USD {precioFormateado}</Text>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    backgroundColor: COLORS.paper,
    borderRadius: SPACING.borderRadius,
    padding: 12,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: COLORS.divider,
    ...SHADOWS.lift,
  },
  image: { 
    width: 60, 
    height: 60, 
    borderRadius: SPACING.smallRadius, 
    marginRight: 12, 
    backgroundColor: '#f8fafc' 
  },
  infoContainer: { flex: 1, justifyContent: 'center' },
  title: { fontSize: TYPOGRAPHY.sizes.h6, fontWeight: '600', color: COLORS.textPrimary, marginBottom: 2 },
  subtitle: { fontSize: 12, color: COLORS.textSecondary, marginBottom: 8 },
  row: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  stock: { fontSize: 13, fontWeight: 'bold' },
  price: { fontSize: 15, fontWeight: '900', color: COLORS.primary }
});

export default InventoryCard;