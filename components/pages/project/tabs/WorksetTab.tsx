import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { COLORS, FONT, SIZES } from '@/constants';
import { getFloorWorkSets } from '@/components/main/services';
import { FloorMapWorkSetsResponseType, FloorMapWorkSetType } from '@/components/main/types';
import { BlockItem } from '@/components/common/BlockItem';
import { CustomLoader } from '@/components/common/CustomLoader';
import { WorkSetAccordion } from './WorksetAccordion';

interface MaterialsTabProps {
  floor_map_id: number;
}

export const WorksetTab: React.FC<MaterialsTabProps> = ({ floor_map_id }) => {
  const [loading, setLoading] = useState(true);

  const [workSets, setWorkSets] = useState<FloorMapWorkSetsResponseType | null>(null);
  const [selectedPlacement, setSelectedPlacement] = useState<FloorMapWorkSetType | null>(null);

  useEffect(() => {
    const getFloorWorkSetsData = async () => {
      setLoading(true);
      const res = await getFloorWorkSets(floor_map_id);
      setLoading(false);
      setWorkSets(res || null);
    };
    getFloorWorkSetsData();
  }, [floor_map_id]);

  const handlePlacementSelect = (placement: FloorMapWorkSetType) => {
    setSelectedPlacement(placement);
  };

  const handleBackToList = () => {
    setSelectedPlacement(null);
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
      {(selectedPlacement) ? (
        <WorkSetAccordion
          placement={selectedPlacement}
          onBack={handleBackToList}
        />
      ) : (
        <>
          <View style={styles.accordionContainer}>
            
            {workSets?.data.map((workSetGroup) => (
              <BlockItem
                key={workSetGroup.placement_type_id}
                title={workSetGroup.placement_type_name}
                onPress={() => handlePlacementSelect(workSetGroup)}
                blockMode={false}
              />
            ))}
          </View>
        </>
      )}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
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
  accordionContainer: {
    marginTop: 20,
  },
  accordionTitle: {
    fontSize: 17,
    fontFamily: FONT.regular,
    color: COLORS.black,
    marginBottom: 10,
    marginTop: 10
  },
});