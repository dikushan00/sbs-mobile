import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { COLORS, FONT, SIZES } from '@/constants';
import { Icon } from '@/components/Icon';
import { CustomLoader } from '@/components/common/CustomLoader';
import { ProjectWorkSetType, ProjectFiltersType, SelectedDataType } from '@/components/main/types';
import { getEntranceWorkSets } from '@/components/main/services';

interface WorkTabProps {
  filters: ProjectFiltersType;
  selectedData: SelectedDataType;
}

export const WorkTab: React.FC<WorkTabProps> = ({ filters }) => {
  const [workSets, setWorkSets] = useState<ProjectWorkSetType[] | null>(null);
  const [loading, setLoading] = useState(true);
  const [expandedPlacements, setExpandedPlacements] = useState<Set<number>>(new Set());

  useEffect(() => {
    const fetchWorkSets = async () => {
      setLoading(true);
      const data = await getEntranceWorkSets(filters);
      setWorkSets(data || []);
      setLoading(false);
    };

    fetchWorkSets();
  }, [filters]);

  const togglePlacement = (placementId: number) => {
    const newExpanded = new Set(expandedPlacements);
    if (newExpanded.has(placementId)) {
      newExpanded.delete(placementId);
    } else {
      newExpanded.add(placementId);
    }
    setExpandedPlacements(newExpanded);
  };

  if (loading) {
    return <CustomLoader />;
  }

  if (!workSets || workSets.length === 0) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorText}>Нет данных о работах</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      {workSets.map((placement) => {
        const isPlacementExpanded = expandedPlacements.has(placement.placement_type_id);

        return (
          <View key={placement.placement_type_id} style={styles.placementContainer}>
            <TouchableOpacity
              style={styles.placementHeader}
              onPress={() => togglePlacement(placement.placement_type_id)}
            >
              <View style={styles.placementHeaderLeft}>
                <Icon
                  name={isPlacementExpanded ? "arrowDown" : "arrowRightBlack"}
                  width={13}
                  height={13}
                  fill={COLORS.black}
                />
                <View style={{ marginLeft: 10 }}>
                  <Text style={styles.placementTitle}>{placement.placement_type_name}</Text>
                </View>
              </View>
              <Text style={[
                styles.placementTotal,
                placement.percent === 100 && styles.placementTotalCompleted
              ]}>
                {placement.percent}%
              </Text>
            </TouchableOpacity>

            {isPlacementExpanded && (
              <View style={styles.placementContent}>
                {placement.work_set_check_groups.map((group) => {
                  return (
                    <View key={group.work_set_check_group_id} style={styles.groupContainer}>
                        <View
                          style={[
                            styles.groupHeader,
                            group.work_set_check_group_percent === 100 && styles.groupHeaderCompleted
                          ]}
                        >
                          <View style={styles.groupHeaderLeft}>
                            <View style={{ width: '100%', flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                              <Text style={[
                                styles.groupTitle,
                                group.work_set_check_group_percent === 100 && styles.groupTitleCompleted
                              ]}>
                                {group.work_set_check_group_name}
                              </Text>
                              <Text style={[
                                styles.groupPercent,
                                group.work_set_check_group_percent === 100 && styles.groupPercentCompleted
                              ]}>
                                {group.work_set_check_group_percent}%
                              </Text>
                            </View>
                          </View>
                        </View>
                    </View>
                  );
                })}
              </View>
            )}
          </View>
        );
      })}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.backgroundWhite,
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  errorText: {
    fontSize: SIZES.medium,
    fontFamily: FONT.regular,
    color: COLORS.gray,
  },
  placementContainer: {
    marginBottom: 8,
  },
  placementHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: COLORS.white,
    paddingVertical: 12,
    paddingHorizontal: 16,
  },
  placementHeaderLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  placementTitle: {
    fontSize: 16,
    fontFamily: FONT.medium,
    color: COLORS.black,
  },
  placementPercent: {
    fontSize: SIZES.small,
    fontFamily: FONT.regular,
    color: COLORS.gray,
    marginTop: 2,
  },
  placementTotal: {
    fontSize: SIZES.medium,
    fontFamily: FONT.medium,
    color: COLORS.primary,
  },
  placementTotalCompleted: {
    color: COLORS.green,
  },
  placementContent: {
    backgroundColor: COLORS.background,
    padding: 16,
  },
  groupContainer: {
    marginBottom: 8,
  },
  groupHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.white,
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderRadius: 8,
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
  groupPercent: {
    fontSize: SIZES.small,
    fontFamily: FONT.regular,
    color: COLORS.black,
    marginTop: 2,
  },
  groupContent: {
    backgroundColor: COLORS.white,
    padding: 12,
    marginTop: 4,
    borderRadius: 8,
    gap: 8,
  },
  groupHeaderCompleted: {
    backgroundColor: COLORS.green,
  },
  groupTitleCompleted: {
    color: COLORS.white,
  },
  groupPercentCompleted: {
    color: COLORS.white,
  },
});
