import React, { useCallback, useEffect, useState } from 'react';
import { View, StyleSheet } from 'react-native';
import { COLORS } from '@/constants';
import { ProjectEntranceAllInfoType, ProjectFloorType, SelectedDataType } from '@/components/main/types';
import { CustomLoader } from '@/components/common/CustomLoader';
import { getEntranceApartments } from '@/components/main/services';
import { FloorDetail } from './FloorDetail';
import { useDispatch } from 'react-redux';
import { setPageSettings } from '@/services/redux/reducers/app';
import { setPageHeaderData as setUserPageHeaderData } from '@/services/redux/reducers/userApp';
import { CustomTabs } from '@/components/common/CustomTabs';
import { ChessFlatsTab, ChessWorksTab, ChessPaidTab } from './chess';

interface FloorSchemaChessProps {
  onBack?: () => void;
  selectedData: SelectedDataType;
}

type TabValue = 'flats' | 'works' | 'paid';

export const FloorSchemaChess = ({ onBack, selectedData }: FloorSchemaChessProps) => {
  const dispatch = useDispatch();
  const [floorsPlan, setFloorsPlan] = useState<ProjectFloorType[] | null>(null);
  const [isFetching, setIsFetching] = useState(false);
  const [projectEntranceId, setProjectEntranceId] = useState<number | null>(null);
  const [entranceInfo, setEntranceInfo] = useState<ProjectEntranceAllInfoType | null>(null);
  const [selectedFloor, setSelectedFloor] = useState<ProjectFloorType | null>(null);
  const [activeTab, setActiveTab] = useState<TabValue>('flats');

  const getFloorsPlan = useCallback(async () => {
    if (!projectEntranceId) {
      setFloorsPlan(null);
      return;
    }
    setIsFetching(true);
    const res = await getEntranceApartments({
      resident_id: selectedData.resident_id,
      project_type_id: selectedData.project_type_id,
      project_entrance_id: projectEntranceId
    });
    setIsFetching(false);
    setFloorsPlan(res || []);
  }, [projectEntranceId, selectedData]);

  useEffect(() => {
    getFloorsPlan();
  }, [getFloorsPlan]);

  useEffect(() => {
    if (!selectedFloor) {
      dispatch(setPageSettings({ 
        backBtn: true, 
        goBack: onBack
      }));
      dispatch(setUserPageHeaderData({
        title: "Схема этажа и материалы",
        desc: "",
      }));
    }
  }, [onBack, dispatch, selectedFloor]);

  const handleFloorPress = (floor: ProjectFloorType) => {
    setSelectedFloor(floor);
  };

  const tabsData = [
    {label: 'Квартиры', value: 'flats'},
    {label: 'Работы', value: 'works'},
    {label: 'Выплачено', value: 'paid'}
  ];

  const renderTabContent = () => {
    const commonProps = {
      floorsPlan,
      projectEntranceId,
      setProjectEntranceId,
      setEntranceInfo,
      selectedData,
      onFloorPress: handleFloorPress,
    };

    switch (activeTab) {
      case 'flats':
        return <ChessFlatsTab {...commonProps} />;
      case 'works':
        return <ChessWorksTab {...commonProps} />;
      case 'paid':
        return <ChessPaidTab {...commonProps} />;
      default:
        return <ChessFlatsTab {...commonProps} />;
    }
  };

  if (selectedFloor) {
    return (
      <FloorDetail 
        floor={selectedFloor} 
        selectedData={selectedData} 
        entranceInfo={entranceInfo}
        onBack={() => setSelectedFloor(null)} 
      />
    );
  }

  return (
    <View style={styles.container}>
      {isFetching && <CustomLoader />}
      
      <View style={styles.tabsContainer}>
        <CustomTabs 
          alt 
          data={tabsData} 
          defaultActive="flats" 
          onChange={(value) => setActiveTab(value as TabValue)} 
        />
      </View>

      {renderTabContent()}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  tabsContainer: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    height: 55,
    backgroundColor: COLORS.white,
    marginBottom: 10,
    borderEndEndRadius: 16,
    borderStartEndRadius: 16,
  },
});

