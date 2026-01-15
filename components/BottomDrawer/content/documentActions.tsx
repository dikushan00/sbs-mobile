import React, { useMemo, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert, Linking } from 'react-native';
import { COLORS, FONT, mobileSignUrl, mobileSignBusinessUrl, SIZES } from '@/constants';
import { Icon } from '@/components/Icon';
import { CustomButton } from '@/components/common/CustomButton';
import { ProjectMainDocumentType, ProjectFiltersType } from '@/components/main/types';
import { CustomDatePicker } from '@/components/common/CustomDatePicker';
import { BOTTOM_DRAWER_KEYS } from '../constants';
import { showSecondBottomDrawer } from '@/services/redux/reducers/app';
import { useDispatch, useSelector } from 'react-redux';
import { changeDateEntranceDocument, sendAvrTo1C } from '@/components/main/services';
import { useSnackbar } from '@/components/snackbar/SnackbarContext';
import { BottomDrawerHeader } from '../BottomDrawerHeader';
import { downloadAndOpenFile, openLocalFileIfExists } from '@/utils';
import { instance } from '@/services/api';
import { CustomLoader } from '@/components/common/CustomLoader';
import { userAppState } from '@/services/redux/reducers/userApp';

interface DocumentActionsProps {
  data: {
    document: ProjectMainDocumentType;
    onSubmit: (res: ProjectMainDocumentType[]) => void;
    params: ProjectFiltersType;
    floor_map_document_id: number;
    showDateChangeInitially?: boolean;
  };
  handleClose: () => void;
}

