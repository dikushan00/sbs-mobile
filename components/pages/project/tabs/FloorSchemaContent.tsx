import React, { useCallback, useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { COLORS, FONT, SIZES } from '@/constants';
import { ProjectEntranceAllInfoType, ProjectFloorType, SelectedDataType } from '@/components/main/types';
import { CustomLoader } from '@/components/common/CustomLoader';
import { getEntranceApartments } from '@/components/main/services';
import { Icon } from '@/components/Icon';
import { FloorDetail } from './FloorDetail';
import { useDispatch } from 'react-redux';
import { setPageSettings } from '@/services/redux/reducers/app';
import { setPageHeaderData as setUserPageHeaderData } from '@/services/redux/reducers/userApp';
import { EntranceSelector } from '@/components/common/EntranceSelector';

interface FloorSchemaContentProps {
  onBack?: () => void;
  selectedData: SelectedDataType;
}

export const FloorSchemaContent = ({ onBack, selectedData }: FloorSchemaContentProps) => {
  const dispatch = useDispatch();
  const [floorsPlan, setFloorsPlan] = useState<ProjectFloorType[] | null>(null);
  const [isFetching, setIsFetching] = useState(false);
  const [projectEntranceId, setProjectEntranceId] = useState<number | null>(null);
  const [entranceInfo, setEntranceInfo] = useState<ProjectEntranceAllInfoType | null>(null);
  const [selectedFloor, setSelectedFloor] = useState<ProjectFloorType | null>(null);

  const getFloorsPlan = useCallback(async () => {
    if (!projectEntranceId) {
      setFloorsPlan(null);
      return;
    }
    setIsFetching(true);
    const res = await getEntranceApartments({resident_id: selectedData.resident_id, project_type_id: selectedData.project_type_id, project_entrance_id: projectEntranceId});
    setIsFetching(false);
    setFloorsPlan(res || []);
  }, [projectEntranceId, selectedData])

  useEffect(() => {
    getFloorsPlan();
  }, [getFloorsPlan]);

  useEffect(() => {
    if(!selectedFloor) {
      dispatch(setPageSettings({ 
        backBtn: true, 
        goBack: onBack
      }));
      dispatch(setUserPageHeaderData({
        title: "Схема этажа и материалы",
        desc: "",
      }))
    }
  }, [onBack, dispatch, selectedFloor]);

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
        onPress={() => setSelectedFloor(floor)}
      >
        <View style={styles.floorNumberContainer}>
          <Text style={styles.floorNumber}>{floor.floor}</Text>
        </View>
        <View style={{gap: 10}}>
          <View style={styles.statusContainer}>
            <Icon name="checkCircleOutline" width={14} height={14} fill={COLORS.primary} />
            <Text style={[styles.statusText, { color: getStatusColor(workCurrent, workTotal) }]}>
              {workCurrent}
            </Text>
            <Text style={styles.statusTotal}>из {workTotal}</Text>
          </View>
          
          <View style={styles.paymentContainer}>
            <Icon name="moneyDollar" width={14} height={14} fill={COLORS.white} stroke={COLORS.primary} />
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

  if (selectedFloor) {
    return (
      <FloorDetail 
        floor={selectedFloor} 
        selectedData={selectedData} 
        entranceInfo={entranceInfo}
        onBack={() => setSelectedFloor(null)} 
      />
    );
  }

  return (
    <View style={styles.container}>
      {isFetching && <CustomLoader />}
      
      <EntranceSelector
        selectedEntranceId={projectEntranceId}
        onSelectEntrance={(id, data) => {
            setProjectEntranceId(id)
            setEntranceInfo(data)
          }}
        selectedData={selectedData}
        projectId={selectedData.project_id}
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
  statusContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
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
    minHeight: 100, // Минимальная высота для пустого блока
  },
});
