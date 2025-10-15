import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { COLORS, FONT, SIZES } from '@/constants';
import { numberWithCommas } from '@/utils';

interface ValueDisplayProps {
  value: number;
  suffix?: string;
  label?: string;
  valueStyle?: any;
  labelStyle?: any;
  containerStyle?: any;
  formatter?: (value: number) => string;
}

export const ValueDisplay: React.FC<ValueDisplayProps> = ({
  value,
  suffix = '',
  label = 'Значение',
  valueStyle,
  labelStyle,
  containerStyle,
  formatter = numberWithCommas,
}) => {
  return (
    <View style={[styles.valueSection, containerStyle]}>
      <Text style={[styles.detailLabel, labelStyle]}>{label}</Text>
      <Text style={[styles.detailValue, valueStyle]}>
        {formatter(value)}{suffix ? ` ${suffix}` : ''}
      </Text>
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
