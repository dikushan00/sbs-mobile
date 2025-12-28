import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { useDispatch } from 'react-redux';
import { COLORS, FONT, SIZES } from '@/constants';
import { getEntranceStages, getEntranceDocumentFloors, getPlacementTypes, getProjectEntrances } from '@/components/main/services';
import { ProjectStageType, ProjectFiltersType, PlacementType, SimpleFloorType, SelectedDataType, ProjectEntranceAllInfoType } from '@/components/main/types';
import { CustomLoader } from '@/components/common/CustomLoader';
import { Icon } from '@/components/Icon';
import { showBottomDrawer } from '@/services/redux/reducers/app';
import { setPageSettings } from '@/services/redux/reducers/app';
import { BOTTOM_DRAWER_KEYS } from '@/components/BottomDrawer/constants';
import { CustomSelect } from '@/components/common/CustomSelect';
import { CommentsView } from './CommentsView';
import { setPageHeaderData } from '@/services/redux/reducers/userApp';
import { FloorDetail } from './FloorDetail';
import { NotFound } from '@/components/common/NotFound';
import { EntranceSelector } from '@/components/common/EntranceSelector';

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
  const [entranceInfo, setEntranceInfo] = useState<ProjectEntranceAllInfoType | null>(null);
  const [placementTypes, setPlacementTypes] = useState<PlacementType[]>([]);
  const [floors, setFloors] = useState<SimpleFloorType[]>([]);
  const [localFilters, setLocalFilters] = useState({
    project_entrance_id: null as string | number | null,
    placement_type_id: null as number | null,
    floor: null as number | null,
  });

  const [viewMode, setViewMode] = useState<'stages' | 'comments' | 'schema'>('stages');
  const [selectedStage, setSelectedStage] = useState<ProjectStageType | null>(null);

  useEffect(() => {
    const fetchInitialData = async () => {
      if(!project_id) return;
      const [entrancesData, placementTypesData] = await Promise.all([
        getProjectEntrances(project_id),
        getPlacementTypes(),
      ]);
      if (entrancesData) {
        if(entrancesData?.length) {
          setEntranceInfo(entrancesData[0])
          setLocalFilters(prev => ({...prev, project_entrance_id: entrancesData[0].project_entrance_id}))
          const floorsData = await getEntranceDocumentFloors({...filters, project_entrance_id: entrancesData[0].project_entrance_id})
          setFloors(floorsData || []);
        }
      }
      setPlacementTypes(placementTypesData || []);
    };
    fetchInitialData();
  }, [project_id]);

  useEffect(() => {
    if(viewMode === 'stages')
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
    if(localFilters.project_entrance_id)
      fetchStages();
  }, [localFilters, filters]);

  useEffect(() => {
    if (viewMode === 'stages') 
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

  const openSchema = (stage: ProjectStageType) => {
    setSelectedStage(stage);
    setViewMode('schema');
  }

  const openComments = (stage: ProjectStageType) => {
    setSelectedStage(stage);
    setViewMode('comments');
  }

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
        },
        onOpenSchema: (selectedStage: ProjectStageType) => {
          setSelectedStage(selectedStage);
          setViewMode('schema');
        }
      }
    }))
  };

  const handleBackToStages = () => {
    setViewMode('stages');
    setSelectedStage(null);
  };

  if (viewMode === 'comments') {
    return (
      <CommentsView
        filters={{...filters, project_entrance_id: localFilters.project_entrance_id}}
        project_id={project_id} 
        selectedStage={selectedStage}
        onBack={handleBackToStages}
        selectedData={entranceInfo ? {...selectedData, entrance: entranceInfo.entrance, block_name: entranceInfo.block_name} : selectedData}
      />
    );
  }

  if (viewMode === 'schema' && selectedStage?.floor) {
    return (
      <FloorDetail
        floor={{floor_map_id: selectedStage.floor_map_id, floor: selectedStage.floor}} 
        selectedData={selectedData} 
        onBack={handleBackToStages} 
        entranceInfo={entranceInfo}
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

  const onEntranceChange = async (value: string | number | null, row: ProjectEntranceAllInfoType | null) => {
    setLocalFilters(prev => ({ ...prev, project_entrance_id: value, floor: null, placement_type_id: null }))
    setEntranceInfo(row)

    const floorsData = await getEntranceDocumentFloors({...filters, project_entrance_id: value as number})
    setFloors(floorsData || []);
  }

  return (
    <View style={styles.container}>
      <EntranceSelector
        selectedEntranceId={localFilters.project_entrance_id ? +localFilters.project_entrance_id : null}
        onSelectEntrance={(id, data) => {
          onEntranceChange(id, data)
        }}
        selectedData={selectedData}
        defaultEntranceId={localFilters.project_entrance_id ? +localFilters.project_entrance_id : null}
        projectId={project_id}
      />
      <View style={styles.selectsContainer}>
        <View style={styles.selectWrapper}>
          <CustomSelect
            list={floors}
            valueKey="floor"
            labelKey="floor_name"
            onChange={(value) => setLocalFilters(prev => ({ ...prev, floor: value }))}
            value={localFilters.floor}
            placeholder="Этаж" alt 
            showResetBtn
            showSearch={false} 
            style={{height: 36, paddingVertical: 5}}
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
            style={{height: 36, paddingVertical: 5}}
          />
        </View>
      </View>
      
      <ScrollView 
        style={styles.scrollContainer} 
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {loading && <CustomLoader />}
        {
          stagesData?.length 
            ? <View style={styles.accordionContainer}>
            {stagesData?.map((item, i) => {
              return (
                <View key={item.floor_map_id + '-' + i} style={styles.stageCard}>
                  {/* Заголовок */}
                  <Text style={styles.stageTitle}>{item.work_set_check_group_name}</Text>
                  
                  {/* Строка с тегами и статусом */}
                  <View style={styles.tagsRow}>
                    <View style={styles.tagsContainer}>
                      <View style={styles.tagItem}>
                        <Icon name = "plan" width={12} height={12} fill={'#242424'} />
                        <Text style={styles.tagLabel}>{item.floor}</Text>
                      </View>
                      <View style={styles.tagItem}>
                        <Icon name = "residentCloud" width={12} height={12} fill={'#242424'} />
                        <Text style={styles.tagLabel}>{item.block_name}</Text>
                      </View>
                      <View style={styles.tagItem}>
                        <Icon name = "apartment" width={12} height={12} />
                        <Text style={styles.tagLabel}>{item.placement_type_name}</Text>
                      </View>
                    </View>
                    {
                      item.check_status_code === 'DEFECT' 
                      ? <TouchableOpacity onPress={() => openComments(item)}>
                        <View style={[styles.statusBadge, { backgroundColor: getStatusColour(item.check_status_code) }]}>
                      <Text style={styles.statusText}>{item.check_status}</Text>
                    </View>
                      </TouchableOpacity>
                      : <View style={[styles.statusBadge, { backgroundColor: getStatusColour(item.check_status_code) }]}>
                      <Text style={styles.statusText}>{item.check_status}</Text>
                    </View>
                    }
                    
                  </View>
                  
                  {/* Две колонки: Вызов и Принятие */}
                  <View style={styles.columnsContainer}>
                    {/* Левая колонка - Вызов */}
                    <View style={styles.column}>
                      <Text style={styles.columnLabel}>Вызов</Text>
                      <View style={styles.columnValue}>
                        <Icon name="user" width={12} height={12} fill={COLORS.primarySecondary} />
                        <Text style={styles.columnValueText}>{item.call_employee_fio}</Text>
                      </View>
                      <View style={styles.columnValue}>
                        <Icon name="calendar2" width={12} height={12} fill={COLORS.primarySecondary} />
                        <Text style={styles.columnValueText}>{item.call_date}</Text>
                      </View>
                    </View>
                    
                    {/* Разделитель */}
                    <View style={styles.columnDivider} />
                    
                    {/* Правая колонка - Принятие */}
                    <View style={styles.column}>
                      <Text style={styles.columnLabel}>Принятие</Text>
                      <View style={styles.columnValue}>
                        <Icon name="user" width={12} height={12} fill={COLORS.primarySecondary} />
                        <Text style={styles.columnValueText}>{item.check_employee_fio || '-'}</Text>
                      </View>
                      <View style={styles.columnValue}>
                        <Icon name="calendar2" width={12} height={12} fill={COLORS.primarySecondary} />
                        <Text style={styles.columnValueText}>{item.check_date || '-'}</Text>
                      </View>
                    </View>
                  </View>
                  
                  {/* Кнопка комментарии */}
                  <TouchableOpacity 
                    style={styles.commentsButton}
                    onPress={() => openSchema(item)}
                  >
                    <Text style={styles.commentsButtonText}>Открыть схему</Text>
                    <Icon name="arrowRightAlt" width={14} height={14} fill={COLORS.primarySecondary} />
                  </TouchableOpacity>
                </View>
              );
            })}
          </View>
            : !loading && <NotFound title='Не найдено этапов' />
        }
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
    marginTop: 10,
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
  // Новые стили для карточки этапа (variant2)
  stageCard: {
    backgroundColor: COLORS.white,
    borderRadius: 12,
    padding: 12,
    paddingBottom: 16,
    marginBottom: 10,
  },
  stageTitle: {
    fontSize: SIZES.regular,
    fontFamily: FONT.semiBold,
    color: '#242424',
    lineHeight: 18,
    marginBottom: 8,
  },
  tagsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 8,
  },
  tagsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F0F0F0',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 6,
    gap: 12,
  },
  tagItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  tagLabel: {
    fontSize: SIZES.small,
    fontFamily: FONT.medium,
    color: '#242424',
  },
  statusBadge: {
    borderRadius: 8,
    paddingHorizontal: 8,
    paddingVertical: 6,
  },
  statusText: {
    fontSize: SIZES.regular,
    fontFamily: FONT.medium,
    color: COLORS.white,
  },
  columnsContainer: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: 16,
    marginBottom: 12,
  },
  column: {
    flex: 1,
  },
  columnLabel: {
    fontSize: 10,
    fontFamily: FONT.regular,
    color: COLORS.gray,
    marginBottom: 8,
  },
  columnValue: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginBottom: 8,
  },
  columnValueText: {
    fontSize: SIZES.small,
    fontFamily: FONT.regular,
    color: '#242424',
  },
  columnDivider: {
    width: 1,
    height: 38,
    marginBottom: 10,
    backgroundColor: '#D1D1D1',
    borderRadius: 1,
  },
  commentsButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  commentsButtonText: {
    fontSize: SIZES.small,
    fontFamily: FONT.regular,
    color: COLORS.primarySecondary,
  },
});
