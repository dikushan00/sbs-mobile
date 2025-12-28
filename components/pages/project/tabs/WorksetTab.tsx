import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { COLORS, FONT, SIZES } from '@/constants';
import { getFloorWorkSets } from '@/components/main/services';
import { FloorMapWorkSetsResponseType, FloorMapWorkSetType } from '@/components/main/types';
import { CustomLoader } from '@/components/common/CustomLoader';
import { CustomSelect } from '@/components/common/CustomSelect';
import { WorkSetAccordion } from './WorksetAccordion';
import { useDispatch } from 'react-redux';
import { setPageSettings } from '@/services/redux/reducers/app';
import { setPageHeaderData } from '@/services/redux/reducers/userApp';

interface MaterialsTabProps {
  floor_map_id: number;
  onBack: () => void
}

export const WorksetTab: React.FC<MaterialsTabProps> = ({ floor_map_id, onBack }) => {
  const dispatch = useDispatch()
  const [loading, setLoading] = useState(true);

  const [workSets, setWorkSets] = useState<FloorMapWorkSetsResponseType | null>(null);
  const [selectedPlacement, setSelectedPlacement] = useState<FloorMapWorkSetType | null>(null);

  useEffect(() => {
    const getFloorWorkSetsData = async () => {
      setLoading(true);
      const res = await getFloorWorkSets(floor_map_id);
      setLoading(false);
      setWorkSets(res || null);
      // Выбираем первый элемент по умолчанию
      if (res?.data?.length) {
        setSelectedPlacement(res.data[0]);
      }
    };
    getFloorWorkSetsData();
  }, [floor_map_id]);

  useEffect(() => {
    dispatch(setPageSettings({goBack: onBack}))
    dispatch(
      setPageHeaderData({
        title: 'Вызок ОКК',
      })
    );
  }, []);

  const handlePlacementSelect = (id: number | null, item: FloorMapWorkSetType | null) => {
    setSelectedPlacement(item);
  };

  const handleWorkSetsUpdate = (updatedWorkSets: FloorMapWorkSetsResponseType) => {
    setWorkSets(updatedWorkSets);
    
    if (selectedPlacement) {
      const updatedPlacement = updatedWorkSets.data.find(
        placement => placement.placement_type_id === selectedPlacement.placement_type_id
      );
      if (updatedPlacement) {
        setSelectedPlacement(updatedPlacement);
      }
    }
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <CustomLoader />
        <View style={{
          justifyContent: 'center',
          alignItems: 'center',
        }}>
          <Text style={styles.loadingText}>Загрузка...</Text>
        </View>
      </View>
    );
  }

  if (!workSets) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorText}>Не удалось загрузить данные</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      <View style={styles.selectContainer}>
        <CustomSelect
          list={workSets?.data || []}
          onChange={handlePlacementSelect}
          value={selectedPlacement?.placement_type_id}
          valueKey="placement_type_id"
          labelKey="placement_type_name"
          placeholder="Тип помещения"
          label="" alt
          style={{height: 40}}
        />
      </View>
      {selectedPlacement ? (
        <WorkSetAccordion
          floor_map_id={floor_map_id}
          placement={selectedPlacement}
          onBack={() => setSelectedPlacement(null)}
          setWorkSets={handleWorkSetsUpdate}
        />
      ) : (
        <View style={styles.hintContainer}>
          <Text style={styles.hintText}>Выберите помещение, чтобы увидеть данные</Text>
        </View>
      )}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  selectContainer: {
    paddingHorizontal: 5,
    paddingBottom: 10,
  },
  loadingContainer: {
    flex: 1,
  },
  loadingText: {
    marginTop: 16,
    fontSize: SIZES.medium,
    fontFamily: FONT.regular,
    color: COLORS.gray,
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
  hintContainer: {
    paddingHorizontal: 16,
    paddingVertical: 24,
    alignItems: 'center',
  },
  hintText: {
    fontSize: SIZES.medium,
    fontFamily: FONT.regular,
    color: COLORS.gray,
    textAlign: 'center',
  },
});