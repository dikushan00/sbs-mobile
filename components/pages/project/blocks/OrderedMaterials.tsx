import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { COLORS, FONT, SIZES } from '@/constants';
import { ProjectMaterialsType } from '@/components/main/types';
import { numberWithCommas } from '@/utils';
import { NotFound } from '@/components/common/NotFound';

export const OrderedMaterials = ({ data }: { data: ProjectMaterialsType[] }) => {
  // Вычисляем общую сумму всех материалов
  const totalSum = data.reduce((sum, entrance) => {
    return sum + entrance.materials.reduce((entranceSum, material) => {
      return entranceSum + material.material_sum;
    }, 0);
  }, 0);

  if (!data.length) {
    return (
      <View>
        <NotFound title="Не найдено данных" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Итого */}
      <View style={[styles.card, styles.cardFirst]}>
        <View style={styles.totalRow}>
          <Text style={styles.totalTitle}>Итого</Text>
          <Text style={styles.totalValue}>{numberWithCommas(totalSum)} ₸</Text>
        </View>
      </View>

      <ScrollView>
      {/* По подъездам */}
        {data.map((entranceData, entranceIndex) => (
          <View 
            key={entranceData.entrance} 
            style={[
              styles.card, 
              {marginBottom: 12},
              entranceIndex === data.length - 1 && styles.cardLast
            ]}
          >
            <Text style={styles.entranceTitle}>Подъезд {entranceData.entrance}</Text>
            
            <View style={styles.materialsContainer}>
              {entranceData.materials?.map((material, index) => (
                <View key={index}>
                  {index > 0 && <View style={styles.materialDivider} />}
                  <View style={styles.materialItem}>
                    <Text style={styles.materialName}>{material.material_name}</Text>
                    <View style={styles.materialRow}>
                      <Text style={styles.materialLabel}>Количество:</Text>
                      <Text style={styles.materialValue}>
                        {numberWithCommas(material.material_cnt)} {material.sell_unit_name}
                      </Text>
                    </View>
                    <View style={styles.materialRow}>
                      <Text style={styles.materialLabel}>Сумма:</Text>
                      <Text style={styles.materialValue}>
                        {numberWithCommas(material.material_sum)} ₸
                      </Text>
                    </View>
                  </View>
                </View>
              ))}
            </View>
          </View>
        ))}
      </ScrollView>
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
  totalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  totalTitle: {
    fontSize: 15,
    fontFamily: FONT.medium,
    color: '#242424',
  },
  totalValue: {
    fontSize: 16,
    fontFamily: FONT.medium,
    color: '#242424',
  },
  entranceTitle: {
    fontSize: 15,
    fontFamily: FONT.medium,
    color: '#242424',
    marginBottom: 12,
  },
  materialsContainer: {
    gap: 0,
  },
  materialDivider: {
    height: 1,
    backgroundColor: '#F0F0F0',
    marginVertical: 12,
  },
  materialItem: {
    gap: 6,
  },
  materialName: {
    fontSize: 14,
    fontFamily: FONT.regular,
    color: '#242424',
    marginBottom: 4,
  },
  materialRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  materialLabel: {
    fontSize: SIZES.small,
    fontFamily: FONT.regular,
    color: COLORS.gray,
    marginRight: 6,
  },
  materialValue: {
    fontSize: SIZES.small,
    fontFamily: FONT.medium,
    color: '#242424',
  },
});
