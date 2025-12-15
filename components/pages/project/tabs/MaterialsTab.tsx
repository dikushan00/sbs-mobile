import React, { useMemo, useEffect, useRef, useState } from 'react';
import { Animated, Easing, View, Text, StyleSheet, ScrollView, TouchableOpacity, TextInput } from 'react-native';
import { useDispatch } from 'react-redux';
import { COLORS, FONT, SIZES } from '@/constants';
import { getEntranceMaterialRequests } from '@/components/main/services';
import { ProjectFiltersType, MaterialRequestType, ProviderRequestStatusCodeType, SelectedDataType, NewMaterialRequestData, ProjectEntranceAllInfoType } from '@/components/main/types';
import { CustomLoader } from '@/components/common/CustomLoader';
import { ValueDisplay } from '@/components/common/ValueDisplay';
import { CustomButton } from '@/components/common/CustomButton';
import { MaterialOrderForm } from './MaterialOrderForm';
import { MaterialOrderSuccess } from './MaterialOrderSuccess';
import { AIChatOrderScreen } from './AIChatOrderScreen';
import { numberWithCommas } from '@/utils';
import { Icon } from '@/components/Icon';
import { setPageSettings, showBottomDrawer } from '@/services/redux/reducers/app';
import { BOTTOM_DRAWER_KEYS } from '@/components/BottomDrawer/constants';
import { NotFound } from '@/components/common/NotFound';
import { setPageHeaderData } from '@/services/redux/reducers/userApp';
import { EntranceSelector } from '@/components/common/EntranceSelector';

interface MaterialsTabProps {
  filters: ProjectFiltersType;
  onBack: () => void;
  selectedData: SelectedDataType
}

