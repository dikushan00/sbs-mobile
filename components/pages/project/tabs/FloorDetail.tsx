import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { COLORS, FONT, SIZES } from '@/constants';
import { ProjectFloorType, SelectedDataType } from '@/components/main/types';
import { Icon } from '@/components/Icon';
import { CustomTabs } from '@/components/common/CustomTabs';
import { useDispatch } from 'react-redux';
import { setPageSettings } from '@/services/redux/reducers/app';
import { setPageHeaderData as setUserPageHeaderData } from '@/services/redux/reducers/userApp';

interface FloorDetailProps {
  floor: ProjectFloorType;
  onBack: () => void;
  selectedData: SelectedDataType;
}

export const FloorDetail = ({ floor, onBack, selectedData }: FloorDetailProps) => {
  const dispatch = useDispatch();
  const [activeTab, setActiveTab] = useState('scheme');
  
  const workStatus = floor.floor_work_status?.[2];
  const paymentStatus = floor.floor_payment_status?.[2];
  
  const workCurrent = workStatus?.status_cnt || 0;
  const workTotal = floor.floor_work_status?.reduce((sum, status) => sum + status.status_cnt, 0) || 0;
  const paymentPercent = paymentStatus?.status_percent || 0;

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

  useEffect(() => {
    dispatch(setUserPageHeaderData({
      desc: `Подъезд ${selectedData.entrance}, Блок ${selectedData.block_name}, Этаж №${floor.floor}`,
    }));
    dispatch(setPageSettings({ 
      backBtn: true, 
      goBack: onBack
    }));
  }, [floor.floor, onBack, dispatch, selectedData]);

  const tabsData = [
    { label: 'Схема этажа', value: 'scheme' },
    { label: 'Материалы', value: 'materials' }
  ];

  const renderTabContent = () => {
    if (activeTab === 'scheme') {
      return renderSchemeContent();
    } else if (activeTab === 'materials') {
      return renderMaterialsContent();
    }
    return null;
  };

  const renderSchemeContent = () => (
    <View style={styles.tabContent}>
      {/* Статус работ */}
      <View style={styles.statusBlock}>
        <View style={styles.statusHeader}>
          <Icon name="checkCircleBlue" width={20} height={20} fill={getStatusColor(workCurrent, workTotal)} />
          <Text style={styles.statusTitle}>Статус работ</Text>
        </View>
        <View style={styles.statusInfo}>
          <Text style={[styles.statusValue, { color: getStatusColor(workCurrent, workTotal) }]}>
            {workCurrent}
          </Text>
          <Text style={styles.statusTotal}>из {workTotal}</Text>
        </View>
      </View>

      {/* Статус выплат */}
      <View style={styles.statusBlock}>
        <View style={styles.statusHeader}>
          <Icon name="money" width={20} height={20} fill={getPaymentColor(paymentPercent)} />
          <Text style={styles.statusTitle}>Статус выплат</Text>
        </View>
        <View style={styles.statusInfo}>
          <Text style={[styles.statusValue, { color: getPaymentColor(paymentPercent) }]}>
            {paymentPercent}%
          </Text>
          <Text style={styles.statusTotal}>из 100%</Text>
        </View>
      </View>

      {/* Детальная информация */}
      <View style={styles.detailsBlock}>
        <Text style={styles.detailsTitle}>Детальная информация</Text>
        
        <View style={styles.detailRow}>
          <Text style={styles.detailLabel}>Цвет ID:</Text>
          <Text style={styles.detailValue}>{floor.colour_id}</Text>
        </View>
        
        <View style={styles.detailRow}>
          <Text style={styles.detailLabel}>Floor Map ID:</Text>
          <Text style={styles.detailValue}>{floor.floor_map_id}</Text>
        </View>
        
        <View style={styles.detailRow}>
          <Text style={styles.detailLabel}>Hex код:</Text>
          <Text style={styles.detailValue}>{floor.hex_code}</Text>
        </View>
        
        <View style={styles.detailRow}>
          <Text style={styles.detailLabel}>Выбран:</Text>
          <Text style={styles.detailValue}>{floor.is_selected ? 'Да' : 'Нет'}</Text>
        </View>
      </View>

      {/* Квартиры */}
      {floor.flat && floor.flat.length > 0 && (
        <View style={styles.flatsBlock}>
          <Text style={styles.flatsTitle}>Квартиры ({floor.flat.length})</Text>
          {floor.flat.map((flat, index) => (
            <View key={index} style={styles.flatItem}>
              <Text style={styles.flatNumber}>Квартира {flat.flat_number || index + 1}</Text>
              {/* Здесь можно добавить дополнительную информацию о квартире */}
            </View>
          ))}
        </View>
      )}
    </View>
  );

  const renderMaterialsContent = () => (
    <View style={styles.tabContent}>
      <View style={styles.statusBlock}>
        <Text style={styles.detailsTitle}>Материалы этажа</Text>
        <Text style={styles.detailLabel}>Здесь будет отображаться информация о материалах для данного этажа</Text>
      </View>
    </View>
  );

  return (
    <View style={styles.container}>
      <CustomTabs 
        data={tabsData}
        defaultActive="scheme"
        onChange={setActiveTab}
        alt={true}
      />
      <ScrollView style={styles.scrollContainer}>
        {renderTabContent()}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.backgroundWhite,
    paddingHorizontal: 15
  },
  scrollContainer: {
    flex: 1,
  },
  tabContent: {
    padding: 16,
    gap: 16,
  },
  statusBlock: {
    backgroundColor: COLORS.white,
    borderRadius: 12,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 0,
    },
    shadowOpacity: 0.05,
    shadowRadius: 15,
    elevation: 0,
  },
  statusHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  statusTitle: {
    fontSize: SIZES.medium,
    fontFamily: FONT.medium,
    color: COLORS.black,
    marginLeft: 8,
  },
  statusInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statusValue: {
    fontSize: SIZES.large,
    fontFamily: FONT.bold,
  },
  statusTotal: {
    fontSize: SIZES.medium,
    fontFamily: FONT.regular,
    color: COLORS.gray,
    marginLeft: 8,
  },
  detailsBlock: {
    backgroundColor: COLORS.white,
    borderRadius: 12,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 0,
    },
    shadowOpacity: 0.05,
    shadowRadius: 15,
    elevation: 0,
  },
  detailsTitle: {
    fontSize: SIZES.medium,
    fontFamily: FONT.medium,
    color: COLORS.black,
    marginBottom: 12,
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.lightGray,
  },
  detailLabel: {
    fontSize: SIZES.medium,
    fontFamily: FONT.regular,
    color: COLORS.gray,
  },
  detailValue: {
    fontSize: SIZES.medium,
    fontFamily: FONT.medium,
    color: COLORS.black,
  },
  flatsBlock: {
    backgroundColor: COLORS.white,
    borderRadius: 12,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 0,
    },
    shadowOpacity: 0.05,
    shadowRadius: 15,
    elevation: 0,
  },
  flatsTitle: {
    fontSize: SIZES.medium,
    fontFamily: FONT.medium,
    color: COLORS.black,
    marginBottom: 12,
  },
  flatItem: {
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.lightGray,
  },
  flatNumber: {
    fontSize: SIZES.medium,
    fontFamily: FONT.regular,
    color: COLORS.black,
  },
});