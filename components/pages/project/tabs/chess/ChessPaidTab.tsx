import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { COLORS, FONT, SIZES } from '@/constants';
import { ProjectEntranceAllInfoType, ProjectFloorType, ProjectFloorFlatType, ProjectPaymentStatusType, SelectedDataType } from '@/components/main/types';
import { EntranceSelector } from '@/components/common/EntranceSelector';
import { numberWithCommas } from '@/utils';

interface ChessPaidTabProps {
  floorsPlan: ProjectFloorType[] | null;
  projectEntranceId: number | null;
  setProjectEntranceId: (id: number | null) => void;
  setEntranceInfo: (data: ProjectEntranceAllInfoType | null) => void;
  selectedData: SelectedDataType;
  onFloorPress: (floor: ProjectFloorType) => void;
}

interface FlatWithFloor extends ProjectFloorFlatType {
  floor: string | number;
  floor_map_id: number;
  hex_code: string;
  colour_id: number;
}

const APARTMENT_SIZE = 60;
const APARTMENT_GAP = 8;

export const ChessPaidTab = ({
  floorsPlan,
  projectEntranceId,
  setProjectEntranceId,
  setEntranceInfo,
  selectedData,
  onFloorPress,
}: ChessPaidTabProps) => {

  const handleFlatPress = (flat: FlatWithFloor) => {
    const floor = floorsPlan?.find(f => f.floor === flat.floor);
    if (floor) {
      onFloorPress(floor);
    }
  };

  const renderStatusFills = (paymentStatus?: ProjectPaymentStatusType[]) => {
    if (!paymentStatus || paymentStatus.length === 0) return null;
    
    // Last element at bottom, first element at top
    const reversedStatus = [...paymentStatus].reverse();
    let currentBottom = 0;
    
    return reversedStatus.map((status, index) => {
      const fillHeight = (status.status_percent / 100) * APARTMENT_SIZE;
      const bottom = currentBottom;
      currentBottom += fillHeight;
      
      if (fillHeight <= 0) return null;
      
      const color = status.status_colour || '#D3D3D3';
      
      return (
        <View
          key={`fill-${status.status_colour}-${index}`}
          style={[
            styles.statusFill,
            {
              backgroundColor: color,
              height: fillHeight,
              bottom: bottom,
              opacity: 0.3,
            }
          ]}
        />
      );
    });
  };

  const renderApartmentItem = (flat: FlatWithFloor) => {
    return (
      <TouchableOpacity
        key={`${flat.floor}-${flat.flat_id}`}
        style={[styles.apartmentItem]}
        onPress={() => handleFlatPress(flat)}
        activeOpacity={0.7}
      >
        {/* Status fill backgrounds */}
        {renderStatusFills(flat.payment_status)}
        
        {/* Content on top */}
        <View style={styles.statusContainer}>
          {
            flat.payment_status?.map(status => (
              <Text 
                key={status.status_colour} 
                style={[styles.statusValue, { color: status.status_colour === '#D3D3D3' ? COLORS.dark : status.status_colour }]}
              >
                {numberWithCommas(status.status_sum)}
              </Text>
            ))
          }
          <Text style={styles.flatLabel}>кв.{flat.flat_num}</Text>
        </View>
      </TouchableOpacity>
    );
  };

  const renderFloorHeader = (floor: ProjectFloorType) => {
    return (
      <View key={`header-${floor.floor}`} style={styles.floorHeaderRow}>
        <TouchableOpacity 
          style={[styles.floorHeader, styles.apartmentItem]} 
          onPress={() => onFloorPress(floor)}
        >
          {/* Status fill backgrounds for floor */}
          {renderStatusFills(floor.floor_payment_status)}
          
          <View style={styles.floorStatsContainer}>
            {
              floor.floor_payment_status?.map(status => (
                <Text 
                  key={status.status_colour} 
                  style={[styles.floorStatusValue, { color: status.status_colour === '#D3D3D3' ? COLORS.dark : status.status_colour }]}
                >
                  {numberWithCommas(status.status_sum)}
                </Text>
              ))
            }
            <Text style={styles.floorHeaderText}>Этаж {floor.floor}</Text>
          </View>
        </TouchableOpacity>
        <View style={styles.floorDivider} />
      </View>
    );
  };

  const renderFloorFlats = (floor: ProjectFloorType, flats: ProjectFloorFlatType[]) => {
    return (
      <View key={`flats-${floor.floor}`} style={styles.flatsRowContainer}>
        {flats.map(flat => renderApartmentItem({
          ...flat, 
          floor: floor.floor, 
          floor_map_id: floor.floor_map_id, 
          hex_code: floor.hex_code, 
          colour_id: floor.colour_id
        }))}
      </View>
    );
  };

  const renderChessGrid = () => {
    if (!floorsPlan || floorsPlan.length === 0) {
      return (
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyText}>Нет данных для отображения</Text>
        </View>
      );
    }

    const sortedFloors = [...floorsPlan].sort((a, b) => {
      const floorA = typeof a.floor === 'string' ? parseInt(a.floor) : a.floor;
      const floorB = typeof b.floor === 'string' ? parseInt(b.floor) : b.floor;
      return floorB - floorA;
    });

    return (
      <View style={styles.gridWrapper}>
        <View style={styles.fixedColumn}>
          {sortedFloors.map(floor => renderFloorHeader(floor))}
        </View>
        
        <ScrollView 
          horizontal 
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.gridContentContainer}
          style={styles.gridScrollContainer}
        >
          <View style={styles.gridContainer}>
            {sortedFloors.map(floor => renderFloorFlats(floor, floor.flat))}
          </View>
        </ScrollView>
      </View>
    );
  };

  const renderLegend = () => {
    return (
      <View style={styles.legendContainer}>
        <View style={styles.legendRow}>
          <View style={styles.legendItem}>
            <View style={[styles.legendDot, { backgroundColor: '#2CAB00' }]} />
            <Text style={styles.legendText}>Оплачено</Text>
          </View>
          <View style={styles.legendItem}>
            <View style={[styles.legendDot, { backgroundColor: '#BBBE31' }]} />
            <Text style={styles.legendText}>К оплате</Text>
          </View>
          <View style={styles.legendItem}>
            <View style={[styles.legendDot, { backgroundColor: '#D3D3D3' }]} />
            <Text style={styles.legendText}>Остаток</Text>
          </View>
        </View>
      </View>
    );
  };

  return (
    <>
      <EntranceSelector
        selectedEntranceId={projectEntranceId}
        onSelectEntrance={(id, data) => {
          setProjectEntranceId(id);
          setEntranceInfo(data);
        }}
        selectedData={selectedData}
        projectId={selectedData.project_id}
        containerStyle={{
          borderEndStartRadius: 16,
          borderStartStartRadius: 16,
        }}
      />

      <View style={styles.contentContainer}>
        {/* {renderLegend()} */}
        <ScrollView style={styles.scrollContainer}>
          {renderChessGrid()}
        </ScrollView>
      </View>
    </>
  );
};

