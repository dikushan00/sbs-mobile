import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { COLORS, FONT, SIZES } from '@/constants';
import { ProjectSums } from '@/components/main/types';
import { Block, BlockContainer } from './Block';
import { numberWithCommas } from '@/utils';

export const FinancialInfo = ({data}: {data: ProjectSums[]}) => {
  return (
    <BlockContainer>
      {data.map((sum) => (
        <Block key={sum.entrance}>
          <Text style={{fontSize: 16, marginBottom: 5}}>Итого</Text>
          <View style={styles.assignTypeSection}>
            <Text style={styles.assignTypeLabel}>Общая сумма:</Text>
            <Text style={styles.assignTypeValue}>{numberWithCommas(sum.total_sum)} тг</Text>
            </View>
            <View style={styles.assignTypeSection}>
              <Text style={styles.assignTypeLabel}>Оплаченная сумма:</Text>
              <Text style={styles.assignTypeValue}>{numberWithCommas(sum.paid_sum)} тг</Text>
            </View>
            <View style={styles.assignTypeSection}>
              <Text style={styles.assignTypeLabel}>Ожидается оплата:</Text>
              <Text style={styles.assignTypeValue}>{numberWithCommas(sum.processing_sum)} тг</Text>
            </View>
            <View style={styles.assignTypeSection}>
              <Text style={styles.assignTypeLabel}>Остаток:</Text>
              <Text style={styles.assignTypeValue}>{numberWithCommas(sum.remaining_sum)} тг</Text>
            </View>
        </Block>
      ))}
    </BlockContainer>
  );
};

const styles = StyleSheet.create({
  assignTypeSection: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    flexWrap: 'wrap',
    marginTop: 8,
  },
  assignTypeLabel: {
    fontSize: 14,
    fontFamily: FONT.regular,
    color: COLORS.darkGray,
    marginRight: 8,
    flex: 0,
  },
  assignTypeValue: {
    fontSize: 14,
    fontFamily: FONT.regular,
    color: COLORS.dark,
    flex: 1,
    flexWrap: 'wrap',
  },
});
