import React, { useMemo, useEffect, useRef, useState, useCallback } from 'react';
import { Animated, Easing, View, Text, StyleSheet, ScrollView, TouchableOpacity, TextInput, RefreshControl, Dimensions } from 'react-native';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
import { useDispatch } from 'react-redux';
import { COLORS, FONT, SIZES } from '@/constants';
import { deleteEntranceMaterialRequest, getEntranceMaterialRequests } from '@/components/main/services';
import { ProjectFiltersType, MaterialRequestType, ProviderRequestStatusCodeType, SelectedDataType, NewMaterialRequestData, ProjectEntranceAllInfoType } from '@/components/main/types';
import { CustomLoader } from '@/components/common/CustomLoader';
import { ValueDisplay } from '@/components/common/ValueDisplay';
import { CustomButton } from '@/components/common/CustomButton';
import { MaterialOrderForm } from './MaterialOrderForm';
import { MaterialOrderSuccess } from './MaterialOrderSuccess';
import { AIChatOrderScreen } from './AIChatOrderScreen';
import { numberWithCommas } from '@/utils';
import { Icon } from '@/components/Icon';
import { closeBottomDrawer, setPageSettings, showBottomDrawer } from '@/services/redux/reducers/app';
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
  const [refreshing, setRefreshing] = useState(false);
  const [showOrderForm, setShowOrderForm] = useState(false);
  const [showSuccessPage, setShowSuccessPage] = useState(false);
  const [showAIChat, setShowAIChat] = useState(false);
  const [deleting, setDeleting] = useState(false)
  const [orderData, setOrderData] = useState<NewMaterialRequestData | null>(null);
  const [projectEntranceId, setProjectEntranceId] = useState<number | null>(null);

  const aiBgAnim = useRef(new Animated.Value(0)).current;
  const aiChatAnim = useRef(new Animated.Value(0)).current; // 0 = hidden, 1 = visible
  const [aiChatVisible, setAiChatVisible] = useState(false);
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

  const aiBgColor = useMemo(() => aiBgAnim.interpolate({
    inputRange: [0, 0.5, 1],
    outputRange: [COLORS.primaryLight, COLORS.primary, COLORS.primaryLight],
  }), [aiBgAnim]);

  const fetchMaterials = useCallback(async () => {
    if (!projectEntranceId) return;
    setLoading(true);
    const data = await getEntranceMaterialRequests({...filters, project_entrance_id: projectEntranceId});
    setLoading(false);
    if (data) {
      setMaterialsData(data);
    }
  }, [filters, projectEntranceId]);

  const onRefresh = useCallback(async () => {
    if (!projectEntranceId) return;
    setRefreshing(true);
    const data = await getEntranceMaterialRequests({...filters, project_entrance_id: projectEntranceId});
    setRefreshing(false);
    if (data) {
      setMaterialsData(data);
    }
  }, [filters, projectEntranceId]);

  useEffect(() => {
    if(!!projectEntranceId)
      fetchMaterials();
  }, [filters, projectEntranceId, fetchMaterials]);
  
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

  const handleOrderMaterial = () => {
    setShowOrderForm(true);
  };

  const handleBackToMaterials = () => {
    const wasAIChat = showAIChat;
    
    // If closing AI Chat, animate out first
    if (wasAIChat) {
      Animated.timing(aiChatAnim, {
        toValue: 0,
        duration: 250,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true,
      }).start(() => {
        setAiChatVisible(false);
        setShowAIChat(false);
        fetchMaterials();
      });
      return;
    }
    
    setShowOrderForm(false);
    setShowSuccessPage(false);
    setShowAIChat(false);
    setOrderData(null);
  };

  const handleOpenAIChat = () => {
    setShowAIChat(true);
    setAiChatVisible(true);
    aiChatAnim.setValue(0);
    Animated.timing(aiChatAnim, {
      toValue: 1,
      duration: 300,
      easing: Easing.out(Easing.cubic),
      useNativeDriver: true,
    }).start();
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

  const confirmDelete = async (provider_request_item_id: number) => {
    if(deleting) return
    setDeleting(true)
    const res = await deleteEntranceMaterialRequest({...filters, project_entrance_id: projectEntranceId}, provider_request_item_id)
    setDeleting(false)
    if(!res) return
    setMaterialsData(res)
    dispatch(closeBottomDrawer())
  };

  const handleDelete = (material: MaterialRequestType) => {
    dispatch(showBottomDrawer({
      type: BOTTOM_DRAWER_KEYS.confirm,
      data: {
        title: 'Вы точно хотите удалить?',
        submitBtnText: 'Удалить',
        cancelMode: true,
        onSubmit: async() => {
          await confirmDelete(material.provider_request_item_id)
        },
      }
    }))
  };

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
        projectId={selectedData.project_id}
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
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={[COLORS.primary]}
            tintColor={COLORS.primary}
          />
        }
      >
        {
          materialsData?.length
            ? <View style={styles.accordionContainer}>
              {materialsData?.map((item) => {
                const showMoreActions = item.provider_request_status_code === 'CREATE' || item.provider_request_status_code === 'BRING_TO_CONTRACTOR';
                return (
                  <View key={item.provider_request_item_id} style={styles.materialContainer}>
                    <View style={{ flexDirection: 'row', gap: 10 }}>
                    <View style={{ flex: 1 }}>
                      <View style={{flexDirection: 'row', alignItems: 'flex-start', justifyContent: 'space-between', gap: 15}}>
                        <Text style={styles.materialName}>{item.material_name}</Text>
                      </View>
                      <View style={styles.dateStatusWrapper}>
                        <View style={styles.dateStatusRow}>
                          <View style={styles.dateBadge}>
                            <Icon name="docSign" width={14} height={14} fill={'#242424'} />
                            <Text style={styles.dateText}>{item.date_create}</Text>
                          </View>
                          <View style={styles.dateBadge}>
                            <Icon name="shipping" width={14} height={14} fill={'#242424'} />
                            <Text style={styles.dateText}>{item.date_shipping}</Text>
                          </View>
                        </View>
                        <View style={{...styles.statusContainer, backgroundColor: getStatusColour(item.provider_request_status_code)}}>
                          <Text style={{color: COLORS.white, fontSize: 12, fontFamily: FONT.medium}}>{item.provider_request_status_name}</Text>
                        </View>
                      </View>

                      <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 15, marginTop: 15, }}>
                        <View style={{ gap: 4 }}>
                          <View style={styles.detailItem}><Text style={styles.detailLabel}>Сумма</Text><Text>{numberWithCommas(item.material_sum)} ₸</Text></View>
                          <View style={styles.detailItem}><Text style={styles.detailLabel}>Цена</Text><Text>{numberWithCommas(item.price)} ₸</Text></View>
                        </View>
                        <View style={{ gap: 4, borderLeftWidth: 1, borderLeftColor: COLORS.stroke, paddingLeft: 15 }}>
                        <View style={styles.detailItem}><Text style={styles.detailLabel}>Кол-во (ед.)</Text><Text>{item.material_cnt} {item.sell_unit_name}</Text></View>
                          <View style={styles.detailItem}><Text style={styles.detailLabel}>Кол-во (мин.)</Text><Text>{item.qty_atom} {item.atom_unit_name}</Text></View>
                        </View>
                        </View>
                      </View>
                      {
                        showMoreActions && <TouchableOpacity 
                          style={{flexDirection: 'row', alignItems: 'center', justifyContent: 'center', borderRadius: 100, padding: 7}}
                          onPress={() => handleDelete(item)}
                        >
                          <Icon name='trashOutline' width={16} height={16} fill={COLORS.redLight} />
                        </TouchableOpacity>
                      }
                    </View>
                  </View>
                );
              })}
            </View>
            : !loading && <NotFound title='Данные не найдены' />
        }
      </ScrollView>
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

      {/* <View 
        style={[
          styles.aiFloatingButtonWrapper,
          { opacity: materialsData && !loading ? 1 : 0 }
        ]}
        pointerEvents={materialsData && !loading ? 'auto' : 'none'}
      >
        <AnimatedTouchableOpacity
          style={[styles.aiFloatingButton, { backgroundColor: aiBgColor }]}
          onPress={handleOpenAIChat}
        >
          <Icon name="aiAssistant" width={28} height={28} fill={COLORS.lightWhite} />
        </AnimatedTouchableOpacity>
      </View> */}

      {/* Animated AI Chat Overlay */}
      {aiChatVisible && (
        <Animated.View 
          style={[
            styles.aiChatOverlay,
            {
              opacity: aiChatAnim,
              transform: [
                {
                  translateX: aiChatAnim.interpolate({
                    inputRange: [0, 1],
                    outputRange: [SCREEN_WIDTH, 0],
                  }),
                },
              ],
            },
          ]}
        >
          <AIChatOrderScreen
            onBack={handleBackToMaterials}
            projectId={selectedData?.project_id}
          />
        </Animated.View>
      )}
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
    borderRadius: 8,
    backgroundColor: COLORS.primary,
    alignSelf: 'flex-start',
  },
  materialContainer: {
    padding: 15,
    borderRadius: 10,
    backgroundColor: COLORS.white,
    marginBottom: 10,
  },
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
  aiFloatingButtonWrapper: {
    position: 'absolute',
    bottom: 82,
    right: 20,
  },
  aiFloatingButton: {
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
  aiChatOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: COLORS.background,
    zIndex: 100,
  },
  materialName: {
    flex: 1,
    fontSize: SIZES.regular,
    fontFamily: FONT.medium,
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
  detailItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
  },
  detailLabel: {
    fontSize: SIZES.small,
    fontFamily: FONT.regular,
    color: COLORS.gray,
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
  dateStatusWrapper: {
    flexDirection: 'row', 
    justifyContent: 'flex-start', 
    alignItems: 'center', 
    flexWrap: 'wrap',
    gap: 10,
    marginTop: 15,
  },
  dateStatusRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: 10,
    backgroundColor: '#F0F0F0',
    borderRadius: 8,
    paddingHorizontal: 7,
    paddingVertical: 5,
  },
  dateBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  dateText: {
    fontSize: 12,
    fontFamily: FONT.medium,
    color: '#242424',
  },
});