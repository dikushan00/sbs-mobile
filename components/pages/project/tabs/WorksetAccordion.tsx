import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, ActivityIndicator } from 'react-native';
import { COLORS, FONT, SIZES } from '@/constants';
import { Icon } from '@/components/Icon';
import { FloorMapWorkSetsResponseType, FloorMapWorkSetType, WorkSetType } from '@/components/main/types';
import { numberWithCommas } from '@/utils';
import { completeWorkSet, callOKK } from '@/components/main/services';
import { useSnackbar } from '@/components/snackbar/SnackbarContext';
import { useDispatch } from 'react-redux';
import { setPageHeaderData } from '@/services/redux/reducers/userApp';

interface MaterialsAccordionProps {
  placement: FloorMapWorkSetType;
  onBack: () => void;
  floor_map_id: number;
  setWorkSets: (workSets: FloorMapWorkSetsResponseType) => void;
}

export const WorkSetAccordion: React.FC<MaterialsAccordionProps> = ({ placement, onBack, floor_map_id, setWorkSets }) => {
  const dispatch = useDispatch()
  const [expandedGroups, setExpandedGroups] = useState<Set<number>>(new Set());
  const [groupCheckLoadingStates, setGroupCheckLoadingStates] = useState<Set<number>>(new Set());
  const [okkLoadingStates, setOkkLoadingStates] = useState<Set<string>>(new Set());
  const [workSetLoadingStates, setWorkSetLoadingStates] = useState<Set<number>>(new Set());

  const { showSuccessSnackbar } = useSnackbar();

  useEffect(() => {
    dispatch(
      setPageHeaderData({
        title: `Вызок ОКК (${placement.placement_type_name})`,
      })
    );
  }, [placement])

  const toggleGroup = (groupId: number) => {
    const newExpanded = new Set(expandedGroups);
    if (newExpanded.has(groupId)) {
      newExpanded.delete(groupId);
    } else {
      newExpanded.add(groupId);
    }
    setExpandedGroups(newExpanded);
  };

  const handleCheckboxPress = async (group: any) => {
    setGroupCheckLoadingStates(prev => new Set([...prev, group.work_set_check_group_id]));
    
    try {
      const res = await completeWorkSet(floor_map_id, {
        is_ready: group.is_ready_for_work_set_check_group !== 'full', 
        work_set_id: null,
        placement_type_id: placement.placement_type_id,
        work_set_check_group_id: group.work_set_check_group_id
      });
      
      if(!res) return;
      setWorkSets(res);
      showSuccessSnackbar('Успешно');
    } catch (error) {
      console.error('Error completing work set:', error);
    } finally {
      setGroupCheckLoadingStates(prev => {
        const newSet = new Set(prev);
        newSet.delete(group.work_set_check_group_id);
        return newSet;
      });
    }
  };

  const handleCallOKK = async (group: any) => {
    const loadingKey = `${group.work_set_check_group_id}_${placement.placement_type_id}`;
    
    setOkkLoadingStates(prev => new Set([...prev, loadingKey]));
    const res = await callOKK(floor_map_id, {
      placement_type_id: placement.placement_type_id,
      work_set_check_group_id: group.work_set_check_group_id
    });
    setOkkLoadingStates(prev => {
      const newSet = new Set(prev);
      newSet.delete(loadingKey);
      return newSet;
    });
    if(!res) return;
    setWorkSets(res);
    showSuccessSnackbar('Успешно');
  };

  const handleWorkSetCheckboxPress = async (workSet: WorkSetType, work_set_check_group_id: number) => {
    setWorkSetLoadingStates(prev => new Set([...prev, workSet.work_set_id]));
    const res = await completeWorkSet(floor_map_id, {
      is_ready: workSet.is_ready_for_work_set !== 'full',
      work_set_id: workSet.work_set_id,
      placement_type_id: placement.placement_type_id,
      work_set_check_group_id: work_set_check_group_id || null
    });
    setWorkSetLoadingStates(prev => {
      const newSet = new Set(prev);
      newSet.delete(workSet.work_set_id);
      return newSet;
    });
    
    if(!res) return;
    setWorkSets(res);
    showSuccessSnackbar('Успешно');
  };

  const getCheckStatus = (status: string | null) => {
    if(!status) return null;
    try {
      const [status_text, fio, date] = status.split(',')
      return {
        status_text,
        fio,
        date
      }
    } catch (error) {
    }
  }

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      {placement?.work_set_check_groups.map((group) => {
        const isExpanded = expandedGroups.has(group.work_set_check_group_id);
        const statusData = getCheckStatus(group.checked_status)
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
                  fill={COLORS.black}
                />
                <View style={{marginLeft: 10}}>
                  <Text style={styles.groupTitle}>{group.work_set_check_group_name}</Text>
                  <Text style={styles.groupTotalAlt}>Сумма: {numberWithCommas(Math.floor(group.total_sum))} 〒</Text>
                </View>
              </View>
              {group.is_defect_exist && <View style={{marginRight: 20}}><Icon name='info' fill='red' /></View>}
              <View style={styles.groupHeaderRight}>
                {group.checked_status_code !== 'DONE' && group.checked_status_code !== 'PROCESSING' && (
                  <TouchableOpacity
                    style={styles.okkButton}
                    onPress={() => handleCallOKK(group)}
                    disabled={okkLoadingStates.has(`${group.work_set_check_group_id}_${placement.placement_type_id}`)}
                  >
                    {okkLoadingStates.has(`${group.work_set_check_group_id}_${placement.placement_type_id}`) ? (
                      <ActivityIndicator size="small" color={COLORS.white} />
                    ) : (
                      <Text style={styles.okkButtonText}>Вызов ОКК</Text>
                    )}
                  </TouchableOpacity>
                )}
                
                <TouchableOpacity
                  style={styles.checkboxContainer}
                  onPress={() => handleCheckboxPress(group)}
                  disabled={!!group.to_disable || groupCheckLoadingStates.has(group.work_set_check_group_id)}
                >
                  {groupCheckLoadingStates.has(group.work_set_check_group_id) ? (
                    <ActivityIndicator size="small" color={COLORS.gray} />
                  ) : (
                    <View style={[
                      styles.checkbox,
                      group.is_ready_for_work_set_check_group === 'full' && styles.checkboxChecked,
                      group.is_ready_for_work_set_check_group === 'half' && styles.checkboxHalf,
                      (!!group.to_disable || groupCheckLoadingStates.has(group.work_set_check_group_id)) && styles.checkboxDisabled
                    ]}>
                      {group.is_ready_for_work_set_check_group === 'full' && (
                        <Icon name="check" width={12} height={12} stroke={COLORS.white} />
                      )}
                      {group.is_ready_for_work_set_check_group === 'half' && (
                        <View style={styles.halfCheckmark} />
                      )}
                    </View>
                  )}
                </TouchableOpacity>
              </View>
            </TouchableOpacity>

            {isExpanded && (
              <View style={styles.groupContent}>
                {group.work_sets.map((workSet) => (
                  <WorkSetItem 
                    key={workSet.work_set_id} 
                    workSet={workSet} 
                    onCheckboxPress={workSet => handleWorkSetCheckboxPress(workSet, group.work_set_check_group_id)}
                    isLoading={workSetLoadingStates.has(workSet.work_set_id)}
                  />
                ))}
                {
                  statusData && <View style={styles.statusContainer}>
                    <View>
                      <Text style={styles.groupTotalAlt}>ФИО</Text>
                      <Text style={{fontSize: SIZES.small,}}>{statusData.fio}</Text>
                    </View>
                    <View>
                      <Text style={styles.groupTotalAlt}>Дата</Text>
                      <Text style={{fontSize: SIZES.small}}>{statusData.date}</Text>
                    </View>
                    <View style={{
                      padding: 7,
                      borderRadius: 8,
                      backgroundColor: group.checked_status_colour || COLORS.gray
                    }}>
                      <Text style={{color: '#fff'}}>{statusData.status_text}</Text>
                    </View>
                  </View>
                }
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
  onCheckboxPress: (workSet: WorkSetType) => void;
  isLoading: boolean;
}

const WorkSetItem: React.FC<WorkSetItemProps> = ({ workSet, onCheckboxPress, isLoading }) => {
  return (
    <View style={styles.workSetContainer}>
      <View style={styles.workSetHeader}>
        <View style={styles.workSetHeaderLeft}>
          <Text style={styles.workSetName}>{workSet.work_set_name}({workSet.num} {workSet.unit_name})</Text>
          <View style={styles.sumSection}>
             <Text style={styles.detailLabel}>Сумма: {numberWithCommas(Math.floor(workSet.total_sum))}</Text>
          </View>
        </View>
        <View style={styles.workSetHeaderRight}>
          <TouchableOpacity
            style={styles.checkboxContainer}
            onPress={() => onCheckboxPress(workSet)}
            disabled={!!workSet.to_disable || isLoading}
          >
            {isLoading ? (
              <ActivityIndicator size="small" color={COLORS.gray} />
            ) : (
              <View style={[
                styles.checkbox,
                workSet.is_ready_for_work_set === 'full' && styles.checkboxChecked,
                workSet.is_ready_for_work_set === 'half' && styles.checkboxHalf,
                (!!workSet.to_disable || isLoading) && styles.checkboxDisabled
              ]}>
                {workSet.is_ready_for_work_set === 'full' && (
                  <Icon name="check" width={12} height={12} stroke={COLORS.white} />
                )}
                {workSet.is_ready_for_work_set === 'half' && (
                  <View style={styles.halfCheckmark} />
                )}
              </View>
            )}
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingBottom: 7
  },
  backButton: {
    flexDirection: 'row',
    padding: 5,
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
    borderBottomWidth: 1,
    borderBottomColor: COLORS.grayLight,
  },
  groupHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: COLORS.white,
    paddingVertical: 15,
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
    padding: 12,
    paddingLeft: 20,
    paddingRight: 0,
    gap: 5
  },
  workSetHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  workSetHeaderLeft: {
    flex: 1,
  },
  workSetHeaderRight: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  workSetName: {
    fontSize: SIZES.regular,
    fontFamily: FONT.regular,
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
  groupHeaderRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  okkButton: {
    backgroundColor: COLORS.primary,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
    minWidth: 80,
    alignItems: 'center',
  },
  okkButtonText: {
    color: COLORS.white,
    fontSize: SIZES.small,
    fontFamily: FONT.medium,
  },
  checkboxContainer: {
    padding: 4,
  },
  checkbox: {
    width: 20,
    height: 20,
    borderWidth: 2,
    borderColor: COLORS.gray,
    borderRadius: 4,
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkboxChecked: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primary,
  },
  checkboxHalf: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primary,
  },
  checkboxDisabled: {
    opacity: 0.5,
  },
  halfCheckmark: {
    width: 8,
    height: 2,
    backgroundColor: COLORS.white,
    borderRadius: 1,
  },
  statusContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    flexWrap: 'wrap',
    gap: 10,
    padding: 10,
    borderRadius: 8,
    backgroundColor: COLORS.background,
    marginBottom: 10
  },
});
