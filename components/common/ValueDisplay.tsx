import React from 'react';
import { View, Text, StyleSheet, StyleProp, ViewStyle } from 'react-native';
import { COLORS, FONT, SIZES } from '@/constants';

interface ValueDisplayProps {
  label: string;
  value: string | number;
  style?: any;
}

export const ValueDisplay: React.FC<ValueDisplayProps> = ({
  label,
  value,
  style,
}) => {
  let wrapperStyles = {
    ...styles.valueSection, 
  }
  if(style)
    wrapperStyles = {...wrapperStyles, ...style}
  return (
    <View style={styles.valueSection}>
      <Text style={styles.detailLabel}>{label}</Text>
      <Text style={styles.detailValue}>{value}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  valueSection: {
    flex: 1,
  },
  detailLabel: {
    fontSize: SIZES.small,
    fontFamily: FONT.regular,
    color: COLORS.gray,
    marginBottom: 4,
  },
  detailValue: {
    fontSize: SIZES.regular,
    fontFamily: FONT.regular,
    color: COLORS.black,
  },
});
