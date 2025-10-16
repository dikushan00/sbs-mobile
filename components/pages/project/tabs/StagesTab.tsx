import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { useDispatch } from 'react-redux';
import { COLORS, FONT, SIZES } from '@/constants';
import { getEntranceStages, getEntranceDocumentFloors, getPlacementTypes, getFloorMapChecks } from '@/components/main/services';
import { ProjectStageType, ProjectFiltersType, ProjectStagesFiltersType, PlacementType, SimpleFloorType, ProjectCheckType, ProjectStagesChecksParamsType, SelectedDataType } from '@/components/main/types';
import { CustomLoader } from '@/components/common/CustomLoader';
import { ValueDisplay } from '@/components/common/ValueDisplay';
import { Icon } from '@/components/Icon';
import { showBottomDrawer } from '@/services/redux/reducers/app';
import { setPageSettings } from '@/services/redux/reducers/app';
import { BOTTOM_DRAWER_KEYS } from '@/components/BottomDrawer/services';
import { CustomSelect } from '@/components/common/CustomSelect';
import { CommentsView } from './CommentsView';
import { setPageHeaderData } from '@/services/redux/reducers/userApp';

interface StagesTabProps {
  filters: ProjectFiltersType;
  onBack: () => void;
  project_id: number | null;
  selectedData: SelectedDataType
}

