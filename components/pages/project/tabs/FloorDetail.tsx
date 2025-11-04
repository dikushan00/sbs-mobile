import React, { useEffect, useState } from 'react';
import { View, StyleSheet, ScrollView, Text, TouchableOpacity } from 'react-native';
import { COLORS } from '@/constants';
import { FloorMapWorkSetsResponseType, FloorSchemaResRefactorType, ProjectFloorType, SelectedDataType, FlatType, WorkSetType, WorkSetFloorParamType, ProjectEntranceAllInfoType } from '@/components/main/types';
import { CustomTabs } from '@/components/common/CustomTabs';
import { FlatSelect } from '@/components/common/FlatSelect';
import { WorkSetSelect } from '@/components/common/WorkSetSelect';
import { useDispatch } from 'react-redux';
import { setPageSettings } from '@/services/redux/reducers/app';
import { setPageHeaderData as setUserPageHeaderData } from '@/services/redux/reducers/userApp';
import { getFloorSchema, getFloorWorkSets, getFloorWorkSetParams } from '@/components/main/services';
import { CustomLoader } from '@/components/common/CustomLoader';
import { FloorSchema } from '../FloorSchema';
import { MaterialsFloorTab } from './MaterialsFloorTab';
import { Icon } from '@/components/Icon';

interface FloorDetailProps {
  floor: {floor_map_id: number, floor: number | string};
  onBack: () => void;
  selectedData: SelectedDataType;
  entranceInfo: ProjectEntranceAllInfoType | null;
}

