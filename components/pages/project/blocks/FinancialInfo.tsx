import React, { useMemo } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { COLORS, FONT, SIZES } from '@/constants';
import { ProjectSums } from '@/components/main/types';
import { numberWithCommas } from '@/utils';
import { NotFound } from '@/components/common/NotFound';

interface FinancialCardProps {
  title: string;
  totalSum: number;
  paidSum: number;
  processingSum: number;
  remainingSum: number;
  isFirst?: boolean;
  isLast?: boolean;
}

const FinancialCard: React.FC<FinancialCardProps> = ({
  title,
  totalSum,
  paidSum,
  processingSum,
  remainingSum,
  isFirst = false,
  isLast = false,
}) => {
  const paymentPercentage = totalSum > 0 ? Math.min((paidSum / totalSum) * 100, 100) : 0;

  return (
    <View style={[styles.card, isFirst && styles.cardFirst, isLast && styles.cardLast]}>
      <Text style={styles.cardTitle}>{title}</Text>
      
      {/* Общая сумма и Ожидается */}
      <View style={styles.summaryRow}>
        <View style={styles.summaryItem}>
          <Text style={styles.summaryLabel}>Общая сумма</Text>
          <Text style={styles.summaryValue}>{numberWithCommas(totalSum)} ₸</Text>
        </View>
        <View style={styles.summaryDivider} />
        <View style={styles.summaryItem}>
          <Text style={styles.summaryLabel}>Ожидается</Text>
          <Text style={styles.summaryValue}>{numberWithCommas(processingSum)} ₸</Text>
        </View>
      </View>

      {/* Прогресс-бар */}
      <View style={styles.progressBarContainer}>
        {paymentPercentage > 0 && (
          <View style={[styles.progressBarFill, { flex: paymentPercentage }]} />
        )}
        {paymentPercentage < 100 && (
          <View style={[styles.progressBarRemaining, { flex: 100 - paymentPercentage }]} />
        )}
      </View>

      {/* Оплачено и Остаток */}
      <View style={styles.legendRow}>
        <View style={styles.legendItem}>
          <Text style={styles.legendLabelGreen}>Оплачено</Text>
          <Text style={styles.legendValueGreen}>{numberWithCommas(paidSum)} ₸</Text>
        </View>
        <View style={styles.legendItem}>
          <Text style={styles.legendLabelRed}>Остаток</Text>
          <Text style={styles.legendValueRed}>{numberWithCommas(remainingSum)} ₸</Text>
        </View>
      </View>
    </View>
  );
};

export const FinancialInfo = ({ data }: { data: ProjectSums[] }) => {
  const totalInfo = useMemo(() => {
    if (!data.length) return null;
    return data.reduce(
      (sum, item) => ({
        total_sum: sum.total_sum + item.total_sum,
        paid_sum: sum.paid_sum + item.paid_sum,
        processing_sum: sum.processing_sum + item.processing_sum,
        remaining_sum: sum.remaining_sum + item.remaining_sum,
      }),
      { total_sum: 0, paid_sum: 0, processing_sum: 0, remaining_sum: 0 }
    );
  }, [data]);

  if (!totalInfo) {
    return (
      <View>
        <NotFound title="Не найдено данных" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Итого */}
      <FinancialCard
        title="Итого"
        totalSum={totalInfo.total_sum}
        paidSum={totalInfo.paid_sum}
        processingSum={totalInfo.processing_sum}
        remainingSum={totalInfo.remaining_sum}
        isFirst
      />

      {/* По подъездам */}
      {data.map((sum, index) => (
        <FinancialCard
          key={sum.entrance}
          title={`Подъезд ${sum.entrance}`}
          totalSum={sum.total_sum}
          paidSum={sum.paid_sum}
          processingSum={sum.processing_sum}
          remainingSum={sum.remaining_sum}
          isLast={index === data.length - 1}
        />
      ))}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    gap: 12,
    backgroundColor: COLORS.backgroundNew,
  },
  card: {
    backgroundColor: COLORS.white,
    borderRadius: 16,
    padding: 16,
  },
  cardFirst: {
    borderTopLeftRadius: 0,
    borderTopRightRadius: 0,
  },
  cardLast: {
    borderBottomLeftRadius: 0,
    borderBottomRightRadius: 0,
  },
  cardTitle: {
    fontSize: 15,
    fontFamily: FONT.medium,
    color: '#242424',
    marginBottom: 12,
  },
  summaryRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 15,
    marginBottom: 12,
  },
  summaryItem: {
    flex: 1,
  },
  summaryLabel: {
    fontSize: SIZES.small,
    fontFamily: FONT.regular,
    color: COLORS.gray,
    marginBottom: 2,
  },
  summaryValue: {
    fontSize: 16,
    fontFamily: FONT.medium,
    color: '#242424',
  },
  summaryDivider: {
    width: 1,
    backgroundColor: '#E0E0E0',
    height: 32,
  },
  progressBarContainer: {
    flexDirection: 'row',
    height: 4,
    gap: 4,
    marginBottom: 12,
  },
  progressBarFill: {
    height: '100%',
    backgroundColor: '#64CA31',
    borderRadius: 2,
  },
  progressBarRemaining: {
    height: '100%',
    backgroundColor: '#F63942',
    borderRadius: 2,
  },
  legendRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  legendItem: {},
  legendLabelGreen: {
    fontSize: SIZES.small,
    fontFamily: FONT.regular,
    color: '#64CA31',
    marginBottom: 2,
  },
  legendValueGreen: {
    fontSize: 14,
    fontFamily: FONT.medium,
    color: '#64CA31',
  },
  legendLabelRed: {
    fontSize: SIZES.small,
    fontFamily: FONT.regular,
    color: '#F63942',
    textAlign: 'right',
    marginBottom: 2,
  },
  legendValueRed: {
    fontSize: 14,
    fontFamily: FONT.medium,
    color: '#F63942',
    textAlign: 'right',
  },
});
