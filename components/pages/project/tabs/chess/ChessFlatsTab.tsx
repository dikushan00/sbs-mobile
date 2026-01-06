import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { COLORS, FONT, SIZES } from '@/constants';
import { ProjectEntranceAllInfoType, ProjectFloorType, ProjectFloorFlatType, SelectedDataType } from '@/components/main/types';
import { Icon } from '@/components/Icon';
import { EntranceSelector } from '@/components/common/EntranceSelector';

interface ChessFlatsTabProps {
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
const DEFAULT_COLOR = '#F2F2F2';

export const ChessFlatsTab = ({
  floorsPlan,
  projectEntranceId,
  setProjectEntranceId,
  setEntranceInfo,
  selectedData,
  onFloorPress,
}: ChessFlatsTabProps) => {

  const getSchemeColor = (hexCode?: string): string => {
    if (hexCode && hexCode !== '') {
      const hex = hexCode.startsWith('#') ? hexCode : `#${hexCode}`;
      const r = parseInt(hex.slice(1, 3), 16);
      const g = parseInt(hex.slice(3, 5), 16);
      const b = parseInt(hex.slice(5, 7), 16);
      return `rgba(${r}, ${g}, ${b}, 0.2)`;
    }
    return DEFAULT_COLOR;
  };

  const handleFlatPress = (flat: FlatWithFloor) => {
    const floor = floorsPlan?.find(f => f.floor === flat.floor);
    if (floor) {
      onFloorPress(floor);
    }
  };

  const renderApartmentItem = (flat: FlatWithFloor) => {
    const bgColor = getSchemeColor(flat.hex_code);

    return (
      <TouchableOpacity
        key={`${flat.floor}-${flat.flat_id}`}
        style={[styles.apartmentItem, { backgroundColor: bgColor }]}
        onPress={() => handleFlatPress(flat)}
        activeOpacity={0.7}
      >
        <Text style={styles.roomCount}>{flat.room_cnt}</Text>
        <View style={styles.statusContainer}>
          <Text style={styles.apartmentNumber}>{flat.area} м²</Text>
          <Text style={styles.apartmentNumber}>кв.{flat.flat_num}</Text>
        </View>
      </TouchableOpacity>
    );
  };

  const renderFloorHeader = (floor: ProjectFloorType) => {
    return (
      <View key={`header-${floor.floor}`} style={styles.floorHeaderRow}>
        <TouchableOpacity 
          style={[styles.floorHeader, styles.apartmentItem, { backgroundColor: getSchemeColor(floor.hex_code), borderRadius: 8 }]} 
          onPress={() => onFloorPress(floor)}
        >
          <Text style={styles.floorHeaderText}>Этаж {floor.floor}</Text>
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
        <View style={styles.legendItem}>
          <Icon name="info" width={16} height={16} fill={COLORS.primary} />
          <Text style={styles.legendText}>
            Одинаковый цвет означает одинаковую схему этажа
          </Text>
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
        {renderLegend()}
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
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
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
    fontSize: SIZES.small,
    fontFamily: FONT.regular,
    color: COLORS.dark,
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
  },
  apartmentNumber: {
    fontSize: 8,
    fontFamily: FONT.regular,
    color: '#1F1F1F',
  },
  roomCount: {
    fontSize: 9,
    fontFamily: FONT.medium,
    color: COLORS.dark,
  },
  statusContainer: {
    alignItems: 'center',
    justifyContent: 'center',
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

