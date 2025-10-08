import React, { useState } from 'react';
import { View, StyleSheet } from 'react-native';
import { COLORS } from '@/constants';
import { ProjectFiltersType, ProjectFloorType } from '@/components/main/types';
import { CustomLoader } from '@/components/common/CustomLoader';
import { getEntranceApartments } from '@/components/main/services';

export const FloorSchemaTab = ({filters}: {filters: ProjectFiltersType}) => {
  const [floorsPlan, setFloorsPlan] = useState<ProjectFloorType[] | null>(null);
  const [floorParamData, setFloorParamData] = useState<any>(null);
  const [isFetching, setIsFetching] = useState(false);

  const getFloorsPlan = async () => {
    if (!filters?.project_entrance_id) {
      setFloorParamData(null);
      setFloorsPlan(null);
      return;
    }
    setIsFetching(true);
    const res = await getEntranceApartments(filters);
    setIsFetching(false);
    setFloorsPlan(res || []);
  };
  return (
    <View style={styles.container}>
    {isFetching && <CustomLoader />}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: COLORS.backgroundWhite,
    gap: 12,
  },
});