export const MaterialsTab: React.FC<MaterialsTabProps> = ({ filters, onBack, selectedData }) => {
  const dispatch = useDispatch();
  const [materialsData, setMaterialsData] = useState<MaterialRequestType[] | null>(null);
  const [loading, setLoading] = useState(false);
  const [expandedItems, setExpandedItems] = useState<Set<number>>(new Set());
  const [showOrderForm, setShowOrderForm] = useState(false);
  const [showSuccessPage, setShowSuccessPage] = useState(false);
  const [showAIChat, setShowAIChat] = useState(false);
  const [orderData, setOrderData] = useState<NewMaterialRequestData | null>(null);
  const [projectEntranceId, setProjectEntranceId] = useState<number | null>(null);

  const aiBgAnim = useRef(new Animated.Value(0)).current;
  const AnimatedTouchableOpacity = useMemo(
    () => Animated.createAnimatedComponent(TouchableOpacity),
    []
  );

  useEffect(() => {
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(aiBgAnim, {
          toValue: 1,
          duration: 5000,
          easing: Easing.inOut(Easing.quad),
          useNativeDriver: false, // backgroundColor не поддерживает native driver
        }),
        Animated.timing(aiBgAnim, {
          toValue: 0,
          duration: 5000,
          easing: Easing.inOut(Easing.quad),
          useNativeDriver: false,
        }),
      ])
    );
    loop.start();
    return () => loop.stop();
  }, [aiBgAnim]);

  const aiBgColor = aiBgAnim.interpolate({
    inputRange: [0, 0.5, 1],
    outputRange: [COLORS.primaryLight, COLORS.primary, COLORS.primaryLight],
  });

  useEffect(() => {
    const fetchMaterials = async () => {
      setLoading(true);
      const data = await getEntranceMaterialRequests({...filters, project_entrance_id: projectEntranceId});
      setLoading(false);
      if (data) {
        setMaterialsData(data);
      }
    };
    if(!!projectEntranceId)
      fetchMaterials();
  }, [filters, projectEntranceId]);
  
  useEffect(() => {
    if(!showOrderForm && !showSuccessPage && !showAIChat) {
      dispatch(setPageSettings({ 
          backBtn: true, 
          goBack: onBack
        }));
      dispatch(setPageHeaderData({
        title: 'Материалы',
        desc: '',
      }));
    }
  }, [onBack, showOrderForm, showSuccessPage, showAIChat])

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
    setShowSuccessPage(false);
    setShowAIChat(false);
    setOrderData(null);
  };

  const handleOpenAIChat = () => {
    setShowAIChat(true);
  };

  const handleSubmitOrder = (res: MaterialRequestType[]) => {
    if(!res) return
    setMaterialsData(res)
  };

  const handleOrderSuccess = (orderData: NewMaterialRequestData) => {
    setOrderData(orderData);
    setShowOrderForm(false);
    setShowSuccessPage(true);
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
        params: {...filters, project_entrance_id: projectEntranceId},
        provider_request_item_id: material.provider_request_item_id
      }
    }))
  };

  // if (showAIChat) {
  //   return (
  //     <AIChatOrderScreen
  //       onBack={handleBackToMaterials}
  //       projectId={selectedData?.project_id}
  //     />
  //   );
  // }

  if (showOrderForm) {
    return (
      <MaterialOrderForm
        onBack={handleBackToMaterials}
        onSubmit={handleSubmitOrder}
        onSuccess={handleOrderSuccess}
        filters={{...filters, project_entrance_id: projectEntranceId}} selectedData={selectedData}
      />
    );
  }

  if (showSuccessPage && orderData) {
    return (
      <MaterialOrderSuccess
        onBack={handleBackToMaterials}
        orderData={orderData}
      />
    );
  }

  const calculateTotalSum = () => {
    return materialsData?.reduce((sum, item) => sum + item.material_sum, 0) || 0;
  };

  return (
    <View style={styles.container}>
      <EntranceSelector
        selectedEntranceId={projectEntranceId}
        onSelectEntrance={setProjectEntranceId}
        selectedData={selectedData}
        defaultEntranceId={projectEntranceId}
      />
      {
        loading 
          ? <View style={styles.loadingContainer}>
            <CustomLoader />
            <View style={{
              justifyContent: 'center',
              alignItems: 'center',
            }}>
              <Text style={styles.loadingText}>Загрузка материалов...</Text>
            </View>
          </View>
          : materialsData 
            ? <>
              {!!materialsData?.length && <View style={styles.summaryContainer}>
        <View style={styles.summaryItem}>
          <Text style={styles.summaryLabel}>Общая сумма</Text>
          <Text style={styles.summaryValue}>{numberWithCommas(calculateTotalSum())} ₸</Text>
        </View>
      </View>}
      <ScrollView 
        style={styles.scrollContainer} 
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {
          materialsData?.length
            ? <View style={styles.accordionContainer}>
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
            : !loading && <NotFound title='Данные не найдены' />
        }
      </ScrollView>
      {/* <AnimatedTouchableOpacity
        style={[styles.aiFloatingButton, { backgroundColor: aiBgColor }]}
        onPress={handleOpenAIChat}
      >
        <Icon name="aiAssistant" width={28} height={28} fill={COLORS.lightWhite} />
      </AnimatedTouchableOpacity> */}
      <View style={styles.fixedButtonContainer}>
        <CustomButton
          title="Заказать материал"
          type='contained'
          onClick={handleOrderMaterial}
          stylesProps={styles.orderButton}
          wrapperStyles={{height: 46}}
        />
      </View>
            </>
            : <View style={styles.errorContainer}>
            <Text style={styles.errorText}>Не удалось загрузить данные о материалах</Text>
          </View>
      }
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
    paddingBottom: 60, // Отступ снизу для кнопки
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
    marginTop: 10,
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
  aiFloatingButton: {
    position: 'absolute',
    bottom: 82,
    right: 20,
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 4.65,
    elevation: 8,
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
    paddingVertical: 7,
    backgroundColor: COLORS.white,
    borderTopWidth: 1,
    borderTopColor: COLORS.grayLight,
  },
  summaryItem: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 5,
    backgroundColor: COLORS.background,
    borderRadius: 8,
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
});