export const FloorDetail = ({ floor, onBack, selectedData, entranceInfo }: FloorDetailProps) => {
  const dispatch = useDispatch();
  const [activeTab, setActiveTab] = useState('scheme');
  const [isFetching, setIsFetching] = useState(false);
  const [floorSchema, setFloorSchema] = useState<FloorSchemaResRefactorType | null>(null);
  const [workSets, setWorkSets] = useState<FloorMapWorkSetsResponseType | null>(null);
  const [selectedFlat, setSelectedFlat] = useState<FlatType | null>(null);
  const [selectedWorkSet, setSelectedWorkSet] = useState<WorkSetType | null>(null);
  const [workSetParams, setWorkSetParams] = useState<WorkSetFloorParamType[] | null>(null);
  const [showCheckBtn, setShowCheckBtn] = useState(false);
  const [showCheckPoints, setShowCheckPoints] = useState(false);

  useEffect(() => {
    getFloorWorkSets(floor.floor_map_id).then(res => {
      setShowCheckBtn(!!res?.is_defect_exist)
    })
  }, [floor.floor_map_id])

  const getFloorSchemaData = async () => {
    setIsFetching(true);
    const res = await getFloorSchema(floor.floor_map_id);
    setIsFetching(false);
    setFloorSchema(res || null);
  };

  const getFloorWorkSetsData = async () => {
    const res = await getFloorWorkSets(floor.floor_map_id);
    setWorkSets(res || null);
  };

  const getWorkSetParamsData = async (workSetId: number) => {
    setIsFetching(true);
    const res = await getFloorWorkSetParams(floor.floor_map_id, workSetId);
    setIsFetching(false);
    setWorkSetParams(res || null);
  };

  useEffect(() => {
    getFloorSchemaData();
    getFloorWorkSetsData()
  }, [floor.floor_map_id]);

  useEffect(() => {
    if (selectedWorkSet) {
      getWorkSetParamsData(selectedWorkSet.work_set_id);
    } else {
      setWorkSetParams(null);
    }
  }, [selectedWorkSet]);

  useEffect(() => {
    dispatch(setUserPageHeaderData({
      title: 'Схема этажа',
      desc: `Подъезд ${entranceInfo?.entrance}, Блок ${entranceInfo?.block_name}, Этаж №${floor.floor}`,
    }));
    dispatch(setPageSettings({ 
      backBtn: true, 
      goBack: onBack
    }));
  }, [floor.floor, onBack, dispatch, selectedData, entranceInfo]);

  useEffect(() => {
    if(activeTab === 'scheme')
      dispatch(setUserPageHeaderData({
        title: 'Схема этажа',
      }));
  }, [activeTab]);

  const tabsData = [
    { label: 'Схема этажа', value: 'scheme' },
    { label: 'Материалы', value: 'materials' }
  ];

  const renderTabContent = () => {
    if (activeTab === 'scheme') {
      return renderSchemeContent();
    } else if (activeTab === 'materials') {
      return renderMaterialsContent();
    }
    return null;
  };

  const getAllWorkSets = () => {
    if (!workSets?.data) return [];
    
    const allWorkSets: WorkSetType[] = [];
    workSets.data.forEach(workSetGroup => {
      workSetGroup.work_set_check_groups.forEach(group => {
        allWorkSets.push(...group.work_sets);
      });
    });
    
    return allWorkSets;
  };

  const renderSchemeContent = () => (
    <View style={styles.tabContent}>
      <View style={styles.selectsContainer}>
        <View style={styles.selectWrapper}>
          <FlatSelect
            list={floorSchema?.flat || []}
            onChange={(id, item) => setSelectedFlat(item)}
            value={selectedFlat}
            placeholder="Квартира"
          />
        </View>
        <View style={styles.selectWrapper}>
          <WorkSetSelect
            list={getAllWorkSets()}
            onChange={(id, item) => setSelectedWorkSet(item)}
            value={selectedWorkSet}
            placeholder="Конструктив"
            workSetGroups={workSets?.data || []}
          />
        </View>
      </View>
      <View style={styles.schemaContainer}>
       {showCheckBtn && <View style={styles.schemaHeader}>
          <TouchableOpacity
            onPress={() => setShowCheckPoints(prev => !prev)}
            style={{
              padding: 10,
              backgroundColor: 'rgba(255, 59, 59, 0.1)',
              borderRadius: 10,
              borderWidth: 1,
              borderColor: 'rgba(255, 59, 59, 0.5)',
            }}
          >
            <Text style={{color: COLORS.primary}}>
              <Icon name={showCheckPoints ? 'close' : 'infoOutline'} stroke={showCheckPoints ? 'red' : ''}
               fill='#FF3B3B' width={20} height={20} />
            </Text>
          </TouchableOpacity>
        </View>}
        <FloorSchema 
          data={floorSchema} 
          selectedFlat={selectedFlat}
          workSetParams={workSetParams}
          showCheckPoints={showCheckPoints}
          handlePress={() => {}} 
        />
      </View>
    </View>
  );

  const renderMaterialsContent = () => (
    <View style={styles.tabContent}>
      <MaterialsFloorTab floor_map_id={floor.floor_map_id} onBack={onBack} />
    </View>
  );

  return (
    <View style={styles.container}>
      {isFetching && <CustomLoader />}
      <CustomTabs 
        data={tabsData}
        defaultActive="scheme"
        onChange={setActiveTab}
        alt={true}
      />
      <ScrollView style={styles.scrollContainer}>
        {renderTabContent()}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.backgroundWhite,
    paddingHorizontal: 15,
    paddingTop: 10
  },
  scrollContainer: {
    flex: 1,
  },
  tabContent: {
    gap: 16,
  },
  selectsContainer: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 16,
    marginTop: 15
  },
  selectWrapper: {
    flex: 1,
  },
  schemaContainer: {
    marginBottom: 16,
  },
  schemaHeader: {
    position: 'absolute',
    top: 10,
    right: 10,
    zIndex: 10,
  },
  filterIndicator: {
    backgroundColor: COLORS.primaryLight,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    marginBottom: 12,
    alignSelf: 'flex-start',
  },
  filterText: {
    fontSize: 14,
    color: COLORS.primary,
    fontWeight: '500',
  },
});