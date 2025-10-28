import React, { useCallback, useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { COLORS, FONT, SIZES } from '@/constants';
import { ProjectFiltersType, ProjectFloorType, SelectedDataType } from '@/components/main/types';
import { CustomLoader } from '@/components/common/CustomLoader';
import { getEntranceApartments } from '@/components/main/services';
import { Icon } from '@/components/Icon';
import { useDispatch } from 'react-redux';
import { setPageSettings } from '@/services/redux/reducers/app';
import { setPageHeaderData as setUserPageHeaderData } from '@/services/redux/reducers/userApp';
import { EntranceSelector } from '@/components/common/EntranceSelector';

interface OkkFloorSelectionProps {
  onBack: () => void;
  onFloorSelect: (floor: ProjectFloorType) => void;
  selectedData: SelectedDataType;
}

export const OkkFloorSelection: React.FC<OkkFloorSelectionProps> = ({ 
  selectedData, 
  onBack, 
  onFloorSelect 
}) => {
  const dispatch = useDispatch();
  const [floorsPlan, setFloorsPlan] = useState<ProjectFloorType[] | null>(null);
  const [isFetching, setIsFetching] = useState(false);
  const [projectEntranceId, setProjectEntranceId] = useState<number | null>(null);

  const getFloorsPlan = useCallback(async () => {
    setIsFetching(true);
    const res = await getEntranceApartments({resident_id: selectedData.resident_id, project_type_id: selectedData.project_type_id, project_entrance_id: projectEntranceId});
    setIsFetching(false);
    setFloorsPlan(res || []);
  }, [projectEntranceId, selectedData])

  useEffect(() => {
    getFloorsPlan();
  }, [getFloorsPlan]);

  useEffect(() => {
    dispatch(setPageSettings({ 
      backBtn: true, 
      goBack: onBack
    }));
    dispatch(setUserPageHeaderData({
      title: "Вызов ОКК",
      desc: "",
    }));
  }, [onBack, dispatch]);

  const getStatusColor = (current: number, total: number) => {
    if (current === 0) return COLORS.red;
    if (current < total) return '#EA9F43';
    if (current === total) return COLORS.green;
    return COLORS.gray;
  };

  const getPaymentColor = (percent: number) => {
    if (percent === 0) return COLORS.red;
    if (percent < 100) return '#EA9F43';
    if (percent === 100) return COLORS.green;
    return COLORS.gray;
  };

  const renderFloorItem = (floor: ProjectFloorType, index: number) => {
    const workStatus = floor.floor_work_status?.[2];
    const paymentStatus = floor.floor_payment_status?.[2];
    
    const workCurrent = workStatus?.status_cnt || 0;
    const workTotal = floor.floor_work_status?.reduce((sum, status) => sum + status.status_cnt, 0) || 0;
    const paymentPercent = paymentStatus?.status_percent || 0;

    return (
      <TouchableOpacity 
        key={floor.floor} 
        style={styles.floorItem}
        onPress={() => onFloorSelect(floor)}
      >
        <View style={styles.floorNumberContainer}>
          <Text style={styles.floorNumber}>{floor.floor}</Text>
        </View>
        <View style={styles.floorInfo}>
          <View style={styles.statusContainer}>
            <Icon name="check" width={16} height={16} fill={getStatusColor(workCurrent, workTotal)} />
            <Text style={[styles.statusText, { color: getStatusColor(workCurrent, workTotal) }]}>
              {workCurrent}
            </Text>
            <Text style={styles.statusTotal}>из {workTotal}</Text>
          </View>
          
          <View style={styles.paymentContainer}>
            <Icon name="moneyDollar" width={14} height={14} fill={COLORS.white} />
            <Text style={[styles.paymentText, { color: getPaymentColor(paymentPercent) }]}>
              {paymentPercent}%
            </Text>
            <Text style={styles.paymentTotal}>из 100%</Text>
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  const renderFloorsGrid = () => {
    if (!floorsPlan || floorsPlan.length === 0) return null;

    //@ts-ignore
    const sortedFloors = [...floorsPlan].sort((a, b) => parseInt(a.floor) - parseInt(b.floor));
    
    const halfLength = Math.ceil(sortedFloors.length / 2);
    const leftFloors = sortedFloors.slice(0, halfLength);
    const rightFloors = sortedFloors.slice(halfLength);
    
    const maxRows = Math.max(leftFloors.length, rightFloors.length);
    const rows = [];
    
    for (let i = 0; i < maxRows; i++) {
      const leftFloor = leftFloors[i];
      const rightFloor = rightFloors[i];
      
      rows.push(
        <View key={i} style={styles.floorRow}>
          <View style={styles.floorColumn}>
            {leftFloor ? renderFloorItem(leftFloor, i) : <View style={styles.emptyFloor} />}
          </View>
          <View style={styles.floorColumn}>
            {rightFloor ? renderFloorItem(rightFloor, i + maxRows) : <View style={styles.emptyFloor} />}
          </View>
        </View>
      );
    }
    return rows;
  };

  return (
    <View style={styles.container}>
      {isFetching && <CustomLoader />}
      <EntranceSelector
        selectedEntranceId={projectEntranceId}
        onSelectEntrance={setProjectEntranceId}
        selectedData={selectedData}
      />
      
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Выберите этаж</Text>
        <Text style={styles.headerCount}>
          <Text style={styles.countLabel}>Кол-во:</Text> {floorsPlan?.length || 0}
        </Text>
      </View>
      
      <ScrollView style={styles.floorsContainer} showsVerticalScrollIndicator={false}>
        {renderFloorsGrid()}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    paddingBottom: 5
  },
  headerTitle: {
    fontSize: SIZES.medium,
    fontFamily: FONT.regular,
    color: COLORS.black,
  },
  headerCount: {
    fontSize: SIZES.medium,
    fontFamily: FONT.regular,
    color: COLORS.black,
  },
  countLabel: {
    color: COLORS.darkGray,
  },
  floorsContainer: {
    flex: 1,
    padding: 16,
  },
  floorRow: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 12,
  },
  floorColumn: {
    flex: 1,
  },
  floorItem: {
    backgroundColor: COLORS.white,
    borderRadius: 12,
    padding: 16,
    paddingHorizontal: 10,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 0,
    },
    shadowOpacity: 0.05,
    shadowRadius: 15,
    elevation: 0,
    flexDirection: 'row',
    alignItems: 'center',
  },
  floorNumberContainer: {
    backgroundColor: COLORS.background,
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 6,
    marginRight: 12,
  },
  floorNumber: {
    fontSize: SIZES.medium,
    fontFamily: FONT.medium,
    color: COLORS.black,
  },
  floorInfo: {
    flex: 1,
    gap: 10,
  },
  statusContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statusText: {
    fontSize: SIZES.small,
    fontFamily: FONT.medium,
    marginLeft: 4,
  },
  statusTotal: {
    fontSize: SIZES.small,
    fontFamily: FONT.regular,
    color: COLORS.gray,
    marginLeft: 4,
  },
  paymentContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  paymentText: {
    fontSize: SIZES.small,
    fontFamily: FONT.medium,
    marginLeft: 4,
  },
  paymentTotal: {
    fontSize: SIZES.small,
    fontFamily: FONT.regular,
    color: COLORS.gray,
    marginLeft: 4,
  },
  emptyFloor: {
    flex: 1,
    minHeight: 100,
  },
});
