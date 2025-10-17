import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, TextInput } from 'react-native';
import { useDispatch } from 'react-redux';
import { COLORS, FONT, SIZES } from '@/constants';
import { getEntranceMaterialRequests } from '@/components/main/services';
import { ProjectFiltersType, MaterialRequestType, ProviderRequestStatusCodeType } from '@/components/main/types';
import { CustomLoader } from '@/components/common/CustomLoader';
import { ValueDisplay } from '@/components/common/ValueDisplay';
import { CustomButton } from '@/components/common/CustomButton';
import { MaterialOrderForm } from './MaterialOrderForm';
import { numberWithCommas } from '@/utils';
import { Icon } from '@/components/Icon';
import { setPageSettings, showBottomDrawer } from '@/services/redux/reducers/app';
import { BOTTOM_DRAWER_KEYS } from '@/components/BottomDrawer/services';

interface MaterialsTabProps {
  filters: ProjectFiltersType;
  onBack: () => void;
}

export const MaterialsTab: React.FC<MaterialsTabProps> = ({ filters, onBack }) => {
  const dispatch = useDispatch();
  const [materialsData, setMaterialsData] = useState<MaterialRequestType[] | null>(null);
  const [loading, setLoading] = useState(true);
  const [expandedItems, setExpandedItems] = useState<Set<number>>(new Set());
  const [showOrderForm, setShowOrderForm] = useState(false);

  useEffect(() => {
    const fetchMaterials = async () => {
      setLoading(true);
      const data = await getEntranceMaterialRequests(filters);
      setLoading(false);
      if (data) {
        setMaterialsData(data);
      }
    };
    fetchMaterials();
  }, [filters]);

  useEffect(() => {
    if(!showOrderForm) {
    dispatch(setPageSettings({ 
        backBtn: true, 
        goBack: onBack
      }));
    }
  }, [onBack, showOrderForm])

  const getStatusColour = (statusCode: ProviderRequestStatusCodeType) => {
    switch (statusCode) {
      case 'BRING_TO_CONTRACTOR':
        return '#F6BA30';
      case 'SHIP':
        return '#35E744';
      case 'AVAIL':
        return COLORS.primary;
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

  const handleOrderMaterial = () => {
    setShowOrderForm(true);
  };

  const handleBackToMaterials = () => {
    setShowOrderForm(false);
  };

  const handleSubmitOrder = (res: MaterialRequestType[]) => {
    if(!res) return
    setMaterialsData(res)
  };

  const handleMoreActions = (material: MaterialRequestType) => {
    dispatch(showBottomDrawer({
      type: BOTTOM_DRAWER_KEYS.materialActions,
      data: {
        material,
        onSubmit: (res: MaterialRequestType[]) => {
          if(!res) return
          setMaterialsData(res);
        },
        params: filters,
        provider_request_item_id: material.provider_request_item_id
      }
    }))
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

  if (showOrderForm) {
    return (
      <MaterialOrderForm
        onBack={handleBackToMaterials}
        onSubmit={handleSubmitOrder}
        filters={filters}
      />
    );
  }

  const calculateTotalSum = () => {
    return materialsData?.reduce((sum, item) => sum + item.material_sum, 0) || 0;
  };

  return (
    <View style={styles.container}>
      <View style={styles.summaryContainer}>
        <View style={styles.summaryItem}>
          <Text style={styles.summaryLabel}>Общая сумма</Text>
          <Text style={styles.summaryValue}>{numberWithCommas(calculateTotalSum())} ₸</Text>
        </View>
      </View>
      <ScrollView 
        style={styles.scrollContainer} 
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.accordionContainer}>
          {materialsData?.map((item) => {
            const isExpanded = expandedItems.has(item.provider_request_item_id);
            const showMoreActions = item.provider_request_status_code === 'CREATE' || item.provider_request_status_code === 'BRING_TO_CONTRACTOR';
            return (
              <View key={item.provider_request_item_id} style={styles.materialContainer}>
                <View style={{flexDirection: 'row', alignItems: 'flex-start', justifyContent: 'space-between', gap: 15}}>
                  <Text style={styles.materialName}>{item.material_name}</Text>
                  {showMoreActions && <TouchableOpacity 
                    style={{flexDirection: 'row', alignItems: 'center', justifyContent: 'center', borderRadius: 100, padding: 5, backgroundColor: COLORS.grayLight}}
                    onPress={() => handleMoreActions(item)}
                  >
                    <Icon name='more' width={16} height={16} />
                  </TouchableOpacity>}
                </View>
                <View style={{...styles.statusContainer, backgroundColor: getStatusColour(item.provider_request_status_code)}}>
                  <Text style={{color: COLORS.white}}>{item.provider_request_status_name}</Text>
                </View>
                <View style={{flexDirection: 'row', alignItems: 'flex-end', marginTop: 15}}>
                  <ValueDisplay label='Дата отгрузки' value={item.date_shipping} />
                  <ValueDisplay label='Сумма' value={numberWithCommas(item.material_sum)} />
                  {isExpanded ? <View style={{width: 85}}></View> : <TouchableOpacity 
                    style={{flexDirection: 'row', alignItems: 'center', gap: 8}}
                    onPress={() => toggleExpanded(item.provider_request_item_id)}
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
                {isExpanded && (
                  <View style={styles.expandedContent}>
                    <View style={{flexDirection: 'row', alignItems: 'flex-end', marginTop: 15}}>
                      <ValueDisplay label='Дата заказа' value={item.date_create} />
                      <ValueDisplay label='Цена' value={numberWithCommas(item.price)} />
                      <View style={{width: 85}}></View>
                    </View>
                    <View style={{flexDirection: 'row', alignItems: 'flex-end', marginTop: 15}}>
                      <ValueDisplay label='Мин. кол-во' value={`${item.qty_atom} ${item.atom_unit_name}`} />
                      <ValueDisplay label='Кол-во в ед. продаж' value={`${item.material_cnt} ${item.sell_unit_name}`} />
                        <TouchableOpacity 
                          style={{flexDirection: 'row', alignItems: 'center', gap: 8}}
                          onPress={() => toggleExpanded(item.provider_request_item_id)}
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
      <View style={styles.fixedButtonContainer}>
        <CustomButton
          title="Заказать материал"
          type='contained'
          onClick={handleOrderMaterial}
          stylesProps={styles.orderButton}
          wrapperStyles={{height: 52}}
        />
      </View>
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
    paddingBottom: 80, // Отступ снизу для кнопки
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
  expandedContent: {  },
  fixedButtonContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    paddingHorizontal: 20,
    paddingVertical: 15,
  },
  orderButton: {
    backgroundColor: COLORS.primary,
  },
  materialName: {
    flex: 1,
    fontSize: SIZES.regular,
    fontFamily: FONT.regular,
    color: COLORS.black,
    lineHeight: 20,
    flexWrap: 'wrap',
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