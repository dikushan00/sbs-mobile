import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert } from 'react-native';
import { COLORS, FONT, SIZES } from '@/constants';
import { Icon } from '@/components/Icon';
import { ProjectPaymentType } from '@/components/main/types';
import { BottomDrawerHeader } from '../BottomDrawerHeader';

interface PaymentActionsProps {
  data: {
    payment: ProjectPaymentType;
    onSubmit: (res: ProjectPaymentType[]) => void;
  };
  handleClose: () => void;
}

export const PaymentActions: React.FC<PaymentActionsProps> = ({ data, handleClose }) => {
  const handleDownload = async () => {
    try {
      // TODO: Implement file download logic
      Alert.alert('Скачивание', 'Файл будет скачан');
      handleClose();
    } catch (error) {
      Alert.alert('Ошибка', 'Не удалось скачать файл');
    }
  };

  return (
    <View style={styles.container}>
      <BottomDrawerHeader title='Действия' handleClose={handleClose} />
      
      <View style={styles.actionsList}>
        <TouchableOpacity style={styles.actionItem} onPress={handleDownload}>
          <View style={styles.actionIcon}>
            <Icon name="downloadAlt" width={20} height={20} fill={COLORS.primary} />
          </View>
          <Text style={styles.actionText}>Скачать</Text>
        </TouchableOpacity>
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
});
