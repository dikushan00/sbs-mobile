import React, { useCallback, useEffect, useRef, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Animated } from 'react-native';
import { COLORS, FONT, SIZES } from '@/constants';
import { getProjectEntrances, getResidentialEntrances } from '../main/services';
import { ProjectEntranceAllInfoType, SelectedDataType } from '../main/types';

type EntranceId = number | null;
type EntranceIdWithAll = number | 'ALL' | null;

type EntranceSelectorProps =
  {
      selectedEntranceId: EntranceId;
      defaultEntranceId?: EntranceId;
      onSelectEntrance: (entranceId: number, e: ProjectEntranceAllInfoType, init?: boolean) => void;
      containerStyle?: any;
      selectDefaultEntrance?: true;
      selectedData: SelectedDataType;
      projectId?: number | null
    }
  | {
      selectedEntranceId: EntranceIdWithAll;
      defaultEntranceId?: EntranceIdWithAll;
      onSelectEntrance: (entranceId: EntranceIdWithAll, e: ProjectEntranceAllInfoType, init?: boolean) => void;
      containerStyle?: any;
      selectDefaultEntrance: false;
      selectedData: SelectedDataType;
      projectId?: number | null
    };

const normalizeEntranceId = (id: number | string | null | undefined): number | 'ALL' | null => {
  if (id === 'ALL') return 'ALL';
  if (id === null || id === undefined) return null;
  const n = Number(id);
  return Number.isFinite(n) ? n : null;
};

const EntranceSelectorSkeleton = () => {
  const opacity = useRef(new Animated.Value(0.35)).current;

  useEffect(() => {
    const animation = Animated.loop(
      Animated.sequence([
        Animated.timing(opacity, { toValue: 0.9, duration: 700, useNativeDriver: true }),
        Animated.timing(opacity, { toValue: 0.35, duration: 700, useNativeDriver: true }),
      ]),
      { resetBeforeIteration: true }
    );
    animation.start();
    return () => animation.stop();
  }, [opacity]);

  const widths = [64, 92, 76, 110, 70, 88];

  return (
    <>
      {widths.map((w, i) => (
        <Animated.View
          key={`entrance-skeleton-${i}`}
          style={[styles.skeletonPill, { width: w, opacity }]}
        />
      ))}
    </>
  );
};

export const EntranceSelector = ({ 
  selectedEntranceId, 
  onSelectEntrance, 
  containerStyle,
  selectedData,
  defaultEntranceId,
  selectDefaultEntrance = true,
  projectId,
}: EntranceSelectorProps) => {
  const scrollViewRef = useRef<ScrollView>(null);
  const entrancePositions = useRef<Record<string, number>>({});
  const [isFetching, setIsFetching] = useState(false);
  const [entrances, setEntrances] = useState<ProjectEntranceAllInfoType[]>([]);

  const getEntrances = useCallback(async () => {
    setIsFetching(true)
    let res: ProjectEntranceAllInfoType[] | undefined;
    if(projectId) {
      res = await getProjectEntrances(projectId)
    } else {
      res = await getResidentialEntrances({resident_id: selectedData.resident_id, project_type_id: selectedData.project_type_id, project_entrance_id: null})
    }
    setIsFetching(false)
    if(!res) return;
    if(selectDefaultEntrance) {
      if (!defaultEntranceId && res?.length) {
        onSelectEntrance(normalizeEntranceId(res[0].project_entrance_id) as number, res[0], true)
      }
      setEntrances(res || [])
    } else {
      setEntrances([{project_entrance_id: 'ALL', block_name: '', contractor_name: '', entrance_name: 'Все', entrance_full_name: 'Все', entrance: 0, project_id: selectedData.project_id, entrance_percent: 0}, ...res])
    }
  }, [selectedData, selectDefaultEntrance, projectId])

  useEffect(() => {
    getEntrances()
  }, [getEntrances])

  // Автоматическая прокрутка к выбранному подъезду
  useEffect(() => {
    const normalizedSelected = normalizeEntranceId(selectedEntranceId as any);
    if (normalizedSelected && entrances.length > 0 && scrollViewRef.current) {
      const position = entrancePositions.current[String(normalizedSelected)];
      
      if (position !== undefined) {
        // Небольшая задержка для завершения рендеринга
        setTimeout(() => {
              scrollViewRef.current?.scrollTo({
            x: position - 20, // Отступ слева
                animated: true,
              });
        }, 100);
      }
    }
  }, [selectedEntranceId, entrances]);
  
  return (
    <View style={[styles.container, containerStyle]}>
      <ScrollView 
        ref={scrollViewRef}
        horizontal 
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.scrollContainer}
      >
        {isFetching && entrances.length === 0
          ? <EntranceSelectorSkeleton />
          : entrances.map((entrance) => (
            (() => {
              const entranceId = normalizeEntranceId(entrance.project_entrance_id);
              const selectedId = normalizeEntranceId(selectedEntranceId as any);
              const isSelected = entranceId !== null && selectedId !== null && entranceId === selectedId;

              return (
                <TouchableOpacity
                  key={entrance.project_entrance_id}
                  style={[
                    styles.entranceButton,
                    isSelected && styles.entranceButtonSelected
                  ]}
                  onLayout={(event) => {
                    const { x } = event.nativeEvent.layout;
                    if (entranceId !== null) entrancePositions.current[String(entranceId)] = x;
                  }}
                  onPress={() => {
                    // @ts-expect-error - entranceId type depends on selectDefaultEntrance branch
                    onSelectEntrance(entranceId, entrance)
                  }}
                >
                  <Text style={[
                    styles.entranceButtonText,
                    isSelected && styles.entranceButtonTextSelected
                  ]}>
                    {entrance.entrance_name}
                  </Text>
                </TouchableOpacity>
              );
            })()
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
  skeletonPill: {
    height: 34,
    borderRadius: 8,
    backgroundColor: COLORS.grayLight,
  },
});
