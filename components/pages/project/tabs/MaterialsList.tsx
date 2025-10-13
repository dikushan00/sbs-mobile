import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { COLORS, FONT, SIZES } from '@/constants';
import { MaterialType } from '@/components/main/types';
import { numberWithCommas } from '@/utils';

interface MaterialsListProps {
  materials: MaterialType[];
}

export const MaterialsList: React.FC<MaterialsListProps> = ({ materials }) => {
  const totalSum = materials.reduce((sum, material) => sum + material.material_sum, 0);

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Список материалов</Text>
      
      {materials.map((material, index) => (
        <View key={material.material_id} style={styles.materialBlock}>
          <View style={styles.materialHeader}>
            <Text style={styles.materialLabel}>Материал</Text>
            <Text style={styles.materialName}>{material.material_name}</Text>
          </View>
          
          <View style={styles.materialDetails}>
            <View style={styles.quantitySection}>
              <Text style={styles.detailLabel}>Количество</Text>
              <Text style={styles.detailValue}>
                {numberWithCommas(material.material_amount)} {material.sell_unit_name}
              </Text>
            </View>
            <View style={styles.sumSection}>
              <Text style={styles.detailLabel}>Сумма, ₸</Text>
              <Text style={styles.detailValue}>
                {numberWithCommas(material.material_sum)}
              </Text>
            </View>
          </View>
          
          {index < materials.length - 1 && <View style={styles.separator} />}
        </View>
      ))}
      
      <View style={styles.totalContainer}>
        <Text style={styles.totalLabel}>Итоговая сумма, ₸</Text>
        <Text style={styles.totalValue}>{numberWithCommas(totalSum)}</Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingTop: 16,
    marginTop: 15
  },
  title: {
    fontSize: 17,
    fontFamily: FONT.regular,
    color: COLORS.black,
    marginBottom: 5,
    marginTop: 10
  },
  materialBlock: {
    backgroundColor: COLORS.white,
  },
  materialHeader: {
    paddingVertical: 12,
  },
  materialLabel: {
    fontSize: SIZES.small,
    fontFamily: FONT.regular,
    color: COLORS.gray,
    marginBottom: 4,
  },
  materialName: {
    fontSize: SIZES.regular,
    fontFamily: FONT.regular,
    color: COLORS.black,
  },
  materialDetails: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingBottom: 12,
  },
  quantitySection: {
    flex: 1,
  },
  sumSection: {
    flex: 1,
    alignItems: 'flex-end',
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
  separator: {
    height: 1,
    backgroundColor: COLORS.grayLight,
  },
  totalContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 16,
    backgroundColor: COLORS.white,
    marginTop: 8,
  },
  totalLabel: {
    fontSize: SIZES.medium,
    fontFamily: FONT.regular,
    color: COLORS.black,
  },
  totalValue: {
    fontSize: SIZES.medium,
    fontFamily: FONT.regular,
    color: COLORS.black,
  },
});