const styles = StyleSheet.create({
  contentContainer: {
    backgroundColor: COLORS.white,
    flex: 1,
    paddingHorizontal: 16,
  },
  scrollContainer: {
    flex: 1,
    marginTop: 10,
  },
  legendContainer: {
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  legendRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 24,
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  legendDot: {
    width: 16,
    height: 16,
    borderRadius: 5,
  },
  legendText: {
    fontSize: 11,
    fontFamily: FONT.regular,
    color: COLORS.black,
    opacity: 0.8,
  },
  gridWrapper: {
    flexDirection: 'row',
    flex: 1,
    gap: 8,
    paddingBottom: 16,
  },
  fixedColumn: {
    gap: 8,
  },
  floorHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  gridScrollContainer: {
    flex: 1,
  },
  gridContentContainer: {
    paddingRight: 16,
  },
  gridContainer: {
    gap: 8,
  },
  floorHeader: {
    paddingVertical: 4,
  },
  floorHeaderText: {
    fontSize: 8,
    fontFamily: FONT.regular,
    color: COLORS.dark,
  },
  floorStatsContainer: {
    gap: 1,
    marginTop: 2,
    alignItems: 'center',
  },
  floorStatusValue: {
    fontSize: 9,
    fontFamily: FONT.medium,
    color: '#2CAB00',
  },
  floorDivider: {
    height: 50,
    width: 1,
    backgroundColor: '#E0E0E0',
  },
  flatsRowContainer: {
    flexDirection: 'row',
    gap: APARTMENT_GAP,
    height: APARTMENT_SIZE,
    alignItems: 'center',
  },
  apartmentItem: {
    width: APARTMENT_SIZE,
    height: APARTMENT_SIZE,
    borderRadius: 8,
    paddingVertical: 4,
    paddingHorizontal: 4,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.grayLight,
    overflow: 'hidden',
  },
  statusFill: {
    position: 'absolute',
    left: 0,
    right: 0,
  },
  statusContainer: {
    alignItems: 'center',
    gap: 1,
  },
  statusValue: {
    fontSize: 9,
    fontFamily: FONT.medium,
    color: '#2CAB00',
  },
  flatLabel: {
    fontSize: 8,
    fontFamily: FONT.regular,
    color: '#1F1F1F',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 40,
  },
  emptyText: {
    fontSize: SIZES.regular,
    fontFamily: FONT.regular,
    color: COLORS.gray,
  },
});

