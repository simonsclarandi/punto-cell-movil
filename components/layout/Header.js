import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons'; 
import { COLORS, TYPOGRAPHY } from '../../constants/theme';
import { useNavigationStore } from '../../store/useNavigationStore';

const Header = ({ titulo }) => {
  const setMenuAbierto = useNavigationStore(state => state.setMenuAbierto);

  return (
    <View style={styles.container}>
      <TouchableOpacity onPress={() => setMenuAbierto(true)} style={styles.iconButton}>
        <Ionicons name="menu" size={28} color={COLORS.textPrimary} />
      </TouchableOpacity>
      
      <Text style={styles.title}>{titulo}</Text>
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