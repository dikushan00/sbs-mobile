import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { COLORS } from '@/constants';
import { ProjectFiltersType, SelectedDataType, ProjectFloorType } from '@/components/main/types';
import { BlockItem } from '@/components/common/BlockItem';
import { FloorSchemaContent } from './FloorSchemaContent';
import { OkkFloorSelection } from './OkkFloorSelection';
import { useDispatch } from 'react-redux';
import { setPageSettings } from '@/services/redux/reducers/app';
import { setPageHeaderData as setUserPageHeaderData } from '@/services/redux/reducers/userApp';
import { WorksetTab } from './WorksetTab';

export const FloorSchemaTab = ({filters, onBack, selectedData}: {filters: ProjectFiltersType, onBack?: () => void, selectedData: SelectedDataType}) => {
  const [selectedBlock, setSelectedBlock] = useState<string | null>(null);
  const [selectedFloorForOkk, setSelectedFloorForOkk] = useState<ProjectFloorType | null>(null);
  const dispatch = useDispatch();

  const handleBlockPress = (blockId: string) => {
    setSelectedBlock(blockId);
    dispatch(setUserPageHeaderData({
      title: blockId === '1' ? 'Схема этажа и материалы' : 'Вызов ОКК',
      desc: "",
    }));
  };

  const handleBackToFloors = () => {
    setSelectedBlock(null);
    setSelectedFloorForOkk(null);
    dispatch(setUserPageHeaderData({
      title: "Схема этажа",
      desc: "",
    }));
  };

  const handleFloorSelectForOkk = (floor: ProjectFloorType) => {
    setSelectedFloorForOkk(floor);
    dispatch(setUserPageHeaderData({
      title: "Вызов ОКК",
      desc: `Этаж ${floor.floor}`,
    }));
  };

  const handleBackToFloorSelection = () => {
    setSelectedFloorForOkk(null);
    dispatch(setUserPageHeaderData({
      title: "Вызов ОКК",
      desc: "Выберите этаж для вызова ОКК",
    }));
  };

  useEffect(() => {
    if (selectedBlock) {
      dispatch(setPageSettings({ 
        backBtn: true, 
        goBack: handleBackToFloors
      }));
    } else {
      dispatch(setPageSettings({ 
        backBtn: true, 
        goBack: onBack
      }));
    }
  }, [selectedBlock]);

  const renderBlockContent = () => {
    switch (selectedBlock) {
      case '1':
        return <FloorSchemaContent filters={filters} onBack={handleBackToFloors} selectedData={selectedData} />;
      case '2':
        if (selectedFloorForOkk) {
          return (
            <ScrollView style={{padding: 16}}>
              <WorksetTab 
                floor_map_id={selectedFloorForOkk.floor_map_id}
              />
            </ScrollView>
          );
        } else {
          return (
            <OkkFloorSelection 
              filters={filters} 
              onBack={handleBackToFloors} 
              selectedData={selectedData}
              onFloorSelect={handleFloorSelectForOkk}
            />
          );
        }
      default:
        return null;
    }
  };

  if (selectedBlock) {
    return renderBlockContent();
  }

  return (
    <View style={styles.container}>
      <BlockItem
        title="Схема этажа и материалы"
        icon="map"
        onPress={() => handleBlockPress('1')}
      />
      <BlockItem
        title="Вызов ОКК"
        icon="checkCircleBlue"
        onPress={() => handleBlockPress('2')}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: COLORS.backgroundWhite,
    gap: 5,
  },
  placeholder: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
});
