import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert } from 'react-native';
import { COLORS, FONT, SIZES } from '@/constants';
import { Icon } from '@/components/Icon';
import { CustomButton } from '@/components/common/CustomButton';
import { ProjectMainDocumentType, ProjectFiltersType } from '@/components/main/types';
import { ValueDisplay } from '@/components/common/ValueDisplay';
import { CustomDatePicker } from '@/components/common/CustomDatePicker';
import { BOTTOM_DRAWER_KEYS } from '../services';
import { showBottomDrawer, showSecondBottomDrawer } from '@/services/redux/reducers/app';
import { useDispatch } from 'react-redux';
import { changeDateEntranceDocument } from '@/components/main/services';
import { useSnackbar } from '@/components/snackbar/SnackbarContext';
import { BottomDrawerHeader } from '../BottomDrawerHeader';

interface DocumentActionsProps {
  data: {
    document: ProjectMainDocumentType;
    onSubmit: (res: ProjectMainDocumentType[]) => void;
    params: ProjectFiltersType;
    floor_map_document_id: number;
  };
  handleClose: () => void;
}

export const DocumentActions: React.FC<DocumentActionsProps> = ({ data, handleClose }) => {
  const dispatch = useDispatch();
  const { showSuccessSnackbar } = useSnackbar();
  const [showDateChange, setShowDateChange] = useState(false);
  const { document, params, floor_map_document_id, onSubmit } = data;
  const [processing, setProcessing] = useState(false);
  const [selectedDates, setSelectedDates] = useState({
    date_begin: document.date_begin,
    date_end: document.date_end
  });
  const [changeDateLoading, setChangeDateLoading] = useState(false);

  const handleDownload = async () => {
    if (!document.master_url) {
      Alert.alert('Ошибка', 'Файл для скачивания недоступен');
      return;
    }
    
    try {
      // TODO: Implement file download logic
      Alert.alert('Скачивание', 'Документ будет скачан');
      handleClose();
    } catch (error) {
      Alert.alert('Ошибка', 'Не удалось скачать документ');
    }
  };

  const handleChangeDates = () => {
    setShowDateChange(true);
  };

  const handleSign = () => {
    dispatch(showSecondBottomDrawer({
      type: BOTTOM_DRAWER_KEYS.signatoriesList,
      data: {
        document,
        onSubmit,
        onSign: () => {
          // TODO: Implement actual sign logic
          console.log('Signing document:', document.floor_map_document_id);
        }
      }
    }));
  };

  const confirmSign = async () => {
    if (processing) return;
    setProcessing(true);
    
    try {
      // TODO: Implement sign document logic
      Alert.alert('Успех', 'Документ подписан');
      handleClose();
    } catch (error) {
      Alert.alert('Ошибка', 'Не удалось подписать документ');
    } finally {
      setProcessing(false);
    }
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
      
      <View style={styles.actionsList}>
        <TouchableOpacity style={styles.actionItem} onPress={handleChangeDates}>
          <View style={styles.actionIcon}>
            <Icon name="calendar" width={20} height={20} fill={COLORS.primary} />
          </View>
          <Text style={styles.actionText}>Изменить даты</Text>
        </TouchableOpacity>
        
        {!document.is_signed && (
          <TouchableOpacity style={styles.actionItem} onPress={handleSign}>
            <View style={styles.actionIcon}>
              <Icon name="people" width={20} height={20} fill={COLORS.primary} />
            </View>
            <Text style={styles.actionText}>Подписать</Text>
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
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    width: '100%'
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
