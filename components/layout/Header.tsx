import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { COLORS, TYPOGRAPHY } from '../../constants/theme';

interface HeaderProps {
  titulo: string;
}

const Header = ({ titulo }: HeaderProps) => {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>{titulo}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { 
    justifyContent: 'center', 
    alignItems: 'center',
    backgroundColor: COLORS.paper, 
    paddingHorizontal: 16, 
    paddingVertical: 16, 
    borderBottomWidth: 1, 
    borderBottomColor: COLORS.divider 
  },
  title: { 
    fontSize: TYPOGRAPHY.sizes.h5, 
    fontWeight: 'bold', 
    color: COLORS.textPrimary 
  },
});

export default Header;