import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { useDispatch } from 'react-redux';
import { COLORS, FONT, SIZES } from '@/constants';
import { getEntranceDocuments, getEntranceDocumentFloors, getEntranceDocumentTypes, getPlacementTypes, getResidentialEntrances, getEntrancePayments } from '@/components/main/services';
import { DocumentTypeType, PlacementType, ProjectEntranceAllInfoType, ProjectFiltersType, ProjectMainDocumentType, ProjectPaymentType, SimpleFloorType } from '@/components/main/types';
import { CustomLoader } from '@/components/common/CustomLoader';
import { ValueDisplay } from '@/components/common/ValueDisplay';
import { Icon } from '@/components/Icon';
import { showBottomDrawer } from '@/services/redux/reducers/app';
import { BOTTOM_DRAWER_KEYS } from '@/components/BottomDrawer/services';
import { CustomSelect } from '@/components/common/CustomSelect';
import { numberWithCommas } from '@/utils';

interface PaymentsTabProps {
  filters: ProjectFiltersType;
  onBack: () => void;
  project_id: number | null;
}

export const PaymentsTab: React.FC<PaymentsTabProps> = ({ filters, onBack, project_id }) => {
  const dispatch = useDispatch();
  const [paymentsData, setPaymentsData] = useState<ProjectPaymentType[] | null>(null);
  const [loading, setLoading] = useState(true);
  const [expandedItems, setExpandedItems] = useState<Set<number>>(new Set());
  const [placementTypes, setPlacementTypes] = useState<PlacementType[]>([]);
  const [entrances, setEntrances] = useState<ProjectEntranceAllInfoType[]>([]);
  const [floors, setFloors] = useState<SimpleFloorType[]>([]);
  const [localFilters, setLocalFilters] = useState({
    placement_type_id: null as number | null,
    floor: null as number | null,
    project_entrance_id: 'ALL' as number | 'ALL',
  });

  useEffect(() => {
    const fetchInitialData = async () => {
      const [entrancesData, placementTypesData, floorsData] = await Promise.all([
        getResidentialEntrances(filters),
        getPlacementTypes(),
        getEntranceDocumentFloors(filters),
      ]);
      if (entrancesData) {
        setEntrances([{project_entrance_id: 'ALL', entrance_name: 'Все'}, ...entrancesData]);
      }
      setPlacementTypes(placementTypesData || []);
      setFloors(floorsData || []);
    };
    fetchInitialData();
  }, []);

  useEffect(() => {
    const fetchPayments = async () => {
      const params = {...localFilters, project_entrance_id: localFilters.project_entrance_id === 'ALL' ? '' : localFilters.project_entrance_id};
      setLoading(true);
      const payments = await getEntrancePayments({...filters, ...params, project_id});
      setLoading(false);
      setPaymentsData(payments || []);
    };
    fetchPayments();
  }, [localFilters, filters]);

  const getStatusColour = (status_code: string) => {
    switch (status_code) {
      case 'PAYED':
        return '#35E744';
      case 'AWAITING_PAYMENT':
        return '#F6BA30';
      case 'CANCEL':
        return COLORS.red;
      default:
        return COLORS.primary;
    }
  }

  const toggleExpanded = (itemId: number) => {
    const newExpanded = new Set(expandedItems);
    if (newExpanded.has(itemId)) {
      newExpanded.delete(itemId);
    } else {
      newExpanded.add(itemId);
    }
    setExpandedItems(newExpanded);
  };

  const handleMoreActions = (payment: ProjectPaymentType) => {
    dispatch(showBottomDrawer({
      type: BOTTOM_DRAWER_KEYS.paymentActions,
      data: {
        payment,
        onSubmit: (res: ProjectPaymentType[]) => {
          if(!res) return
          setPaymentsData(res);
        }
      }
    }))
  };

  const totalColSum = paymentsData?.reduce((sum, item) => sum + item.col_sum, 0) || 0;
  const totalPaymentAmount = paymentsData?.reduce((sum, item) => sum + item.payment_amount, 0) || 0;

  if (!paymentsData && !loading) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorText}>Не удалось загрузить данные</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.selectsContainer}>
        <View style={styles.selectWrapper}>
          <CustomSelect
            list={floors}
            valueKey="floor"
            labelKey="floor_name"
            onChange={(value) => setLocalFilters(prev => ({ ...prev, floor: value }))}
            value={localFilters.floor}
            placeholder="Этаж" alt
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
          />
        </View>
        <View style={styles.selectWrapper}>
          <CustomSelect
            list={entrances}
            valueKey="project_entrance_id"
            labelKey="entrance_name"
            onChange={(value) => setLocalFilters(prev => ({ ...prev, project_entrance_id: value }))}
            value={localFilters.project_entrance_id}
            placeholder="Подъезд" alt
          />
        </View>
      </View>
      
      <View style={styles.summaryContainer}>
        <View style={styles.summaryItem}>
          <Text style={styles.summaryLabel}>Общая сумма работ</Text>
          <Text style={styles.summaryValue}>{numberWithCommas(totalColSum)} ₸</Text>
        </View>
        <View style={styles.summaryItem}>
          <Text style={styles.summaryLabel}>Общая сумма платежей</Text>
          <Text style={styles.summaryValue}>{numberWithCommas(totalPaymentAmount)} ₸</Text>
        </View>
      </View>
      
      <ScrollView 
        style={styles.scrollContainer} 
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {loading && <CustomLoader />}
        <View style={styles.accordionContainer}>
          
            {paymentsData?.map((item, i) => {
            const isExpanded = expandedItems.has(item.remont_costs_id);
            return (
                <View key={item.remont_costs_id + '-' + i} style={styles.materialContainer}>
                  <View style={{flexDirection: 'row', alignItems: 'flex-start', justifyContent: 'space-between', gap: 15}}>
                <Text style={styles.materialName}>{item.work_set_check_group_name}</Text>
                {/* <TouchableOpacity 
                  style={{flexDirection: 'row', alignItems: 'center', justifyContent: 'center', borderRadius: 100, padding: 5, backgroundColor: COLORS.grayLight}}
                  onPress={() => handleMoreActions(item)}
                >
                  <Icon name='more' width={16} height={16} />
                </TouchableOpacity> */}
                </View>
                <View style={{...styles.statusContainer, backgroundColor: getStatusColour(item.status_code)}}>
                  <Text style={{color: COLORS.white}}>{item.status_name}</Text>
                </View>
                <View style={{marginTop: 15}}>
                  <View style={{flexDirection: 'row', gap: 15, alignItems: 'flex-start'}}>
                    <ValueDisplay label='Контрагент' value={item.contragent} />
                    <ValueDisplay label='Тип' value={item.placement_type_name} />
                    {isExpanded ? <View style={{width: 85}}></View> : <TouchableOpacity 
                      style={{flexDirection: 'row', alignItems: 'center', gap: 8, alignSelf: 'flex-end', marginTop: 10}}
                      onPress={() => toggleExpanded(item.remont_costs_id)}
                    >
                      <Text style={{color: COLORS.primaryLight}}>Раскрыть</Text> 
                      <Icon 
                        name={"arrowDownColor"} 
                        width={13} 
                        height={13} 
                        fill={COLORS.primaryLight}
                      />
                    </TouchableOpacity>}
                  </View>
                </View>
                {isExpanded && (
                  <View>
                    <View style={{flexDirection: 'row', alignItems: 'flex-start', marginTop: 15}}>
                      <ValueDisplay label='Сумма работ, ₸' value={`${numberWithCommas(item.col_sum)}`} />
                      <ValueDisplay label='Сумма платежа, ₸' value={`${numberWithCommas(item.payment_amount)}`} />
                      <View style={{width: 85}}></View>
                    </View>
                    <View style={{flexDirection: 'row', alignItems: 'flex-start', marginTop: 15}}>
                      <ValueDisplay label='Этаж' value={`${item.floor}`} />
                      <ValueDisplay label='Дата платежа' value={`${item.date_payment}`} />
                      <View style={{width: 85}}></View>
                    </View>
                    <View style={{flexDirection: 'row', alignItems: 'flex-end', marginTop: 15}}>
                      <ValueDisplay label='Блок' value={`№${item.block_name}`} />
                      <ValueDisplay label='Дата cоздания' value={`${item.date_create}`} />
                        <TouchableOpacity 
                          style={{flexDirection: 'row', alignItems: 'center', gap: 8}}
                          onPress={() => toggleExpanded(item.remont_costs_id)}
                        >
                          <Text style={{color: COLORS.primaryLight}}>Закрыть</Text> 
                          <Icon 
                            name={"arrowDownColor"} 
                            width={13} 
                            height={13} 
                            fill={COLORS.primaryLight}
                            style={{ transform: [{ rotate: '180deg' }] }}
                          />
                        </TouchableOpacity>
                    </View>
                  </View>
                )}
              </View>
            );
          })}
        </View>
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
    marginTop: 20,
  },
  statusContainer: {
    padding: 10,
    paddingVertical: 5,
    borderRadius: 6,
    backgroundColor: COLORS.primary,
    alignSelf: 'flex-start',
    marginTop: 15
  },
  materialContainer: {
    padding: 15,
    borderRadius: 10,
    backgroundColor: COLORS.white,
    marginBottom: 10,
  },
  materialName: {
    flex: 1,
    fontSize: SIZES.regular,
    fontFamily: FONT.regular,
    color: COLORS.black,
    lineHeight: 20,
    flexWrap: 'wrap',
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
  summaryContainer: {
    flexDirection: 'row',
    gap: 15,
    paddingHorizontal: 20,
    paddingVertical: 15,
    backgroundColor: COLORS.white,
    borderTopWidth: 1,
    borderTopColor: COLORS.grayLight,
  },
  summaryItem: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 10,
    backgroundColor: COLORS.background,
    borderRadius: 8,
  },
  summaryLabel: {
    fontSize: SIZES.small,
    fontFamily: FONT.regular,
    color: COLORS.gray,
    marginBottom: 5,
  },
  summaryValue: {
    fontSize: SIZES.medium,
    fontFamily: FONT.medium,
    color: COLORS.black,
  },
});