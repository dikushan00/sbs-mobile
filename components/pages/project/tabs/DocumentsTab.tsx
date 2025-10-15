import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, TextInput } from 'react-native';
import { useDispatch } from 'react-redux';
import { COLORS, FONT, SIZES } from '@/constants';
import { getEntranceDocuments, getEntranceMaterialRequests, getEntranceDocumentFloors, getEntranceDocumentTypes } from '@/components/main/services';
import { ProjectFiltersType, MaterialRequestType, ProviderRequestStatusCodeType, ProjectMainDocumentType, SimpleFloorType } from '@/components/main/types';
import { CustomLoader } from '@/components/common/CustomLoader';
import { ValueDisplay } from '@/components/common/ValueDisplay';
import { CustomButton } from '@/components/common/CustomButton';
import { MaterialOrderForm } from './MaterialOrderForm';
import { numberWithCommas } from '@/utils';
import { Icon } from '@/components/Icon';
import { setPageSettings, showBottomDrawer } from '@/services/redux/reducers/app';
import { BOTTOM_DRAWER_KEYS } from '@/components/BottomDrawer/services';
import { FlatSelect } from '@/components/common/FlatSelect';
import { WorkSetSelect } from '@/components/common/WorkSetSelect';
import { CustomSelect } from '@/components/common/CustomSelect';

interface DocumentsTabProps {
  filters: ProjectFiltersType;
  onBack: () => void;
}

export const DocumentsTab: React.FC<DocumentsTabProps> = ({ filters, onBack }) => {
  const dispatch = useDispatch();
  const [documentsData, setDocumentsData] = useState<ProjectMainDocumentType[] | null>(null);
  const [loading, setLoading] = useState(true);
  const [expandedItems, setExpandedItems] = useState<Set<number>>(new Set());
  const [floorsData, setFloorsData] = useState<SimpleFloorType[]>([]);
  const [documentTypesData, setDocumentTypesData] = useState<any[]>([]);
  const [localFilters, setLocalFilters] = useState({
    floor: null as any,
    floor_map_document_type_id: null as any
  });

  useEffect(() => {
    const fetchInitialData = async () => {
      const [floors, documentTypes] = await Promise.all([
        getEntranceDocumentFloors(filters),
        getEntranceDocumentTypes()
      ]);
      if (floors) {
        setFloorsData(floors);
      }
      if (documentTypes) {
        setDocumentTypesData(documentTypes);
      }
    };
    fetchInitialData();
  }, []);

  useEffect(() => {
    const fetchDocuments = async () => {
      setLoading(true);
      const documents = await getEntranceDocuments({...filters, ...localFilters});
      setLoading(false);
      if (documents) {
        setDocumentsData(documents);
      }
    };
    fetchDocuments();
  }, [localFilters, filters]);

  const getStatusColour = (isSigned: boolean) => {
    if(isSigned) {
      return COLORS.green;
    } else {
      return '#F6BA30';
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
  
  const handleSubmitOrder = (res: any[]) => {
    if(!res) return
    setDocumentsData(res)
  };

  const handleMoreActions = (document: ProjectMainDocumentType) => {
    dispatch(showBottomDrawer({
      type: BOTTOM_DRAWER_KEYS.documentActions,
      data: {
        document,
        onSubmit: (res: any[]) => {
          if(!res) return
          setDocumentsData(res);
        },
        params: filters,
        floor_map_document_id: document.floor_map_document_id
      }
    }))
  };

  if (!documentsData && !loading) {
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
            list={floorsData}
            valueKey="floor"
            labelKey="floor_name"
            onChange={(value) => setLocalFilters(prev => ({ ...prev, floor: value }))}
            value={localFilters.floor}
            placeholder="Этаж" alt
          />
        </View>
        <View style={styles.selectWrapper}>
          <CustomSelect
            list={documentTypesData}
            valueKey="floor_map_document_type_id"
            labelKey="floor_map_document_type_name"
            onChange={(value) => setLocalFilters(prev => ({ ...prev, floor_map_document_type_id: value }))}
            value={localFilters.floor_map_document_type_id}
            placeholder="Тип документа" alt
          />
        </View>
      </View>
      <ScrollView 
        style={styles.scrollContainer} 
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {loading && <CustomLoader />}
        <View style={styles.accordionContainer}>
            {documentsData?.map((item) => {
            const isExpanded = expandedItems.has(item.floor_map_document_id);
            return (
              <View key={item.floor_map_document_id} style={styles.materialContainer}>
                <View style={{flexDirection: 'row', alignItems: 'flex-start', justifyContent: 'space-between', gap: 15}}>
                  <Text style={styles.materialName}>{item.floor_map_document_type_name}</Text>
                  <TouchableOpacity 
                    style={{flexDirection: 'row', alignItems: 'center', justifyContent: 'center', borderRadius: 100, padding: 5, backgroundColor: COLORS.grayLight}}
                    onPress={() => handleMoreActions(item)}
                  >
                    <Icon name='more' width={16} height={16} />
                  </TouchableOpacity>
                </View>
                <View style={{...styles.statusContainer, backgroundColor: getStatusColour(item.is_signed)}}>
                  <Text style={{color: COLORS.white}}>{item.is_signed ? 'Подписано' : 'На подписании'}</Text>
                </View>
                <View style={{marginTop: 15}}>
                  <View style={{flexDirection: 'row', gap: 15, alignItems: 'flex-start'}}>
                    <ValueDisplay label='Группа работ' value={item.work_set_check_group_name} />
                    <ValueDisplay label='Тип' value={item.placement_type_name} />
                    {isExpanded ? <View style={{width: 85}}></View> : <View style={{width: 85}}></View>}
                  </View>
                  {!isExpanded && (
                    <TouchableOpacity 
                      style={{flexDirection: 'row', alignItems: 'center', gap: 8, alignSelf: 'flex-end', marginTop: 10}}
                      onPress={() => toggleExpanded(item.floor_map_document_id)}
                    >
                      <Text style={{color: COLORS.primaryLight}}>Раскрыть</Text> 
                      <Icon 
                        name={"arrowDownColor"} 
                        width={13} 
                        height={13} 
                        fill={COLORS.primaryLight}
                      />
                    </TouchableOpacity>
                  )}
                </View>
                {isExpanded && (
                  <View>
                    <View style={{flexDirection: 'row', alignItems: 'flex-start', marginTop: 15}}>
                      <ValueDisplay label='ID' value={item.floor_map_document_id} />
                      <ValueDisplay label='Дата создания' value={item.date_create} />
                      <View style={{width: 85}}></View>
                    </View>
                    <View style={{flexDirection: 'row', alignItems: 'flex-start', marginTop: 15}}>
                      <ValueDisplay label='Блок' value={`${item.block_name}`} />
                      <ValueDisplay label='Этаж' value={`${item.floor}`} />
                      <View style={{width: 85}}></View>
                    </View>
                    <View style={{flexDirection: 'row', alignItems: 'flex-end', marginTop: 15}}>
                      <ValueDisplay label='Дата начала' value={`${item.date_begin}`} />
                      <ValueDisplay label='Дата окончания' value={`${item.date_end}`} />
                        <TouchableOpacity 
                          style={{flexDirection: 'row', alignItems: 'center', gap: 8}}
                          onPress={() => toggleExpanded(item.floor_map_document_id)}
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
});