export const DocumentActions: React.FC<DocumentActionsProps> = ({ data, handleClose }) => {
  const dispatch = useDispatch();
  const { showSuccessSnackbar } = useSnackbar();
  const { document, params, floor_map_document_id, onSubmit, showDateChangeInitially } = data;
  const [showDateChange, setShowDateChange] = useState(showDateChangeInitially || false);
  const [processing, setProcessing] = useState(false);
  const [singningDisabled, setSingningDisabled] = useState(false);
  const [downloading, setDownloading] = useState(false);
  const [sendingTo1C, setSendingTo1C] = useState(false);
  const [selectedDates, setSelectedDates] = useState({
    date_begin: document.date_begin,
    date_end: document.date_end
  });
  const [changeDateLoading, setChangeDateLoading] = useState(false);
  const { userData, userType } = useSelector(userAppState);
  const egovSignUrl = userType === 'business' ? mobileSignBusinessUrl : mobileSignUrl;
  
  const handleDownload = async () => {
    if(downloading) return;
    setDownloading(true);
    try {
      const fileName = document.floor_map_document_type_name + '.pdf';

      // Если файл уже скачан — открываем локальный и не делаем повторный запрос
      const openedFromCache = await openLocalFileIfExists(fileName);
      if (openedFromCache) {
        handleClose();
        return;
      }

      const res = await instance().get(document.master_url, { responseType: 'arraybuffer' })
      
      await downloadAndOpenFile(res, fileName)
      handleClose();
    } catch (error) {
      Alert.alert('Ошибка', 'Не удалось скачать документ');
    } finally {
      setDownloading(false);
    }
  };

  const handleSendTo1C = async () => {
    if (sendingTo1C) return;
    
    Alert.alert(
      "Отправка в 1С",
      "Вы действительно хотите отправить АВР в 1С?",
      [
        {
          text: "Отмена",
          style: "destructive",
        },
        {
          text: "Отправить",
          style: "default",
          onPress: async () => {
            setSendingTo1C(true);
            try {
              const res = await sendAvrTo1C(floor_map_document_id, params);
              
              if (res) {
                showSuccessSnackbar('АВР успешно отправлен в 1С');
                onSubmit(res);
                handleClose();
              }
            } catch (error) {
            }
            setSendingTo1C(false);
          },
        },
      ]
    );
  };

  const handleChangeDates = () => {
    setShowDateChange(true);
  };

  const handleSign = () => {
    dispatch(showSecondBottomDrawer({
      type: BOTTOM_DRAWER_KEYS.signatoriesList,
      data: {
        document,
        onSign: confirmSign
      }
    }));
  };

  const confirmSign = async () => {
    const apiUrl = encodeURIComponent(`https://devmaster-back.smart-remont.kz/mgovSign/init?doc_id=${floor_map_document_id}&type=document&user=${userData?.employee_id}`)
    const link = `${egovSignUrl}?link=${apiUrl}`
    await Linking.openURL(link);
  };

  const handleDateChange = async () => {
    if (changeDateLoading) return;
    
    setChangeDateLoading(true);
    const res = await changeDateEntranceDocument({...selectedDates, floor_map_document_id}, params)
    setChangeDateLoading(false);
    if(!res) return;
    showSuccessSnackbar('Успешно')
    onSubmit(res);
    handleClose();
  };

  const signDocument = useMemo(() => {
    return document.assign_signs?.find((signatory) => !signatory.is_signed && signatory.can_sign)
  }, [document]);

  if (showDateChange) {
    return (
      <View style={styles.container}>
        <BottomDrawerHeader title='Изменить даты' handleClose={() => setShowDateChange(false)} />
        
        <View style={styles.documentInfo}>
          <CustomDatePicker label='Дата начала' 
          value={selectedDates.date_begin} onChange={(date) => setSelectedDates(prev => ({...prev, date_begin: date}))} />
          <CustomDatePicker label='Дата окончания' 
          value={selectedDates.date_end} onChange={(date) => setSelectedDates(prev => ({...prev, date_end: date}))} />
        </View>
        <View style={styles.buttonContainer}>
          <CustomButton
            loading={changeDateLoading}
            title="Сохранить" 
            onClick={handleDateChange} 
            type="contained"
            wrapperStyles={styles.actionButton}
          />
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <BottomDrawerHeader title='Действия' handleClose={handleClose} />
      
      {(downloading || processing || sendingTo1C) && <CustomLoader />}
      <View style={styles.actionsList}>
        <TouchableOpacity style={styles.actionItem} onPress={handleChangeDates}>
          <View style={styles.actionIcon}>
            <Icon name="calendar" width={20} height={20} fill={COLORS.primary} />
          </View>
          <Text style={styles.actionText}>Изменить даты</Text>
        </TouchableOpacity>
        
        {!document.is_signed && (
          <TouchableOpacity style={[styles.actionItem, {opacity: singningDisabled ? 0.5 : 1}]} onPress={handleSign} disabled={singningDisabled}>
            <View style={styles.actionIcon}>
              <Icon name="people" width={20} height={20} fill={COLORS.primary} />
            </View>
            <Text style={styles.actionText}>Подписанты</Text>
            {/* <Text style={styles.actionText}>{signDocument ? 'Подписать' : 'Подписанты'}</Text> */}
          </TouchableOpacity>
        )}
        
        {!!document.master_url && (
          <TouchableOpacity style={styles.actionItem} onPress={handleDownload}>
            <View style={styles.actionIcon}>
              <Icon name="downloadAlt" width={20} height={20} fill={COLORS.primary} />
            </View>
            <Text style={styles.actionText}>Скачать</Text>
          </TouchableOpacity>
        )}
        
        {!document.is_avr_sent_bi && document.can_sent_1c && (
          <TouchableOpacity 
            style={styles.actionItem} 
            onPress={handleSendTo1C}
            disabled={sendingTo1C}
          >
            <View style={styles.actionIcon}>
              <Icon name="check" width={20} height={20} fill={COLORS.primary} />
            </View>
            <Text style={styles.actionText}>
              {sendingTo1C ? 'Отправка...' : 'Отправить в 1С'}
            </Text>
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    width: '100%',
    paddingRight: 7,
    paddingTop: 10
  },
  header: {
    marginBottom: 20,
    width: '100%'
  },
  title: {
    fontSize: SIZES.large,
    fontFamily: FONT.regular,
    color: COLORS.black,
  },
  actionsList: {
  },
  actionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 15,
    paddingHorizontal: 10,
    paddingLeft: 0,
    borderRadius: 10,
  },
  actionIcon: {
    marginRight: 15,
  },
  actionText: {
    fontSize: SIZES.regular,
    fontFamily: FONT.regular,
    color: COLORS.black,
  },
  documentInfo: {
    marginBottom: 30,
    borderRadius: 10,
    gap: 15
  },
  buttonContainer: {
    flexDirection: 'row',
    gap: 15,
    width: '100%'
  },
  actionButton: {
    flex: 1,
  },
});
