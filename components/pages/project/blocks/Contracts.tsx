import React, { useCallback, useEffect, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, RefreshControl, Alert, Platform, Linking } from 'react-native';
import { COLORS, FONT, SIZES } from '@/constants';
import { ProjectDocumentType, ProjectFiltersType } from '@/components/main/types';
import { getDocuments, sendAgreementTo1C, signDocument } from '@/components/main/services';
import { Block, BlockContainer } from './Block';
import { Icon } from '@/components/Icon';
import { CustomLoader } from '@/components/common/CustomLoader';
import { residentialSettingsAPI } from '@/components/main/services/api';
import { downloadFile } from '@/utils';
import { useSnackbar } from '@/components/snackbar/SnackbarContext';

export const Contracts = ({project_id, isSBS}: {project_id: number | null, isSBS: boolean }) => {
  const {showSuccessSnackbar} = useSnackbar()
  const [agreements, setAgreements] = useState<ProjectDocumentType[]>([]);
  const [isFetching, setIsFetching] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [downloading, setDownloading] = useState(false);
  const [sending, setSending] = useState(false);
  const [signing, setSigning] = useState(false);

  const getData = useCallback((refresh: boolean = false) => {
    if(project_id) {
      refresh ? setIsRefreshing(true) : setIsFetching(true);
      getDocuments(project_id).then(res => setAgreements(res || [])).finally(() => refresh ? setIsRefreshing(false) : setIsFetching(false));
    }
    return () => {
      setIsFetching(false);
      setIsRefreshing(false);
    }
  }, [project_id]);

  const downloadPDF = useCallback(async (agreement: ProjectDocumentType) => {
    if(downloading) return
    setDownloading(true)
    try {
      const response = await residentialSettingsAPI.downloadDocumentPDF({
        project_agreement_id: agreement.project_agreement_id
      });
      const fileName = `${agreement.doc_name?.replaceAll('/', '_')}.pdf`;
      await downloadFile(response, fileName)
    } catch (error) {
    }
    setDownloading(false)
  }, []);

  const sendTo1C = useCallback(async () => {
    if(sending || !project_id) return
    
    Alert.alert(
      "Отправка в 1С",
      "Вы действительно хотите отправить документ в 1С?",
      [
        {
          text: "Отмена",
          style: "cancel",
        },
        {
          text: "Отправить",
          style: "default",
          onPress: async () => {
            setSending(true)
            const res = await sendAgreementTo1C(project_id)
            setSending(false)
            if(!res) return getData()
            setAgreements(res || [])
            showSuccessSnackbar('Документ успешно отправлен в 1С')
          },
        },
      ]
    );
  }, [sending, project_id, getData]);

  const handleSignDocument = useCallback(async () => {
    if(signing || !agreements.length) return
    
    Alert.alert(
      "Подписание документа",
      "Вы действительно хотите подписать документ?",
      [
        {
          text: "Отмена",
          style: "cancel",
        },
        {
          text: "Подписать",
          style: "default",
          onPress: async () => {
            setSigning(true)
            try {
              const agreement = agreements[0];
              const res = await signDocument({
                project_agreement_id: agreement.project_agreement_id
              });
              
              if (res?.redirect_url) {
                const canOpen = await Linking.canOpenURL(res.redirect_url);
                if (canOpen) {
                  await Linking.openURL(res.redirect_url);
                }
              }
            } catch (error) {
            }
            setSigning(false)
          },
        },
      ]
    );
  }, [signing, agreements]);
  
  useEffect(() => {
    getData();
  }, [project_id]);

  const getStatusInfo = (contractor_is_sign: boolean, contractor_can_sign: boolean) => {
    if (contractor_is_sign) {
      return { text: 'Подписано', color: COLORS.green };
    } else if (!contractor_can_sign) {
      return { text: 'На подписании', color: '#F6BA30' };
    } else {
      return { text: 'Подписать', color: COLORS.primary };
    }
  };

  return (
    <View style={styles.container}>
      {(isFetching || downloading || signing) && <CustomLoader />}
      <ScrollView 
        style={styles.scrollView}
        refreshControl={
          <RefreshControl
            refreshing={isRefreshing}
            onRefresh={() => getData(true)}
          />
        }
      >
        <BlockContainer>
        {agreements.map((agreement) => {
          const contractorStatus = getStatusInfo(agreement.contractor_is_sign, agreement.contractor_can_sign);
          const customerStatus = getStatusInfo(agreement.project_head_is_sign, agreement.project_head_can_sign);
          
          return (
            <Block key={agreement.project_agreement_id}>
              <View style={styles.agreementHeader}>
                <View style={styles.agreementInfo}>
                  <Text style={styles.agreementId}><Text style={{color: COLORS.darkGray}}>ID:</Text> {agreement.project_agreement_id}</Text>
                  <Text style={styles.agreementName}><Text style={{color: COLORS.darkGray}}>Наименование:</Text> {agreement.doc_name}</Text>
                </View>
              </View>
              
              <View style={styles.partiesContainer}>
                <View style={styles.partyBlock}>
                  <View style={styles.partyHeader}>
                    <Text style={styles.partyLabel}>Заказчик</Text>
                    <View style={styles.statusContainer}>
                      {customerStatus && <Text style={[styles.statusText, { color: customerStatus.color }]}>
                          {customerStatus.text}
                      </Text>}
                     {agreement.project_head_date && <Text>{agreement.project_head_date}</Text>}
                    </View>
                  </View>
                  <Text style={styles.partyName}>
                    {agreement.project_head_name} {agreement.project_head_fio}
                  </Text>
                </View>
                
                <View style={styles.partyBlock}>
                  <View style={styles.partyHeader}>
                    <Text style={styles.partyLabel}>Подрядчик</Text>
                    <View style={styles.statusContainer}>
                      {contractorStatus && <Text style={[styles.statusText, { color: contractorStatus.color }]}>
                          {contractorStatus.text}
                      </Text>}
                      {agreement.contractor_date && <Text>{agreement.contractor_date}</Text>}
                    </View>
                  </View>
                  <Text style={styles.partyName}>
                    {agreement.contractor_name} {agreement.contractor_fio}
                  </Text>
                </View>
              </View>
              
              {/* Информация о статусе отправки в 1С */}
              {isSBS && (
                <View style={styles.sbsInfoContainer}>
                  {agreement.is_sent_to_1c ? (
                    <View style={styles.sentTo1CContainer}>
                      <Icon name="checkCircle" width={16} height={16} fill={COLORS.green} />
                      <Text style={styles.sentTo1CText}>Отправлено в 1С</Text>
                    </View>
                  ) : (
                    <View style={{flexDirection: 'row', justifyContent: 'center'}}>
                      <TouchableOpacity 
                        style={styles.sendTo1CButton}
                        onPress={sendTo1C} 
                        disabled={sending}
                      >
                        <Text style={styles.sendTo1CButtonText}>
                          {sending ? 'Отправка...' : 'Отправить в 1С'}
                        </Text>
                      </TouchableOpacity>
                    </View>
                  )}
                  
                  {agreement.guid && (
                    <Text style={styles.guidText}>GUID: {agreement.guid}</Text>
                  )}
                  
                  {agreement.error && (
                    <TouchableOpacity 
                      style={styles.errorContainer}
                      onPress={() => Alert.alert('Ошибка', agreement.error)}
                    >
                      <Text style={styles.errorText}>Ошибка</Text>
                      <Icon name="info" width={16} height={16} fill={COLORS.red} />
                    </TouchableOpacity>
                  )}
                </View>
              )}
              
              <TouchableOpacity 
                style={styles.downloadButton}
                onPress={() => downloadPDF(agreement)} disabled={downloading}
              >
                <Text style={styles.downloadText}>Скачать документ</Text>
                <Icon name="downloadAlt" width={16} height={16} fill={COLORS.primaryLight} />
              </TouchableOpacity>
            </Block>
          );
        })}
      </BlockContainer>
      </ScrollView>
      
      {agreements.length > 0 && (
        (() => {
          const agreement = agreements[0];
          const contractorStatus = getStatusInfo(agreement.contractor_is_sign, agreement.contractor_can_sign);
          const customerStatus = getStatusInfo(agreement.project_head_is_sign, agreement.project_head_can_sign);
          
          const canSign = contractorStatus?.text === 'Подписать' || customerStatus?.text === 'Подписать';
          
          return canSign ? (
            <View style={styles.signButtonContainer}>
              <TouchableOpacity 
                style={styles.signButton}
                onPress={handleSignDocument}
                disabled={signing}
              >
                <Text style={styles.signButtonText}>
                  {signing ? 'Подписание...' : 'Подписать'}
                </Text>
              </TouchableOpacity>
            </View>
          ) : null;
        })()
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  agreementHeader: {
    marginBottom: 16,
  },
  agreementInfo: {
    gap: 4,
  },
  agreementId: {
    fontSize: SIZES.regular,
    fontFamily: FONT.regular,
    color: COLORS.black,
  },
  agreementName: {
    fontSize: SIZES.regular,
    fontFamily: FONT.regular,
    color: COLORS.black,
  },
  partiesContainer: {
    gap: 12,
    marginBottom: 16,
  },
  partyBlock: {
    backgroundColor: '#F2F5F8',
    borderRadius: 6,
    padding: 12,
    gap: 8,
  },
  partyHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  partyLabel: {
    fontSize: SIZES.regular,
    fontFamily: FONT.regular,
    color: COLORS.gray,
  },
  statusContainer: {
    alignItems: 'flex-end',
  },
  statusButton: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
  },
  statusButtonText: {
    fontSize: SIZES.regular,
    fontFamily: FONT.medium,
    color: COLORS.white,
  },
  statusText: {
    fontSize: SIZES.regular,
    fontFamily: FONT.medium,
  },
  partyName: {
    fontSize: SIZES.medium,
    fontFamily: FONT.regular,
    color: COLORS.black,
  },
  downloadButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 12,
  },
  downloadText: {
    fontSize: SIZES.medium,
    fontFamily: FONT.regular,
    color: COLORS.primaryLight,
  },
  container: {
    flex: 1,
    backgroundColor: COLORS.backgroundWhite,
  },
  scrollView: {
    flex: 1,
  },
  signButtonContainer: {
    backgroundColor: COLORS.white,
    paddingHorizontal: 16,
    paddingVertical: 12,
    paddingBottom: 20,
  },
  signButton: {
    backgroundColor: COLORS.primary,
    borderRadius: 8,
    paddingVertical: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  signButtonText: {
    fontSize: SIZES.medium,
    fontFamily: FONT.medium,
    color: COLORS.white,
  },
  
  // Стили для информации о 1С
  sbsInfoContainer: {
    backgroundColor: '#F8F9FA',
    borderRadius: 6,
    padding: 12,
    marginBottom: 16,
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
  sendTo1CButton: {
    backgroundColor: COLORS.primaryLight,
    borderRadius: 8,
    paddingVertical: 12,
    paddingHorizontal: 30,
    alignSelf: 'flex-start',
  },
  sendTo1CButtonText: {
    fontSize: SIZES.regular,
    fontFamily: FONT.medium,
    color: COLORS.white,
  },
  guidText: {
    fontSize: SIZES.small,
    fontFamily: FONT.regular,
    color: COLORS.gray,
  },
  errorContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    alignSelf: 'flex-start',
  },
  errorText: {
    fontSize: SIZES.small,
    fontFamily: FONT.medium,
    color: COLORS.red,
  },
});
