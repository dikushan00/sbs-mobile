import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { COLORS, FONT, SIZES } from '@/constants';
import { getEntranceDocumentFloors, getPlacementTypes, getEntrancePayments, getProjectEntrances } from '@/components/main/services';
import { PlacementType, ProjectFiltersType, ProjectPaymentType, SelectedDataType, SimpleFloorType } from '@/components/main/types';
import { CustomLoader } from '@/components/common/CustomLoader';
import { Icon } from '@/components/Icon';
import { CustomSelect } from '@/components/common/CustomSelect';
import { numberWithCommas } from '@/utils';
import { NotFound } from '@/components/common/NotFound';
import { EntranceSelector } from '@/components/common/EntranceSelector';
import { PlacementBadges } from '@/components/pages/project/components/PlacementBadges';
import { setPageSettings } from '@/services/redux/reducers/app';
import { useDispatch } from 'react-redux';
import { setPageHeaderData } from '@/services/redux/reducers/userApp';

interface PaymentsTabProps {
  filters: ProjectFiltersType;
  onBack?: () => void;
  project_id: number | null;
  selectedData: SelectedDataType
}

export const PaymentsTab: React.FC<PaymentsTabProps> = ({ filters, onBack, project_id, selectedData }) => {
  const dispatch = useDispatch();
  const [allPaymentsData, setAllPaymentsData] = useState<ProjectPaymentType[] | null>(null);
  const [loading, setLoading] = useState(true);
  const [placementTypes, setPlacementTypes] = useState<PlacementType[]>([]);
  const [floors, setFloors] = useState<SimpleFloorType[]>([]);
  const [selectedEntrance, setSelectedEntrance] = useState<{ id: number | 'ALL' | null; block_name: string | null }>({
    id: 'ALL',
    block_name: null,
  });
  const [localFilters, setLocalFilters] = useState({
    placement_type_id: null as number | null,
    floor: null as number | null,
  });

  useEffect(() => {
    if(onBack) {
      dispatch(setPageSettings({
        backBtn: true,
        goBack: onBack
      }));
      dispatch(setPageHeaderData({
        title: 'Платежи',
        desc: '',
      }));
    }
  }, [onBack]);

  useEffect(() => {
    const fetchInitialData = async () => {
      const [entrancesData] = await Promise.all([
        selectedData.project_id ? getProjectEntrances(selectedData.project_id) : null ,
      ]);
      if(entrancesData) {
        if(entrancesData?.length) {
          const floorsData = await getEntranceDocumentFloors({...filters, project_entrance_id: entrancesData[0].project_entrance_id})
          setFloors(floorsData || []);
        }
      }
    };
    fetchInitialData();
  }, [selectedData.project_id]);

  useEffect(() => {
    const fetchInitialData = async () => {
      const [placementTypesData] = await Promise.all([
        getPlacementTypes(),
      ]);
      setPlacementTypes(placementTypesData || []);
    };
    fetchInitialData();
  }, []);

  useEffect(() => {
    const fetchPayments = async () => {
      setLoading(true);
      const payments = await getEntrancePayments({...filters, ...localFilters, project_id});
      setLoading(false);
      setAllPaymentsData(payments || []);
    };
    fetchPayments();
  }, [localFilters, filters, project_id]);

  // Локальная фильтрация по подъезду
  const paymentsData = React.useMemo(() => {
    if (!allPaymentsData) return null;
    if (selectedEntrance.id === 'ALL' || !selectedEntrance.block_name) {
      return allPaymentsData;
    }
    return allPaymentsData.filter(item => item.block_name === selectedEntrance.block_name);
  }, [allPaymentsData, selectedEntrance]);

  const getStatusColour = (status_code: string) => {
    switch (status_code) {
      case 'PAYED':
        return '#13A10E';
      case 'AWAITING_PAYMENT':
        return '#F6BA30';
      case 'CANCEL':
        return COLORS.red;
      default:
        return COLORS.primary;
    }
  };

  const totalColSum = paymentsData?.reduce((sum, item) => sum + item.col_sum, 0) || 0;
  const totalPaymentAmount = paymentsData?.reduce((sum, item) => sum + item.payment_amount, 0) || 0;
  const paymentPercentage = totalColSum > 0 ? Math.min((totalPaymentAmount / totalColSum) * 100, 100) : 0;
  const remainingAmount = Math.max(totalColSum - totalPaymentAmount, 0);

  if (!paymentsData && !loading) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorText}>Не удалось загрузить данные</Text>
      </View>
    );
  }

  const onEntranceChange = async (value: number | 'ALL' | null, entrance?: any) => {
    // When selecting "ALL" we don't have a concrete entrance to load floors for
    if (value === 'ALL' || value === null) {
      setSelectedEntrance({ id: value, block_name: null });
      setLocalFilters(prev => ({ ...prev, floor: null }));
      setFloors([]);
      return;
    }

    setSelectedEntrance({ id: value, block_name: entrance?.block_name || null });
    setLocalFilters(prev => ({ ...prev, floor: null }));
    const floorsData = await getEntranceDocumentFloors({ ...filters, project_entrance_id: value });
    setFloors(floorsData || []);
  }

  return (
    <View style={styles.container}>
      <EntranceSelector
        selectedEntranceId={selectedEntrance.id}
        onSelectEntrance={(value, entrance) => onEntranceChange(value, entrance)}
        selectedData={selectedData}
        projectId={selectedData.project_id}
        selectDefaultEntrance={false}
      />
      <View style={styles.selectsContainer}>
        <View style={styles.selectWrapper}>
          <CustomSelect
            list={floors}
            valueKey="floor"
            labelKey="floor_name"
            onChange={(value) => setLocalFilters(prev => ({ ...prev, floor: value }))}
            value={localFilters.floor}
            placeholder="Этаж" alt
            emptyListMessage={!selectedEntrance.id || selectedEntrance.id === 'ALL' ? 'Выберите подъезд' : 'Этажи не найдены'}
            style={{height: 36, paddingVertical: 5}}
          />
        </View>
        <View style={styles.selectWrapper}>
          <CustomSelect
            list={placementTypes}
            valueKey="placement_type_id"
            labelKey="placement_type_name"
            onChange={(value) => setLocalFilters(prev => ({ ...prev, placement_type_id: value }))}
            value={localFilters.placement_type_id}
            placeholder="Тип" alt
            style={{height: 36, paddingVertical: 5}}
          />
        </View>
      </View>
      
      {!!paymentsData?.length && <View style={styles.summaryContainerWrapper}>
        <Text style={styles.summaryTitle}>Итого</Text>
        <View style={styles.summaryContainer}>
          <View style={styles.summaryItem}>
            <Text style={styles.summaryLabel} allowFontScaling={false}>Cумма работ</Text>
            <Text style={styles.summaryValue}>{numberWithCommas(totalColSum)} ₸</Text>
          </View>
          <View style={styles.summaryDivider} />
          <View style={styles.summaryItem}>
            <Text style={styles.summaryLabel} allowFontScaling={false}>Cумма платежей</Text>
            <Text style={styles.summaryValue}>{numberWithCommas(totalPaymentAmount)} ₸</Text>
          </View>
        </View>
         {/* Прогресс-бар оплаты */}
         <View style={styles.progressContainer}>
          {/* <View style={styles.progressHeader}> */}
            {/* <Text style={styles.progressLabel}>Оплачено</Text> */}
            {/* <Text style={styles.progressPercentage}>{paymentPercentage.toFixed(1)}%</Text> */}
          {/* </View> */}
          <View style={styles.progressBarContainer}>
            {paymentPercentage > 0 && (
              <View style={[styles.progressBarFill, { flex: paymentPercentage }]} />
            )}
            {paymentPercentage < 100 && (
              <View style={[styles.progressBarRemaining, { flex: 100 - paymentPercentage }]} />
            )}
          </View>
          {/* <View style={styles.progressFooter}> */}
            {/* <View style={styles.progressLegendItem}>
              <View style={[styles.progressLegendDot, { backgroundColor: '#4CAF50' }]} /> */}
              {/* <Text style={styles.progressLegendText}>Оплачено: {numberWithCommas(totalPaymentAmount)} ₸</Text> */}
            {/* </View> */}
            {/* <View style={styles.progressLegendItem}> */}
              {/* <View style={[styles.progressLegendDot, { backgroundColor: '#E53935' }]} /> */}
              {/* <Text style={styles.progressLegendText}>Остаток: {numberWithCommas(remainingAmount)} ₸</Text> */}
            {/* </View> */}
          {/* </View> */}
        </View>
      </View>
      }
      
      {loading && <CustomLoader />}
      <ScrollView 
        style={styles.scrollContainer} 
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {
          paymentsData?.length 
            ? <View style={styles.accordionContainer}>
            
            {paymentsData?.map((item, i) => {
            return (
              <View key={item.remont_costs_id + '-' + i} style={styles.paymentCard}>
                {/* Заголовок - название работ */}
                <Text style={styles.paymentTitle}>{item.work_set_check_group_name}</Text>
                
                {/* Строка с тегами и статусом */}
                <View style={styles.tagsRow}>
                  <PlacementBadges
                    variant="tag"
                    floor={item.floor}
                    blockName={item.block_name}
                    placementTypeName={item.placement_type_name}
                    iconFill={'#242424'}
                  />
                  <View style={[styles.statusBadge, { backgroundColor: getStatusColour(item.status_code) }]}>
                    <Text style={styles.statusText}>{item.status_name}</Text>
                  </View>
                </View>
                
                {/* Строка контрагента */}
                <View style={styles.contragentRow}>
                  <Icon name="handshake" width={12} height={12} fill={COLORS.primarySecondary} />
                  <Text style={styles.contragentText}>{item.contragent}</Text>
                </View>
                
                {/* Две колонки: Работа и Платёж */}
                <View style={styles.columnsContainer}>
                  {/* Левая колонка - Работа */}
                  <View style={styles.column}>
                    <Text style={styles.columnLabel}>Работа</Text>
                    <View style={styles.columnValue}>
                      <Icon name="money2" width={12} height={12} fill={COLORS.primarySecondary} />
                      <Text style={styles.columnValueText}>{numberWithCommas(item.col_sum)} ₸</Text>
                    </View>
                    <View style={styles.columnValue}>
                      <Icon name="calendar2" width={12} height={12} fill={COLORS.primarySecondary} />
                      <Text style={styles.columnValueText}>{item.date_create}</Text>
                      {!!item.date_create && <Text style={{color: COLORS.gray, fontSize: SIZES.small, marginLeft: 5}}>Создано</Text>}
                    </View>
                  </View>
                  
                  {/* Разделитель */}
                  <View style={styles.columnDivider} />
                  
                  {/* Правая колонка - Платёж */}
                  <View style={styles.column}>
                    <Text style={styles.columnLabel}>Платёж</Text>
                    <View style={styles.columnValue}>
                      <Icon name="money2" width={12} height={12} fill={COLORS.primarySecondary} />
                      <Text style={styles.columnValueText}>{numberWithCommas(item.payment_amount)} ₸</Text>
                    </View>
                    <View style={styles.columnValue}>
                      <Icon name="calendar2" width={12} height={12} fill={COLORS.primarySecondary} />
                      <Text style={styles.columnValueText}>{item.date_payment}</Text>
                    </View>
                  </View>
                </View>
                
                {/* Кнопка скачать */}
                {/* <TouchableOpacity style={styles.downloadButton}>
                  <Text style={styles.downloadText}>Скачать</Text>
                  <Icon name="downloadAlt" width={14} height={14} fill={COLORS.primarySecondary} />
                </TouchableOpacity> */}
              </View>
            );
          })}
        </View>
          : !loading && <NotFound title='Не найдено платежей' />
        }
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  scrollContainer: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 80,
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
    marginTop: 10,
  },
  selectsContainer: {
    flexDirection: 'row',
    gap: 15,
    paddingHorizontal: 20,
    paddingTop: 10,
    paddingBottom: 10,
    backgroundColor: COLORS.white
  },
  selectWrapper: {
    flex: 1,
  },
  summaryItem: {
    paddingVertical: 5,
  },
  summaryLabel: {
    fontSize: SIZES.small,
    fontFamily: FONT.regular,
    color: COLORS.gray,
  },
  summaryValue: {
    fontSize: SIZES.regular,
    fontFamily: FONT.medium,
    color: COLORS.black,
  },
  // Новые стили для карточки платежа (variant2)
  paymentCard: {
    backgroundColor: COLORS.white,
    borderRadius: 12,
    padding: 12,
    marginBottom: 10,
  },
  paymentTitle: {
    fontSize: SIZES.regular,
    fontFamily: FONT.semiBold,
    color: '#242424',
    lineHeight: 18,
    marginBottom: 8,
  },
  tagsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 8,
  },
  statusBadge: {
    borderRadius: 8,
    paddingHorizontal: 8,
    paddingVertical: 5,
  },
  statusText: {
    fontSize: SIZES.regular,
    fontFamily: FONT.medium,
    color: COLORS.white,
  },
  contragentRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginBottom: 8,
  },
  contragentText: {
    fontSize: SIZES.small,
    fontFamily: FONT.regular,
    color: '#242424',
  },
  columnsContainer: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: 16,
  },
  column: {
    flex: 1,
  },
  columnLabel: {
    fontSize: 10,
    fontFamily: FONT.regular,
    color: COLORS.gray,
    marginBottom: 8,
  },
  columnValue: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginBottom: 8,
  },
  columnValueText: {
    fontSize: SIZES.small,
    fontFamily: FONT.regular,
    color: '#242424',
  },
  columnDivider: {
    width: 1,
    backgroundColor: '#D1D1D1',
    borderRadius: 1,
    height: 40,
    marginBottom: 7
  },
  downloadButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: 12,
  },
  downloadText: {
    fontSize: SIZES.small,
    fontFamily: FONT.regular,
    color: COLORS.primarySecondary,
  },
  summaryDivider: {
    width: 1,
    backgroundColor: '#E0E0E0',
    borderRadius: 1,
    height: 18,
  },
  summaryContainerWrapper: {
    paddingHorizontal: 20,
    paddingVertical: 5,
    backgroundColor: COLORS.white,
    borderEndEndRadius: 16,
    borderStartEndRadius: 16,
  },
  summaryTitle: {
    fontSize: SIZES.regular,
    fontFamily: FONT.semiBold,
    color: '#242424',
  },
  summaryContainer: {
    flexDirection: 'row',
    gap: 15,
    paddingVertical: 5,
    alignItems: 'center',
  },
  progressContainer: {
    paddingBottom: 10,
  },
  progressHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  progressLabel: {
    fontSize: SIZES.small,
    fontFamily: FONT.medium,
    color: '#242424',
  },
  progressPercentage: {
    fontSize: SIZES.medium,
    fontFamily: FONT.semiBold,
    color: '#4CAF50',
  },
  progressBarContainer: {
    flexDirection: 'row',
    height: 4,
    gap: 4,
  },
  progressBarFill: {
    height: '100%',
    backgroundColor: '#64CA31',
    borderRadius: 2,
  },
  progressBarRemaining: {
    height: '100%',
    backgroundColor: '#F63942',
    borderRadius: 2,
  },
  progressFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 8,
  },
  progressLegendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  progressLegendDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  progressLegendText: {
    fontSize: 11,
    fontFamily: FONT.regular,
    color: COLORS.gray,
  },
});