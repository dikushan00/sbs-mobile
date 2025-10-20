import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { COLORS, FONT, SIZES } from '@/constants';
import { getFloorWorkSets } from '@/components/main/services';
import { FloorMapWorkSetsResponseType, FloorMapWorkSetType } from '@/components/main/types';
import { BlockItem } from '@/components/common/BlockItem';
import { CustomLoader } from '@/components/common/CustomLoader';
import { WorkSetAccordion } from './WorksetAccordion';
import { Icon } from '@/components/Icon';
import { useDispatch } from 'react-redux';
import { setPageSettings } from '@/services/redux/reducers/app';

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
    };
    getFloorWorkSetsData();
  }, [floor_map_id]);

  useEffect(() => {
    if(selectedPlacement) {
      dispatch(setPageSettings({goBack: () => setSelectedPlacement(null)}))
    } else {
      dispatch(setPageSettings({goBack: onBack}))
    }
  }, [selectedPlacement]);

  const handlePlacementSelect = (placement: FloorMapWorkSetType) => {
    setSelectedPlacement(placement);
  };

  const handleBackToList = () => {
    setSelectedPlacement(null);
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
      {(selectedPlacement) ? (
        <WorkSetAccordion
          floor_map_id={floor_map_id}
          placement={selectedPlacement}
          onBack={handleBackToList}
          setWorkSets={handleWorkSetsUpdate}
        />
      ) : (
        <>
          <View style={styles.accordionContainer}>
            {workSets?.data.map((placementType) => {
              const showContent = !!placementType.placement_okk_status_colours?.length
              return (
                <BlockItem  
                  key={placementType.placement_type_id}
                  title={placementType.placement_type_name}
                  onPress={() => handlePlacementSelect(placementType)}
                  blockMode={false}
                  renderContent={showContent ? () => <View style={{flexDirection: 'row', alignItems: 'center', gap: 10}}>
                    {
                      placementType.placement_okk_status_colours?.map(item => {
                        return (
                          <Icon key={item} name="flagTime" width={16} height={16} fill={item || '#000'} />
                        )
                      })
                    }
                  </View> : undefined}
                />
              )
            })}
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
  },
  accordionTitle: {
    fontSize: 17,
    fontFamily: FONT.regular,
    color: COLORS.black,
    marginBottom: 10,
    marginTop: 10
  },
});