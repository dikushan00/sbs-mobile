import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert, AppState, RefreshControl, Linking, ActivityIndicator } from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import { useFocusEffect } from '@react-navigation/native';
import { COLORS, FONT, mobileSignUrl, mobileSignBusinessUrl, SIZES } from '@/constants';
import { getEntranceDocuments, getEntranceDocumentFloors, getEntranceDocumentTypes, signEntranceDocument, getProjectEntrances } from '@/components/main/services';
import { DocumentTypeType, ProjectEntranceAllInfoType, ProjectFiltersType, ProjectMainDocumentType, SelectedDataType, SimpleFloorType } from '@/components/main/types';
import { CustomLoader } from '@/components/common/CustomLoader';
import { Icon } from '@/components/Icon';
import { closeBottomDrawer, showBottomDrawer } from '@/services/redux/reducers/app';
import { BOTTOM_DRAWER_KEYS } from '@/components/BottomDrawer/constants';
import { CustomSelect } from '@/components/common/CustomSelect';
import { NotFound } from '@/components/common/NotFound';
import { userAppState } from '@/services/redux/reducers/userApp';
import * as ExpoLinking from 'expo-linking';
import { EntranceSelector } from '@/components/common/EntranceSelector';
import { downloadAndOpenFile, openLocalFileIfExists } from '@/utils';
import { instance } from '@/services/api';

interface DocumentsTabProps {
  filters: ProjectFiltersType;
  onBack: () => void;
  isSBS: boolean;
  selectedData: SelectedDataType
}

