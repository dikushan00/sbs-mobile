import React, { useCallback, useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { COLORS, FONT, SIZES } from '@/constants';
import { getResidentialEntrances } from '../main/services';
import { ProjectEntranceAllInfoType, SelectedDataType } from '../main/types';
import { CustomLoader } from './CustomLoader';

interface EntranceItem {
  project_entrance_id: number | string;
  entrance_name: string;
}

interface EntranceSelectorProps {
  selectedEntranceId: number | null;
  onSelectEntrance: (entranceId: number) => void;
  containerStyle?: any;
  selectedData: SelectedDataType;
}

export const EntranceSelector = ({ 
  selectedEntranceId, 
  onSelectEntrance, 
  containerStyle,
  selectedData
}: EntranceSelectorProps) => {
  const [isFetching, setIsFetching] = useState(false);
  const [entrances, setEntrances] = useState<ProjectEntranceAllInfoType[]>([]);

  const getEntrances = useCallback(async () => {
    setIsFetching(true)
    getResidentialEntrances({resident_id: selectedData.resident_id, project_type_id: selectedData.project_type_id, project_entrance_id: null})
    .then((res) => {
      setIsFetching(false)
      if(!res) return
      onSelectEntrance(+res[0].project_entrance_id)
      setEntrances(res || [])
    });
  }, [selectedData, onSelectEntrance])

  useEffect(() => {
    getEntrances()
  }, [getEntrances])
  
  return (
    <View style={[styles.container, containerStyle]}>
      {isFetching && <CustomLoader />}
      <ScrollView 
        horizontal 
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.scrollContainer}
      >
        {entrances.map((entrance) => (
          <TouchableOpacity
            key={entrance.project_entrance_id}
            style={[
              styles.entranceButton,
              selectedEntranceId === +entrance.project_entrance_id && styles.entranceButtonSelected
            ]}
            onPress={() => onSelectEntrance(+entrance.project_entrance_id)}
          >
            <Text style={[
              styles.entranceButtonText,
              selectedEntranceId === +entrance.project_entrance_id && styles.entranceButtonTextSelected
            ]}>
              {entrance.entrance_name}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 20,
    paddingTop: 10,
    paddingBottom: 10,
    backgroundColor: COLORS.white
  },
  scrollContainer: {
    paddingHorizontal: 4,
    gap: 8,
  },
  entranceButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
  },
  entranceButtonSelected: {
    backgroundColor: COLORS.primaryLight,
    borderColor: COLORS.primaryLight,
  },
  entranceButtonText: {
    fontSize: SIZES.regular,
    fontFamily: FONT.regular,
    color: COLORS.black,
  },
  entranceButtonTextSelected: {
    color: COLORS.white,
    fontFamily: FONT.medium,
  },
});
