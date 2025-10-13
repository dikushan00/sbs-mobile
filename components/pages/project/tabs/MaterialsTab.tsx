import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, ActivityIndicator } from 'react-native';
import { COLORS, FONT, SIZES } from '@/constants';
import { getFloorMaterials } from '@/components/main/services';
import { WorkSetsMaterialsResponseType, MaterialType, FloorMapWorkSetWithMaterialsType } from '@/components/main/types';
import { MaterialsList } from '@/components/pages/project/tabs/MaterialsList';
import { MaterialsAccordion } from '@/components/pages/project/tabs/MaterialsAccordion';
import { BlockItem } from '@/components/common/BlockItem';
import { CustomLoader } from '@/components/common/CustomLoader';

interface MaterialsTabProps {
  floor_map_id: number;
}

export const MaterialsTab: React.FC<MaterialsTabProps> = ({ floor_map_id }) => {
  const [materialsData, setMaterialsData] = useState<WorkSetsMaterialsResponseType | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedPlacement, setSelectedPlacement] = useState<FloorMapWorkSetWithMaterialsType | null>(null);

  useEffect(() => {
    const fetchMaterials = async () => {
      setLoading(true);
      const data = await getFloorMaterials(floor_map_id);
      setLoading(false);
      if (data) {
        setMaterialsData(data);
      }
    };
    fetchMaterials();
  }, [floor_map_id]);

  const handlePlacementSelect = (placement: FloorMapWorkSetWithMaterialsType) => {
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
          <Text style={styles.loadingText}>Загрузка материалов...</Text>
        </View>
      </View>
    );
  }

  if (!materialsData) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorText}>Не удалось загрузить данные о материалах</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      {selectedPlacement ? (
        <MaterialsAccordion
          placement={selectedPlacement}
          onBack={handleBackToList}
        />
      ) : (
        <>
          <View style={styles.accordionContainer}>
            <Text style={styles.accordionTitle}>Материалы по конструктивам</Text>
            {materialsData.materials_ws.map((placement) => (
              <BlockItem
                key={placement.placement_type_id}
                title={placement.placement_type_name}
                onPress={() => handlePlacementSelect(placement)}
                blockMode={false}
              />
            ))}
          </View>
          <MaterialsList materials={materialsData.materials} />
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