export const DocumentsTab: React.FC<DocumentsTabProps> = ({ filters, onBack, isSBS, selectedData }) => {
  const dispatch = useDispatch();
  const { userData, userType } = useSelector(userAppState);
  const egovSignUrl = userType === 'business' ? mobileSignBusinessUrl : mobileSignUrl;
  const [documentsData, setDocumentsData] = useState<ProjectMainDocumentType[] | null>(null);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState<Record<number, boolean>>({});
  const [floorsData, setFloorsData] = useState<SimpleFloorType[]>([]);
  const [documentTypesData, setDocumentTypesData] = useState<DocumentTypeType[]>([]);
  const [localFilters, setLocalFilters] = useState({
    project_entrance_id: null as string | number | null,
    floor: null as any,
    floor_map_document_type_id: null as any
  });
  const [downloading, setDownloading] = useState(false);

  const fetchInitialData = useCallback(async () => {
    const [entrancesData, documentTypes] = await Promise.all([
      selectedData.project_id ? getProjectEntrances(selectedData.project_id) : null,
      getEntranceDocumentTypes()
    ]);
    if (entrancesData) {
      if(entrancesData?.length) {
        setLocalFilters(prev => ({...prev, project_entrance_id: entrancesData[0].project_entrance_id}))
        const floorsData = await getEntranceDocumentFloors({...filters, project_entrance_id: entrancesData[0].project_entrance_id})
        setFloorsData(floorsData || []);
      }
    }
    if (documentTypes) {
      setDocumentTypesData(documentTypes);
    }
  }, [filters, selectedData.project_id]);

  const fetchDocuments = useCallback(async () => {
    if(!localFilters.project_entrance_id) return;
    setLoading(true);
    const documents = await getEntranceDocuments({...filters, ...localFilters});
    setLoading(false);
    if (documents) {
      setDocumentsData(documents);
    }
  }, [filters, localFilters]);
 
  useEffect(() => {
    fetchInitialData();
  }, [fetchInitialData]);

  useFocusEffect(
    useCallback(() => {
      fetchDocuments();
    }, [fetchDocuments])
  );

  // Обработка deep link вида: sbs://documents?status=success
  useEffect(() => {
    const handleDocumentsDeepLink = (url: string | null) => {
      if (!url) return;

      try {
        const { queryParams } = ExpoLinking.parse(url);

        if (queryParams?.status === 'success') {
          // Показываем модалку/алерт об успешном подписании
          Alert.alert(
            'Документ подписан',
            'Документ успешно подписан.',
            [{ text: 'Ок', style: 'default' }],
          );
        }
      } catch (error) {
        console.error('Error handling documents deep link:', error);
      }
    };

    // Обработка initial URL (если приложение открыто по deeplink)
    const checkInitialUrl = async () => {
      const initialUrl = await ExpoLinking.getInitialURL();
      if (initialUrl) {
        handleDocumentsDeepLink(initialUrl);
      }

    };

    checkInitialUrl();

    // Подписка на события deeplink, когда приложение уже открыто
    const subscription = ExpoLinking.addEventListener('url', (event) => {
      handleDocumentsDeepLink(event.url);
    });

    return () => {
      subscription.remove();
    };
  }, []);

  useEffect(() => {
    const subscription = AppState.addEventListener('change', (state) => {
      if (state === 'active') {
        fetchDocuments();
      }
    });
    return () => {
      subscription.remove();
    };
  }, [fetchDocuments]);

  const getStatusColour = (isSigned: boolean, userSigned?: boolean) => {
    if(isSigned) {
      return COLORS.green;
    } else {
      return userSigned ? 'orange' : '#F6BA30';
    }
  }

  const handleMoreActions = (document: ProjectMainDocumentType) => {
    dispatch(showBottomDrawer({
      type: BOTTOM_DRAWER_KEYS.documentActions,
      data: {
        document,
        onSubmit: (res: any[]) => {
          if(!res) return
          setDocumentsData(res);
        },
        params: {...filters, ...localFilters},
        floor_map_document_id: document.floor_map_document_id
      }
    }))
  };

  const handleEditDates = (document: ProjectMainDocumentType) => {
    dispatch(showBottomDrawer({
      type: BOTTOM_DRAWER_KEYS.documentActions,
      data: {
        document,
        onSubmit: (res: any[]) => {
          if(!res) return
          setDocumentsData(res);
        },
        params: {...filters, ...localFilters},
        floor_map_document_id: document.floor_map_document_id,
        showDateChangeInitially: true
      }
    }))
  };

  const handleSign = (document: ProjectMainDocumentType) => {
    dispatch(showBottomDrawer({
      type: BOTTOM_DRAWER_KEYS.signatoriesList,
      data: {
        document,
        onSign: async () => await confirmSign(document.floor_map_document_id)
      }
    }));
  };

  const confirmSign = async (floor_map_document_id: number) => {
    const apiUrl = encodeURIComponent(`https://devmaster-back.smart-remont.kz/mgovSign/init?doc_id=${floor_map_document_id}&type=document&user=${userData?.employee_id}`)

    const link = `${egovSignUrl}?link=${apiUrl}`
    await Linking.openURL(link);
    return
    if (processing[floor_map_document_id]) return;
    setProcessing(prev => ({...prev, [floor_map_document_id]: true}));

    const body = {
      floor_map_document_id,
    };

    const res = await signEntranceDocument(body, filters);
    setProcessing(prev => ({...prev, [floor_map_document_id]: false}));
    dispatch(closeBottomDrawer())
    if(!res) return;
    try {
      if (res?.redirect_url) {
        const canOpen = await Linking.canOpenURL(res.redirect_url);
        if (canOpen) {
          await Linking.openURL(res.redirect_url);
        }
      }
    } catch (error) {}
  };

  const handleDownload = async (document: ProjectMainDocumentType) => {
    if (downloading) return;
    
    setDownloading(true);
    try {
      const fileName = document.floor_map_document_type_name + '.pdf';

      // Если файл уже скачан — открываем локальный и не делаем повторный запрос
      const openedFromCache = await openLocalFileIfExists(fileName);
      if (openedFromCache) {
        setDownloading(false);
        return;
      }

      const res = await instance().get(document.master_url, { responseType: 'arraybuffer' });
      await downloadAndOpenFile(res, fileName);
    } catch (error) {
      Alert.alert('Ошибка', 'Не удалось скачать документ');
    } finally {
      setDownloading(false);
    }
  };

  if (!documentsData && !loading) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorText}>Не удалось загрузить данные</Text>
      </View>
    );
  }
  
  const onEntranceChange = async (value: string | number | null, row: ProjectEntranceAllInfoType | null) => {
    setLocalFilters(prev => ({ ...prev, project_entrance_id: value, floor: null, floor_map_document_type_id: null }))

    const floorsData = await getEntranceDocumentFloors({...filters, project_entrance_id: value as number})
    setFloorsData(floorsData || []);
  }
  return (
    <View style={styles.container}>
      <EntranceSelector
        selectedEntranceId={localFilters.project_entrance_id ? +localFilters.project_entrance_id : null}
        onSelectEntrance={(value, data) => {
          onEntranceChange(value, data)
        }}
        selectedData={selectedData}
        projectId={selectedData.project_id}
      />
      <View style={styles.selectsContainer}>
        <View style={styles.selectWrapper}>
          <CustomSelect
            list={floorsData}
            valueKey="floor"
            labelKey="floor_name"
            onChange={(value) => setLocalFilters(prev => ({ ...prev, floor: value }))}
            value={localFilters.floor}
            placeholder="Этаж" alt 
            style={{height: 36, paddingVertical: 5}}
            textStyles={{fontSize: 14}}
            showResetBtn
            showSearch={false}
          />
        </View>
        <View style={styles.selectWrapper}>
          <CustomSelect
            list={documentTypesData}
            valueKey="floor_map_document_type_id"
            labelKey="floor_map_document_type_name"
            onChange={(value) => setLocalFilters(prev => ({ ...prev, floor_map_document_type_id: value }))}
            value={localFilters.floor_map_document_type_id}
            placeholder="Тип" alt
            style={{height: 36, paddingVertical: 5}}
            textStyles={{fontSize: 14}}
          />
        </View>
      </View>
      {(loading || downloading) && <CustomLoader />}
      <ScrollView 
        refreshControl={<RefreshControl refreshing={loading} onRefresh={fetchDocuments} />}
        style={styles.scrollContainer} 
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {
          documentsData?.length 
            ? <View style={styles.accordionContainer}>
            {documentsData?.map((item) => {
            const show1cInfo = isSBS && item.is_avr_sent_bi && (item.guid || item.esf_status || item.avr_code || item.error)

            const canSign = !!item?.assign_signs?.find((signatory) => !signatory.is_signed && signatory.can_sign)
            const userSigned = !!item?.assign_signs?.find((signatory) => signatory.is_signed && signatory.can_sign)

            return (
              <View key={item.floor_map_document_id} style={styles.materialContainer}>
                <View style={{flexDirection: 'row', alignItems: 'flex-start', justifyContent: 'space-between', gap: 15}}>
                  <Text style={styles.materialName}>{item.floor_map_document_type_name}</Text>
                  {/* <TouchableOpacity style={{padding: 5, backgroundColor: COLORS.grayLight, borderRadius: 100}} onPress={() => handleMoreActions(item)}>
                    <Icon name='more' width={16} height={16} fill={COLORS.primarySecondary} />
                  </TouchableOpacity> */}
                </View>
                <View style={{flexDirection: 'row', alignItems: 'center', gap: 10, marginTop: 10, flexWrap: 'wrap'}}>
                  <View style={styles.dateStatusRow}>
                    <View style={styles.dateBadge}>
                      <Icon name="plan" width={14} height={14} fill={'#242424'} />
                      <Text style={styles.dateText}>{item.floor}</Text>
                    </View>
                    <View style={styles.dateBadge}>
                      <Icon name="residentCloud" width={14} height={14} fill={'#242424'} />
                      <Text style={styles.dateText}>{item.block_name}</Text>
                    </View>
                    <View style={styles.dateBadge}>
                      <Icon name="apartment" width={14} height={14} />
                      <Text style={styles.dateText}>{item.placement_type_name}</Text>
                    </View>
                  </View>
                  <TouchableOpacity 
                    style={{...styles.statusContainer, backgroundColor: getStatusColour(item.is_signed, userSigned)}}
                    onPress={() => handleSign(item)}
                  >
                    <Text style={{color: COLORS.white, fontSize: 12}}>{item.is_signed ? 'Подписано' : userSigned ? 'Ожидание других подписантов' : 'На подписании'}</Text>
                  </TouchableOpacity>
                </View>
                <View style={{flexDirection: 'row', alignItems: 'center', gap: 5, marginTop: 5, justifyContent: 'space-between'}}>
                  {
                    item.is_avr_sent_bi 
                      ? <View style={styles.sentTo1CContainer}>
                        <Icon name="checkCircle" width={16} height={16} fill={COLORS.green} />
                        <Text style={styles.sentTo1CText}>Отправлено в 1С</Text>
                      </View> 
                      : !!item.is_signed && <View style={styles.notSentContainer}>
                          <Icon name="closeCircle" width={16} height={16} fill={COLORS.gray} />
                          <Text style={styles.notSentText}>Не отправлено в 1С</Text>
                        </View>
                  }
                  {/* {
                    !item.is_signed && !item.is_avr_sent_bi && canSign && 
                    <TouchableOpacity onPress={() => handleSign(item)} disabled={processing[item.floor_map_document_id]} style={{backgroundColor: COLORS.primary, borderRadius: 6, padding: 7, paddingHorizontal: 10}}>
                      <Text style={{color: "#fff"}}>Подписать</Text>
                    </TouchableOpacity>
                  } */}
                  {
                    !item.is_signed && userSigned && 
                    <View style={{paddingVertical: 5, backgroundColor: COLORS.green, borderRadius: 6, paddingHorizontal: 10}}>
                      <Text style={{color: "white"}}>Подписанты</Text>
                    </View>
                  }
                </View>
                
                  <View>
                    <View style={{flexDirection: 'row', alignItems: 'center', gap: 5, marginTop: 10}}>
                      <Icon name="document2" width={16} height={16} />
                      <Text style={styles.documentName}>{item.work_set_check_group_name}</Text>
                    </View>
                    <View style={{flexDirection: 'row', alignItems: 'center', gap: 5, marginTop: 10}}>
                    <View style={{ gap: 10, width: '50%' }}>
                      <View style={{flexDirection: 'row', alignItems: 'center', gap: 5}}>
                        <Text style={styles.documentIdText}>ID</Text>
                        <Text>{item.floor_map_document_id}</Text>
                      </View>
                      <View style={{flexDirection: 'row', alignItems: 'center', gap: 5}}>
                        <Icon name="calendar2" width={16} height={16} fill={COLORS.primarySecondary} />
                        <Text>{item.date_begin}</Text>
                      </View>
                    </View>
                    <View style={{ gap: 10, width: '50%' }}>
                      <View style={{flexDirection: 'row', alignItems: 'center', gap: 5}}>
                        <Icon name="calendarAdd" width={16} height={16} fill={COLORS.primarySecondary} />
                        <Text>{item.date_create}</Text>
                        <Text style={{color: COLORS.gray, fontSize: SIZES.small}}>Создано</Text>
                      </View>
                      <View style={{flexDirection: 'row', alignItems: 'center', gap: 5, justifyContent: 'space-between', paddingRight: 10}}>
                        <View style={{flexDirection: 'row', alignItems: 'center', gap: 5}}>
                          <Icon name="calendar2" width={16} height={16} fill={COLORS.primarySecondary} />
                          <Text>{item.date_end}</Text>
                        </View>
                        <TouchableOpacity style={{padding: 5}} onPress={() => handleEditDates(item)}>
                          <Icon name="editLine" width={16} height={16} fill={COLORS.primarySecondary} />
                        </TouchableOpacity>
                      </View>
                    </View>
                    </View>
                    {show1cInfo && (
                      <View style={styles.sbsInfoContainer}>
                        {item.guid && (
                          <Text style={styles.guidText}>GUID: {item.guid}</Text>
                        )}
                        
                        {item.esf_status && (
                          <Text style={styles.esfStatusText}>Статус ЭСФ: {item.esf_status}</Text>
                        )}
                        
                        {item.avr_code && (
                          <Text style={styles.avrCodeText}>Код АВР в 1C: {item.avr_code}</Text>
                        )}
                        
                        {item.error && (
                          <TouchableOpacity 
                            style={styles.sbsErrorContainer}
                            onPress={() => Alert.alert('Ошибка', item.error || 'Неизвестная ошибка')}
                          >
                            <Text style={styles.sbsErrorText}>Ошибка</Text>
                            <Icon name="info" width={16} height={16} fill={COLORS.red} />
                          </TouchableOpacity>
                        )}
                      </View>
                    )}
                  </View>

                  <TouchableOpacity 
                    style={{paddingTop: 12, paddingBottom: 3, flexDirection: 'row', alignItems: 'center', gap: 5}}
                    onPress={() => handleDownload(item)}
                    disabled={downloading}
                  >
                    <Text style={{color: COLORS.primarySecondary}}>Скачать</Text>
                    <Icon name="downloadAlt" width={16} height={16} fill={COLORS.primarySecondary} />
                  </TouchableOpacity>
              </View>
            );
          })}
        </View>
            : !loading && <NotFound title='Не найдено документов' />
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
  statusContainer: {
    padding: 7,
    paddingVertical: 5,
    borderRadius: 6,
    backgroundColor: COLORS.primary,
    alignSelf: 'flex-start',
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
    backgroundColor: COLORS.white,
    borderEndEndRadius: 16,
    borderStartEndRadius: 16,
  },
  selectWrapper: {
    flex: 1,
  },
  // Стили для информации о 1С
  sbsInfoContainer: {
    backgroundColor: '#F8F9FA',
    borderRadius: 6,
    padding: 12,
    marginTop: 15,
    gap: 8,
  },
  sentTo1CContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  sentTo1CText: {
    fontSize: SIZES.regular,
    fontFamily: FONT.medium,
    color: COLORS.green,
  },
  sendTo1CContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  sendTo1CText: {
    fontSize: SIZES.regular,
    fontFamily: FONT.medium,
    color: COLORS.primary,
  },
  notSentContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  notSentText: {
    fontSize: SIZES.regular,
    fontFamily: FONT.medium,
    color: COLORS.gray,
  },
  guidText: {
    fontSize: SIZES.small,
    fontFamily: FONT.regular,
    color: COLORS.gray,
  },
  esfStatusText: {
    fontSize: SIZES.small,
    fontFamily: FONT.regular,
    color: COLORS.gray,
  },
  avrCodeText: {
    fontSize: SIZES.small,
    fontFamily: FONT.regular,
    color: COLORS.gray,
  },
  sbsErrorContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    alignSelf: 'flex-start',
  },
  sbsErrorText: {
    fontSize: SIZES.small,
    fontFamily: FONT.medium,
    color: COLORS.red,
  },
  dateStatusRow: {
    flexDirection: 'row',
    alignItems: 'center',
    // flexWrap: 'wrap',
    gap: 10,
    backgroundColor: '#F0F0F0',
    borderRadius: 6,
    paddingHorizontal: 7,
    paddingVertical: 5,
    alignSelf: 'flex-start',
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
  documentName: {
    flex: 1,
    flexShrink: 1,
  },
  documentIdText: {
    fontSize: SIZES.regular,
    color: COLORS.primarySecondary,
  },
});