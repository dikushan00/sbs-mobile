import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { COLORS, FONT, SIZES } from '@/constants';

export const FinancialInfo: React.FC = () => {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Финансовая информация</Text>
      <Text style={styles.subtitle}>Контент для финансовой информации</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: COLORS.backgroundWhite,
  },
  title: {
    fontSize: SIZES.large,
    fontFamily: FONT.bold,
    color: COLORS.black,
    marginBottom: 8,
  },
  subtitle: {
    fontSize: SIZES.medium,
    fontFamily: FONT.regular,
    color: COLORS.gray,
  },
});