export const StagesTab: React.FC<StagesTabProps> = ({ filters, onBack, project_id, selectedData }) => {
  const dispatch = useDispatch();
  const [stagesData, setStagesData] = useState<ProjectStageType[] | null>(null);
  const [loading, setLoading] = useState(true);
  const [expandedItems, setExpandedItems] = useState<Set<number>>(new Set());
  const [placementTypes, setPlacementTypes] = useState<PlacementType[]>([]);
  const [floors, setFloors] = useState<SimpleFloorType[]>([]);
  const [localFilters, setLocalFilters] = useState({
    placement_type_id: null as number | null,
    floor: null as number | null,
  });

  // New state for comments view
  const [viewMode, setViewMode] = useState<'stages' | 'comments'>('stages');
  const [selectedStage, setSelectedStage] = useState<ProjectStageType | null>(null);

  useEffect(() => {
    const fetchInitialData = async () => {
      const [placementTypesData, floorsData] = await Promise.all([
        getPlacementTypes(),
        getEntranceDocumentFloors(filters),
      ]);
      setPlacementTypes(placementTypesData || []);
      setFloors(floorsData || []);
    };
    fetchInitialData();
  }, []);

  useEffect(() => {
    if(viewMode !== 'comments')
      dispatch(setPageHeaderData({
        title: "Этапы",
        desc: "",
      }));
  }, [viewMode])

  useEffect(() => {
    const fetchStages = async () => {
      setLoading(true);
      const stages = await getEntranceStages({...filters, ...localFilters});
      setLoading(false);
      setStagesData(stages || []);
    };
    fetchStages();
  }, [localFilters, filters]);

  // Update page settings when view mode changes
  useEffect(() => {
    if (viewMode !== 'comments') 
      dispatch(setPageSettings({ backBtn: true, goBack: onBack }));
  }, [viewMode, dispatch, onBack]);

  const getStatusColour = (status_code: string) => {
    switch (status_code) {
      case 'DONE':
        return '#35E744';
      case 'PROCESSING':
        return '#F6BA30';
      case 'DEFECT':
        return COLORS.red;
      default:
        return COLORS.primary;
    }
  }

  const toggleExpanded = (itemId: number) => {
    const newExpanded = new Set(expandedItems);
    if (newExpanded.has(itemId)) {
      newExpanded.delete(itemId);
    } else {
      newExpanded.add(itemId);
    }
    setExpandedItems(newExpanded);
  };

  const handleMoreActions = (stage: ProjectStageType) => {
    dispatch(showBottomDrawer({
      type: BOTTOM_DRAWER_KEYS.stagesActions,
      data: {
        stage,
        onSubmit: (res: ProjectStageType[]) => {
          if(!res) return
          setStagesData(res);
        },
        onViewComments: (selectedStage: ProjectStageType) => {
          setSelectedStage(selectedStage);
          setViewMode('comments');
        }
      }
    }))
  };

  const handleBackToStages = () => {
    setViewMode('stages');
    setSelectedStage(null);
  };


  // Render comments view
  if (viewMode === 'comments') {
    return (
      <CommentsView
        filters={filters}
        project_id={project_id} 
        selectedStage={selectedStage}
        onBack={handleBackToStages}
        selectedData={selectedData}
      />
    );
  }

  if (!stagesData && !loading) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorText}>Не удалось загрузить данные</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.selectsContainer}>
        <View style={styles.selectWrapper}>
          <CustomSelect
            list={floors}
            valueKey="floor"
            labelKey="floor_name"
            onChange={(value) => setLocalFilters(prev => ({ ...prev, floor: value }))}
            value={localFilters.floor}
            placeholder="Этаж" alt
          />
        </View>
        <View style={styles.selectWrapper}>
          <CustomSelect
            list={placementTypes}
            valueKey="placement_type_id"
            labelKey="placement_type_name"
            onChange={(value) => setLocalFilters(prev => ({ ...prev, placement_type_id: value }))}
            value={localFilters.placement_type_id}
            placeholder="Тип" alt
          />
        </View>
      </View>
      
      <ScrollView 
        style={styles.scrollContainer} 
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {loading && <CustomLoader />}
        <View style={styles.accordionContainer}>
          {stagesData?.map((item, i) => {
            const isExpanded = expandedItems.has(item.floor_map_id);
            return (
              <View key={item.floor_map_id + '-' + i} style={styles.materialContainer}>
                <View style={{flexDirection: 'row', alignItems: 'flex-start', justifyContent: 'space-between', gap: 15}}>
                  <Text style={styles.materialName}>{item.work_set_check_group_name}</Text>
                  <TouchableOpacity 
                    style={{flexDirection: 'row', alignItems: 'center', justifyContent: 'center', borderRadius: 100, padding: 5, backgroundColor: COLORS.grayLight}}
                    onPress={() => handleMoreActions(item)}
                  >
                    <Icon name='more' width={16} height={16} />
                  </TouchableOpacity>
                </View>
                <View style={{...styles.statusContainer, backgroundColor: getStatusColour(item.check_status_code)}}>
                  <Text style={{color: COLORS.white}}>{item.check_status}</Text>
                </View>
                <View style={{marginTop: 15}}>
                  <View style={{flexDirection: 'row', gap: 15, alignItems: 'flex-start'}}>
                    <ValueDisplay label='Вызвал(а)' value={item.call_employee_fio} />
                    <ValueDisplay label='Тип' value={item.placement_type_name} />
                    {isExpanded ? <View style={{width: 85}}></View> : <TouchableOpacity 
                      style={{flexDirection: 'row', alignItems: 'center', gap: 8, alignSelf: 'flex-end', marginTop: 10}}
                      onPress={() => toggleExpanded(item.floor_map_id)}
                    >
                      <Text style={{color: COLORS.primaryLight}}>Раскрыть</Text> 
                      <Icon 
                        name={"arrowDownColor"} 
                        width={13} 
                        height={13} 
                        fill={COLORS.primaryLight}
                      />
                    </TouchableOpacity>}
                  </View>
                </View>
                {isExpanded && (
                  <View>
                    <View style={{flexDirection: 'row', alignItems: 'flex-start', marginTop: 15}}>
                      <ValueDisplay label='Блок' value={`№${item.block_name}`} />
                      <ValueDisplay label='Этаж' value={`${item.floor}`} />
                      <View style={{width: 85}}></View>
                    </View>
                    <View style={{flexDirection: 'row', alignItems: 'flex-start', marginTop: 15}}>
                      <ValueDisplay label='Дата вызова' value={item.call_date} />
                      <ValueDisplay label='Дата принятия' value={item.check_date} />
                      <View style={{width: 85}}></View>
                    </View>
                    <View style={{flexDirection: 'row', alignItems: 'flex-end', marginTop: 15}}>
                      <ValueDisplay label='Принял(а)' value={item.check_employee_fio} />
                      <View style={{flex: 1}}></View>
                      <TouchableOpacity 
                        style={{flexDirection: 'row', alignItems: 'center', gap: 8}}
                        onPress={() => toggleExpanded(item.floor_map_id)}
                      >
                        <Text style={{color: COLORS.primaryLight}}>Закрыть</Text> 
                        <Icon 
                          name={"arrowDownColor"} 
                          width={13} 
                          height={13} 
                          fill={COLORS.primaryLight}
                          style={{ transform: [{ rotate: '180deg' }] }}
                        />
                      </TouchableOpacity>
                    </View>
                  </View>
                )}
              </View>
            );
          })}
        </View>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  scrollContainer: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 80,
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
    textAlign: 'center',
  },
  accordionContainer: {
    marginTop: 20,
  },
  statusContainer: {
    padding: 10,
    paddingVertical: 5,
    borderRadius: 6,
    backgroundColor: COLORS.primary,
    alignSelf: 'flex-start',
    marginTop: 15
  },
  materialContainer: {
    padding: 15,
    borderRadius: 10,
    backgroundColor: COLORS.white,
    marginBottom: 10,
  },
  materialName: {
    flex: 1,
    fontSize: SIZES.regular,
    fontFamily: FONT.regular,
    color: COLORS.black,
    lineHeight: 20,
    flexWrap: 'wrap',
  },
  selectsContainer: {
    flexDirection: 'row',
    gap: 15,
    paddingHorizontal: 20,
    paddingTop: 10,
    paddingBottom: 10,
    backgroundColor: COLORS.white
  },
  selectWrapper: {
    flex: 1,
  },
});
