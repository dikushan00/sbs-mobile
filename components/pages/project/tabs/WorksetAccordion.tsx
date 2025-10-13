import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { COLORS, FONT, SIZES } from '@/constants';
import { Icon } from '@/components/Icon';
import { FloorMapWorkSetType, WorkSetType } from '@/components/main/types';
import { numberWithCommas } from '@/utils';

interface MaterialsAccordionProps {
  placement: FloorMapWorkSetType;
  onBack: () => void;
}

export const WorkSetAccordion: React.FC<MaterialsAccordionProps> = ({ placement, onBack }) => {
  const [expandedGroups, setExpandedGroups] = useState<Set<number>>(new Set());

  const toggleGroup = (groupId: number) => {
    const newExpanded = new Set(expandedGroups);
    if (newExpanded.has(groupId)) {
      newExpanded.delete(groupId);
    } else {
      newExpanded.add(groupId);
    }
    setExpandedGroups(newExpanded);
  };

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      <View style={styles.header}>
        <TouchableOpacity onPress={onBack} style={styles.backButton}>
          <View style={styles.backButtonIcon}>
            <Icon name="arrowRightAlt" width={20} height={20} fill={COLORS.gray} />
          </View>
          <Text style={styles.headerTitle}>{placement?.placement_type_name}</Text>
        </TouchableOpacity>
      </View>

      {placement?.work_set_check_groups.map((group) => {
        const isExpanded = expandedGroups.has(group.work_set_check_group_id);

        return (
          <View key={group.work_set_check_group_id} style={styles.groupContainer}>
            <TouchableOpacity
              style={styles.groupHeader}
              onPress={() => toggleGroup(group.work_set_check_group_id)}
            >
              <View style={styles.groupHeaderLeft}>
                <Icon
                  name={isExpanded ? "arrowDown" : "arrowRightBlack"}
                  width={13}
                  height={13}
                  fill={COLORS.gray}
                />
                <View style={{marginLeft: 10}}>
                  <Text style={styles.groupTitle}>{group.work_set_check_group_name}</Text>
                  <Text style={styles.groupTotalAlt}>{numberWithCommas(group.total_sum)} 〒</Text>
                </View>
              </View>
            </TouchableOpacity>

            {isExpanded && (
              <View style={styles.groupContent}>
                {group.work_sets.map((workSet) => (
                  <WorkSetItem key={workSet.work_set_id} workSet={workSet} />
                ))}
              </View>
            )}
          </View>
        );
      })}
    </ScrollView>
  );
};

interface WorkSetItemProps {
  workSet: WorkSetType;
}

const WorkSetItem: React.FC<WorkSetItemProps> = ({ workSet }) => {
  return (
    <View style={styles.workSetContainer}>
      <View style={styles.workSetHeader}>
        <Text style={styles.workSetName}>{workSet.work_set_name}</Text>
      </View>
      
      <View style={styles.workSetDetails}>
        
        <View style={styles.workSetMeta}>
          <View style={styles.quantitySection}>
            <Text style={styles.detailLabel}>Количество</Text>
            <Text style={styles.detailValue}>
              {numberWithCommas(workSet.num)} {workSet.unit_name}
            </Text>
          </View>
          
          <View style={styles.sumSection}>
            <Text style={styles.detailLabel}>Сумма, 〒</Text>
            <Text style={styles.detailValue}>
              {numberWithCommas(workSet.total_sum)}
            </Text>
          </View>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: 15
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
  },
  backButton: {
    flexDirection: 'row',
    padding: 5
  },
  backButtonIcon: {
    marginRight: 10,
    transform: [{ rotate: '180deg' }],
  },
  headerTitle: {
    fontSize: SIZES.medium,
    fontFamily: FONT.regular,
    color: COLORS.black,
    flex: 1,
  },
  groupContainer: {
    marginBottom: 8,
  },
  groupHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: COLORS.white,
    paddingVertical: 12,
  },
  groupHeaderLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  groupTitle: {
    fontSize: 15,
    fontFamily: FONT.regular,
    color: COLORS.black,
  },
  groupTotal: {
    fontSize: SIZES.regular,
    fontFamily: FONT.medium,
  },
  groupTotalAlt: {
    fontSize: SIZES.small,
    fontFamily: FONT.regular,
    color: COLORS.gray,
  },
  groupContent: {
    backgroundColor: COLORS.white,
    gap: 10
  },
  workSetContainer: {
    paddingVertical: 12,
    backgroundColor: COLORS.background,
    padding: 12,
    borderRadius: 8,
    gap: 5
  },
  workSetHeader: {
    marginBottom: 8,
  },
  workSetName: {
    fontSize: SIZES.regular,
    fontFamily: FONT.medium,
    color: COLORS.black,
  },
  workSetDetails: {
  },
  materialInfo: {
    marginBottom: 8,
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
  workSetMeta: {
    flexDirection: 'row',
    gap: 85,
    marginTop: 7
  },
  quantitySection: {
    flex: 1,
  },
  sumSection: {
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
