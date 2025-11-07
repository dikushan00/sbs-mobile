import React, { useCallback, useEffect, useRef, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { COLORS, FONT, SIZES } from '@/constants';
import { getResidentialEntrances } from '../main/services';
import { ProjectEntranceAllInfoType, SelectedDataType } from '../main/types';
import { CustomLoader } from './CustomLoader';

interface EntranceSelectorProps {
  selectedEntranceId: number | null;
  onSelectEntrance: (entranceId: number, e: ProjectEntranceAllInfoType, init?: boolean) => void;
  containerStyle?: any;
  selectedData: SelectedDataType;
}

export const EntranceSelector = ({ 
  selectedEntranceId, 
  onSelectEntrance, 
  containerStyle,
  selectedData,
}: EntranceSelectorProps) => {
  const scrollViewRef = useRef<ScrollView>(null);
  const entranceRefs = useRef<{ [key: number]: View | null }>({});
  const [isFetching, setIsFetching] = useState(false);
  const [entrances, setEntrances] = useState<ProjectEntranceAllInfoType[]>([]);

  const getEntrances = useCallback(async () => {
    setIsFetching(true)
    getResidentialEntrances({resident_id: selectedData.resident_id, project_type_id: selectedData.project_type_id, project_entrance_id: null})
    .then((res) => {
      setIsFetching(false)
      if(!res) return
      onSelectEntrance(+res[0].project_entrance_id, res[0], true)
      setEntrances(res || [])
    });
  }, [selectedData])

  useEffect(() => {
    getEntrances()
  }, [getEntrances])

  // Автоматическая прокрутка к выбранному подъезду
  useEffect(() => {
    if (selectedEntranceId && entrances.length > 0 && scrollViewRef.current) {
      const selectedIndex = entrances.findIndex(
        (entrance) => +entrance.project_entrance_id === selectedEntranceId
      );
      
      if (selectedIndex !== -1 && entranceRefs.current[selectedEntranceId]) {
        // Небольшая задержка для завершения рендеринга
        setTimeout(() => {
          entranceRefs.current[selectedEntranceId]?.measureLayout(
            //@ts-ignore
            scrollViewRef.current,
            (x, y, width, height) => {
              scrollViewRef.current?.scrollTo({
                x: x - 20, // Отступ слева
                animated: true,
              });
            },
            () => {}
          );
        }, 100);
      }
    }
  }, [selectedEntranceId, entrances]);
  
  return (
    <View style={[styles.container, containerStyle]}>
      {isFetching && <CustomLoader />}
      <ScrollView 
        ref={scrollViewRef}
        horizontal 
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.scrollContainer}
      >
        {entrances.map((entrance) => (
          <TouchableOpacity
            key={entrance.project_entrance_id}
            //@ts-ignore
            ref={(ref) => {
              if (ref) {
                entranceRefs.current[+entrance.project_entrance_id] = ref;
              }
            }}
            style={[
              styles.entranceButton,
              selectedEntranceId === +entrance.project_entrance_id && styles.entranceButtonSelected
            ]}
            onPress={() => {
              onSelectEntrance(+entrance.project_entrance_id, entrance)
            }}
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
