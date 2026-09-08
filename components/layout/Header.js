import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons'; 
import { COLORS, TYPOGRAPHY, SHADOWS, SPACING } from '../../constants/theme';

const Header = ({ titulo, onMenuPress }) => {
  return (
    <View style={styles.container}>
      <TouchableOpacity onPress={onMenuPress} style={styles.iconButton}>
        <Ionicons name="menu" size={28} color="#0f172a" />
      </TouchableOpacity>
      
      <Text style={styles.title}>{titulo}</Text>
      
      {/* Espaciador vacío para que el título quede perfectamente centrado */}
      <View style={{ width: 28 }} />
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', backgroundColor: COLORS.paper, paddingHorizontal: 16, paddingVertical: 16, borderBottomWidth: 1, borderBottomColor: COLORS.divider },
  iconButton: { padding: 4 },
  title: { fontSize: TYPOGRAPHY.sizes.h5, fontWeight: 'bold', color: COLORS.textPrimary },
});

export default Header;