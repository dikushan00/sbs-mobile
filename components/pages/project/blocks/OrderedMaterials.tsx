import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { COLORS, FONT, SIZES } from '@/constants';
import { ProjectMaterialsType } from '@/components/main/types';
import { Block, BlockContainer } from './Block';
import { Icon } from '@/components/Icon';

export const OrderedMaterials = ({data}: {data: ProjectMaterialsType[]}) => {
  const [expandedEntrances, setExpandedEntrances] = useState<Set<number>>(new Set());

  // Вычисляем общую сумму всех материалов
  const totalSum = data.reduce((sum, entrance) => {
    return sum + entrance.materials.reduce((entranceSum, material) => {
      return entranceSum + material.material_sum;
    }, 0);
  }, 0);

  const toggleEntrance = (entrance: number) => {
    const newExpanded = new Set(expandedEntrances);
    if (newExpanded.has(entrance)) {
      newExpanded.delete(entrance);
    } else {
      newExpanded.add(entrance);
    }
    setExpandedEntrances(newExpanded);
  };

  return (
    <BlockContainer>
      <Block>
        <View style={styles.sumBlock}>
          <Text style={styles.sumTitle}>Итого</Text>
          <View style={styles.sumRow}>
            <Text style={styles.sumLabel}>Общая сумма:</Text>
            <Text style={styles.sumValue}>{totalSum.toLocaleString()} ₸</Text>
          </View>
        </View>
      </Block>
      
      {data?.map((entranceData) => (
        <Block key={entranceData.entrance}
        onPress={() => toggleEntrance(entranceData.entrance)}>
          <View 
            style={styles.entranceHeader}
          >
            <Text style={styles.entranceTitle}>Подъезд №{entranceData.entrance}</Text>
            <Icon 
              name="arrowRightAlter" 
              width={16} 
              height={16} 
              fill={COLORS.gray}
              style={expandedEntrances.has(entranceData.entrance) ? styles.arrowIconRotated : styles.arrowIcon}
            />
          </View>
          
          {expandedEntrances.has(entranceData.entrance) && (
            <View style={styles.materialsContainer}>
              {entranceData.materials?.map((material, index) => (
                <View key={index} style={styles.materialItem}>
                  <Text style={styles.materialName}>{material.material_name}</Text>
                  <View style={styles.materialRow}>
                    <Text style={styles.materialLabel}>Кол-во:</Text>
                    <Text style={styles.materialValue}>
                      {material.material_cnt} {material.sell_unit_name}
                    </Text>
                  </View>
                  <View style={styles.materialRow}>
                    <Text style={styles.materialLabel}>Сумма:</Text>
                    <Text style={styles.materialValue}>
                      {material.material_sum.toLocaleString()} ₸
                    </Text>
                  </View>
                </View>
              ))}
            </View>
          )}
        </Block>
      ))}
    </BlockContainer>
  );
};

const styles = StyleSheet.create({
  sumBlock: {
    gap: 8,
  },
  sumTitle: {
    fontSize: SIZES.medium,
    fontFamily: FONT.regular,
    color: COLORS.black,
  },
  sumRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5
  },
  sumLabel: {
    fontSize: SIZES.medium,
    fontFamily: FONT.regular,
    color: COLORS.gray,
  },
  sumValue: {
    fontSize: SIZES.medium,
    fontFamily: FONT.regular,
    color: COLORS.black,
  },
  entranceHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  entranceTitle: {
    fontSize: SIZES.medium,
    fontFamily: FONT.regular,
    color: COLORS.black,
  },
  arrowIcon: {
    transform: [{ rotate: '0deg' }],
  },
  arrowIconRotated: {
    transform: [{ rotate: '90deg' }],
  },
  materialsContainer: {
    marginTop: 15,
    gap: 15,
  },
  materialItem: {
    backgroundColor: '#F2F5F8',
    borderRadius: 6,
    padding: 12,
    gap: 4,
  },
  materialName: {
    fontSize: 13,
    fontFamily: FONT.regular,
    color: COLORS.dark,
  },
  materialRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginTop: 8
  },
  materialLabel: {
    fontSize: SIZES.regular,
    fontFamily: FONT.regular,
    color: COLORS.darkGray,
    minWidth: 50,
  },
  materialValue: {
    fontSize: SIZES.regular,
    fontFamily: FONT.regular,
    color: COLORS.dark,
    flex: 1,
  },
});
