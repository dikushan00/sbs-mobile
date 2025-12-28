import React, { useCallback, useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { COLORS, FONT, SIZES } from '@/constants';
import { ProjectEntranceAllInfoType, ProjectFloorOkkType, ProjectFloorType, SelectedDataType } from '@/components/main/types';
import { CustomLoader } from '@/components/common/CustomLoader';
import { getEntranceFloors } from '@/components/main/services';
import { Icon } from '@/components/Icon';
import { useDispatch } from 'react-redux';
import { setPageSettings } from '@/services/redux/reducers/app';
import { setPageHeaderData as setUserPageHeaderData } from '@/services/redux/reducers/userApp';
import { EntranceSelector } from '@/components/common/EntranceSelector';

interface OkkFloorSelectionProps {
  onBack?: () => void;
  onFloorSelect: (floor: ProjectFloorOkkType) => void;
  selectedData: SelectedDataType;
  setEntranceInfo: (n: ProjectEntranceAllInfoType) => void
  projectEntranceId: number | null
  setProjectEntranceId: (n: number) => void
}

export const OkkFloorSelection: React.FC<OkkFloorSelectionProps> = ({ 
  selectedData, 
  onBack, 
  onFloorSelect,
  setEntranceInfo,
  projectEntranceId,
  setProjectEntranceId,
}) => {
  const dispatch = useDispatch();
  const [floorsPlan, setFloorsPlan] = useState<ProjectFloorOkkType[] | null>(null);
  const [isFetching, setIsFetching] = useState(false);

  const getFloorsPlan = useCallback(async () => {
    if(!projectEntranceId) return
    setIsFetching(true);
    const res = await getEntranceFloors(projectEntranceId);
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

  const renderFloorItem = (floor: ProjectFloorOkkType) => {
    
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
            <Icon name="checkCircleOutline" width={14} height={14} fill={COLORS.primary} />
            <Text style={[styles.statusText, { color: getStatusColor(floor.floor_work_done, floor.floor_work_cnt) }]}>
              {floor.floor_work_done}
            </Text>
            <Text style={styles.statusTotal}>из {floor.floor_work_cnt}</Text>
          </View>
          
          <View style={styles.paymentContainer}>
            <Icon name="moneyDollar" width={14} height={14} fill={COLORS.white} />
            <Text style={[styles.paymentText, { color: getPaymentColor(floor.floor_payment_status) }]}>
              {floor.floor_payment_status}%
            </Text>
            <Text style={styles.paymentTotal}>из 100%</Text>
          </View>
        </View>
        <View style={{gap: 5}}>
          {floor.has_okk_call && <Icon name="flagTime" width={10} height={10} fill={COLORS.warning || '#000'} />}
          {floor.has_okk_defect && <Icon name='info' fill='red' width={10} height={10} />}
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
            {leftFloor ? renderFloorItem(leftFloor) : <View style={styles.emptyFloor} />}
          </View>
          <View style={styles.floorColumn}>
            {rightFloor ? renderFloorItem(rightFloor) : <View style={styles.emptyFloor} />}
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
        onSelectEntrance={(id, data, init) => {
          if(projectEntranceId && init) return
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
    fontSize: SIZES.regular,
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
    fontSize: SIZES.xSmall,
    fontFamily: FONT.medium,
    marginLeft: 4,
  },
  statusTotal: {
    fontSize: SIZES.xSmall,
    fontFamily: FONT.regular,
    color: COLORS.gray,
    marginLeft: 4,
  },
  paymentContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  paymentText: {
    fontSize: SIZES.xSmall,
    fontFamily: FONT.medium,
    marginLeft: 4,
  },
  paymentTotal: {
    fontSize: SIZES.xSmall,
    fontFamily: FONT.regular,
    color: COLORS.gray,
    marginLeft: 4,
  },
  emptyFloor: {
    flex: 1,
    minHeight: 100,
  },
});
