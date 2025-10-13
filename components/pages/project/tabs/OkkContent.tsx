import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { COLORS, FONT, SIZES } from '@/constants';
import { ProjectFloorType } from '@/components/main/types';
import { Icon } from '@/components/Icon';
import { useDispatch } from 'react-redux';
import { setPageSettings } from '@/services/redux/reducers/app';
import { setPageHeaderData as setUserPageHeaderData } from '@/services/redux/reducers/userApp';

interface OkkContentProps {
  floor: ProjectFloorType;
  onBack: () => void;
}

export const OkkContent: React.FC<OkkContentProps> = ({ floor, onBack }) => {
  const dispatch = useDispatch();

  React.useEffect(() => {
    dispatch(setPageSettings({ 
      backBtn: true, 
      goBack: onBack
    }));
    dispatch(setUserPageHeaderData({
      title: "Вызов ОКК",
      desc: `Этаж ${floor.floor}`,
    }));
  }, [onBack, dispatch, floor.floor]);

  const handleStartOkk = () => {
    // Здесь будет логика запуска ОКК
    console.log('Запуск ОКК для этажа:', floor.floor);
  };

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      <View style={styles.header}>
        <Text style={styles.title}>Вызов ОКК</Text>
        <Text style={styles.subtitle}>Этаж {floor.floor}</Text>
      </View>

      <View style={styles.infoCard}>
        <Text style={styles.cardTitle}>Информация об этаже</Text>
        <View style={styles.infoRow}>
          <Text style={styles.infoLabel}>Номер этажа:</Text>
          <Text style={styles.infoValue}>{floor.floor}</Text>
        </View>
        <View style={styles.infoRow}>
          <Text style={styles.infoLabel}>Количество квартир:</Text>
          <Text style={styles.infoValue}>{floor.flat?.length || 0}</Text>
        </View>
      </View>

      <View style={styles.statusCard}>
        <Text style={styles.cardTitle}>Статус работ</Text>
        <View style={styles.statusRow}>
          <Icon name="check" width={20} height={20} fill={COLORS.green} />
          <Text style={styles.statusText}>Работы выполнены</Text>
        </View>
        <View style={styles.statusRow}>
          <Icon name="moneyAlt" width={20} height={20} fill={COLORS.primary} />
          <Text style={styles.statusText}>Оплата произведена</Text>
        </View>
      </View>

      <TouchableOpacity style={styles.startButton} onPress={handleStartOkk}>
        <Icon name="checkCircleBlue" width={24} height={24} fill={COLORS.white} />
        <Text style={styles.startButtonText}>Начать вызов ОКК</Text>
      </TouchableOpacity>

      <View style={styles.instructionsCard}>
        <Text style={styles.cardTitle}>Инструкции</Text>
        <Text style={styles.instructionText}>
          • Проверьте готовность всех работ на этаже{'\n'}
          • Убедитесь в наличии всех необходимых документов{'\n'}
          • Сфотографируйте выполненные работы{'\n'}
          • Заполните чек-лист ОКК
        </Text>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.backgroundWhite,
  },
  header: {
    padding: 16,
    backgroundColor: COLORS.white,
    marginBottom: 16,
  },
  title: {
    fontSize: SIZES.large,
    fontFamily: FONT.bold,
    color: COLORS.black,
    marginBottom: 4,
  },
  subtitle: {
    fontSize: SIZES.medium,
    fontFamily: FONT.regular,
    color: COLORS.gray,
  },
  infoCard: {
    backgroundColor: COLORS.white,
    padding: 16,
    marginBottom: 16,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 0,
    },
    shadowOpacity: 0.05,
    shadowRadius: 15,
    elevation: 0,
  },
  statusCard: {
    backgroundColor: COLORS.white,
    padding: 16,
    marginBottom: 16,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 0,
    },
    shadowOpacity: 0.05,
    shadowRadius: 15,
    elevation: 0,
  },
  instructionsCard: {
    backgroundColor: COLORS.white,
    padding: 16,
    marginBottom: 16,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 0,
    },
    shadowOpacity: 0.05,
    shadowRadius: 15,
    elevation: 0,
  },
  cardTitle: {
    fontSize: SIZES.medium,
    fontFamily: FONT.bold,
    color: COLORS.black,
    marginBottom: 12,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  infoLabel: {
    fontSize: SIZES.medium,
    fontFamily: FONT.regular,
    color: COLORS.gray,
  },
  infoValue: {
    fontSize: SIZES.medium,
    fontFamily: FONT.medium,
    color: COLORS.black,
  },
  statusRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  statusText: {
    fontSize: SIZES.medium,
    fontFamily: FONT.regular,
    color: COLORS.black,
    marginLeft: 8,
  },
  startButton: {
    backgroundColor: COLORS.primary,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    paddingHorizontal: 24,
    borderRadius: 12,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  startButtonText: {
    fontSize: SIZES.medium,
    fontFamily: FONT.bold,
    color: COLORS.white,
    marginLeft: 8,
  },
  instructionText: {
    fontSize: SIZES.medium,
    fontFamily: FONT.regular,
    color: COLORS.black,
    lineHeight: 22,
  },
});
