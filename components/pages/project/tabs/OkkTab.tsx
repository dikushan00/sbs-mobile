import React, { useState, useEffect } from 'react';
import { ScrollView } from 'react-native';
import { SelectedDataType, ProjectFloorType, ProjectEntranceAllInfoType } from '@/components/main/types';
import { OkkFloorSelection } from './OkkFloorSelection';
import { useDispatch } from 'react-redux';
import { setPageSettings } from '@/services/redux/reducers/app';
import { setPageHeaderData as setUserPageHeaderData } from '@/services/redux/reducers/userApp';
import { WorksetTab } from './WorksetTab';

export const OKKTab = ({onBack, selectedData}: {onBack?: () => void, selectedData: SelectedDataType}) => {
  const [selectedFloorForOkk, setSelectedFloorForOkk] = useState<ProjectFloorType | null>(null);
  const [entranceInfo, setEntranceInfo] = useState<ProjectEntranceAllInfoType | null>(null);
  const dispatch = useDispatch();

  const handleBackToFloorsSchema = () => {
    setSelectedFloorForOkk(null);
  };

  const handleFloorSelectForOkk = (floor: ProjectFloorType) => {
    setSelectedFloorForOkk(floor);
    dispatch(setUserPageHeaderData({
      title: "Вызов ОКК",
      desc: `Подъезд ${entranceInfo?.entrance}, Блок ${entranceInfo?.block_name}, Этаж №${floor.floor}`,
    }));
  };

  useEffect(() => {
    if(selectedFloorForOkk) {
      dispatch(setPageSettings({ 
        backBtn: true, 
        goBack: () => {
          setSelectedFloorForOkk(null)
        }
      }));
    } else {
      dispatch(setPageSettings({ 
        backBtn: true, 
        goBack: onBack
      }));
    }
  }, [selectedFloorForOkk]);

  return <>
    {
      selectedFloorForOkk
        ? <ScrollView style={{padding: 16}}>
        <WorksetTab 
          floor_map_id={selectedFloorForOkk.floor_map_id}
          onBack={handleBackToFloorsSchema}
        />
      </ScrollView>
        : <OkkFloorSelection 
          selectedData={selectedData}
          onBack={onBack} 
          onFloorSelect={handleFloorSelectForOkk}
          setEntranceInfo={setEntranceInfo}
        />
    }
  </>
};
