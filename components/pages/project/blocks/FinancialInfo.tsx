import React, { useMemo } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { COLORS, FONT, SIZES } from '@/constants';
import { ProjectSums } from '@/components/main/types';
import { Block, BlockContainer } from './Block';
import { numberWithCommas } from '@/utils';
import { NotFound } from '@/components/common/NotFound';

export const FinancialInfo = ({data}: {data: ProjectSums[]}) => {

  const totalInfo = useMemo(() => {
    if(!data.length) return null
    return data.reduce((sum, item) => {
      return {
        total_sum: sum.total_sum + item.total_sum,
        paid_sum: sum.paid_sum + item.paid_sum,
        processing_sum: sum.processing_sum + item.processing_sum,
        remaining_sum: sum.remaining_sum + item.remaining_sum,
      }
    }, {total_sum: 0, paid_sum: 0, processing_sum: 0, remaining_sum: 0})
  }, [data]);

  if(!totalInfo) return <View>
    <NotFound title='Не найдено данных' />
  </View>
  return (
    <BlockContainer>
      <Block>
        <Text style={{fontSize: 16, marginBottom: 5}}>Итого</Text>
        <View style={styles.assignTypeSection}>
          <Text style={styles.assignTypeLabel}>Общая сумма:</Text>
          <Text style={styles.assignTypeValue}>{numberWithCommas(totalInfo.total_sum)} тг</Text>
        </View>
        <View style={styles.assignTypeSection}>
          <Text style={styles.assignTypeLabel}>Оплаченная сумма:</Text>
          <Text style={styles.assignTypeValue}>{numberWithCommas(totalInfo.paid_sum)} тг</Text>
        </View>
        <View style={styles.assignTypeSection}>
          <Text style={styles.assignTypeLabel}>Ожидается оплата:</Text>
          <Text style={styles.assignTypeValue}>{numberWithCommas(totalInfo.processing_sum)} тг</Text>
        </View>
        <View style={styles.assignTypeSection}>
          <Text style={styles.assignTypeLabel}>Остаток:</Text>
          <Text style={styles.assignTypeValue}>{numberWithCommas(totalInfo.remaining_sum)} тг</Text>
        </View>
        </Block>
      {data.map((sum) => (
        <Block key={sum.entrance}>
          <Text style={{fontSize: 16, marginBottom: 5}}>{`Подъезд ${sum.entrance}`}</Text>
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
