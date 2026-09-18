import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, TYPOGRAPHY } from '../../constants/theme';
import { useAuthStore } from '../../store/useAuthStore';

interface HeaderProps {
  titulo: string;
}

const Header = ({ titulo }: HeaderProps) => {
  const logout = useAuthStore(state => state.logout);

  return (
    <View style={styles.container}>
      {/* View vacío a la izquierda para centrar el texto */}
      <View style={{ width: 32 }} /> 
      
      <Text style={styles.title}>{titulo}</Text>
      
      <TouchableOpacity onPress={logout} style={styles.logoutButton}>
        <Ionicons name="log-out-outline" size={24} color={COLORS.error} />
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { 
    flexDirection: 'row',
    justifyContent: 'space-between', 
    alignItems: 'center', 
    backgroundColor: COLORS.paper, 
    paddingHorizontal: 16, 
    paddingVertical: 16, 
    borderBottomWidth: 1, 
    borderBottomColor: COLORS.divider 
  },
  title: { fontSize: TYPOGRAPHY.sizes.h5, fontWeight: 'bold', color: COLORS.textPrimary },
  logoutButton: { padding: 4 }
});

export default Header;