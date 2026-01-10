import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Keyboard } from 'react-native';
import { COLORS, FONT, SIZES } from '@/constants';
import { CustomButton } from '@/components/common/CustomButton';
import { Icon } from '@/components/Icon';

interface DatePickerProps {
  data: {
    title: string;
    initialDate?: Date;
    onConfirm: (date: Date) => void;
    onClose: () => void;
  };
  handleClose: () => void;
}

export const DatePicker: React.FC<DatePickerProps> = ({ data, handleClose }) => {
  const [selectedDate, setSelectedDate] = useState<Date>(data.initialDate || new Date());
  const [currentMonth, setCurrentMonth] = useState<Date>(data.initialDate || new Date());

  const months = [
    'Январь', 'Февраль', 'Март', 'Апрель', 'Май', 'Июнь',
    'Июль', 'Август', 'Сентябрь', 'Октябрь', 'Ноябрь', 'Декабрь'
  ];

  useEffect(() => {
    Keyboard.dismiss();
  }, []);

  const daysOfWeek = ['ПН', 'ВТ', 'СР', 'ЧТ', 'ПТ', 'СБ', 'ВС'];

  const getDaysInMonth = (date: Date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startingDayOfWeek = (firstDay.getDay() + 6) % 7; // Понедельник = 0

    const days = [];
    
    // Добавляем пустые ячейки для дней предыдущего месяца
    for (let i = 0; i < startingDayOfWeek; i++) {
      days.push(null);
    }
    
    // Добавляем дни текущего месяца
    for (let day = 1; day <= daysInMonth; day++) {
      days.push(day);
    }
    
    return days;
  };

  const handleDateSelect = (day: number) => {
    const newDate = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), day);
    setSelectedDate(newDate);
    data.onConfirm(newDate);
    handleClose();
  };

  const handleMonthChange = (direction: 'prev' | 'next') => {
    const newMonth = new Date(currentMonth);
    if (direction === 'prev') {
      newMonth.setMonth(newMonth.getMonth() - 1);
    } else {
      newMonth.setMonth(newMonth.getMonth() + 1);
    }
    setCurrentMonth(newMonth);
  };

  // const handleConfirm = () => {
  //   data.onConfirm(selectedDate);
  //   handleClose();
  // };

  const days = getDaysInMonth(currentMonth);
  const isToday = (day: number) => {
    const today = new Date();
    return (
      day === today.getDate() &&
      currentMonth.getMonth() === today.getMonth() &&
      currentMonth.getFullYear() === today.getFullYear()
    );
  };

  const isSelected = (day: number) => {
    return (
      day === selectedDate.getDate() &&
      currentMonth.getMonth() === selectedDate.getMonth() &&
      currentMonth.getFullYear() === selectedDate.getFullYear()
    );
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>{data.title}</Text>
        <TouchableOpacity onPress={handleClose} style={styles.closeButton}>
          <Icon name="close" width={22} height={22} stroke={COLORS.darkGray} />
        </TouchableOpacity>
      </View>

      <View style={styles.monthHeader}>
        <TouchableOpacity onPress={() => handleMonthChange('prev')} style={styles.monthButton}>
          <Icon name="arrowRightAlt" width={16} height={16} fill={COLORS.gray} style={{ transform: [{ rotate: '180deg' }] }} />
        </TouchableOpacity>
        
        <Text style={styles.monthText}>
          {months[currentMonth.getMonth()]} {currentMonth.getFullYear()}г.
        </Text>
        
        <TouchableOpacity onPress={() => handleMonthChange('next')} style={styles.monthButton}>
          <Icon name="arrowRightAlt" width={16} height={16} fill={COLORS.gray} />
        </TouchableOpacity>
      </View>

      <View style={styles.calendar}>
        <View style={styles.daysHeader}>
          {daysOfWeek.map((day, index) => (
            <Text key={index} style={styles.dayHeader}>{day}</Text>
          ))}
        </View>

        <View style={styles.daysGrid}>
          {days.map((day, index) => (
            <TouchableOpacity
              key={index}
              style={[
                styles.dayCell,
                day && isToday(day) && styles.todayDay,
                day && isSelected(day) && styles.selectedDay,
              ]}
              onPress={() => day && handleDateSelect(day)}
              disabled={!day}
            >
              {day && (
                <Text style={[
                  styles.dayText,
                  day && isToday(day) && styles.todayDayText,
                  day && isSelected(day) && styles.selectedDayText,
                ]}>
                  {day}
                </Text>
              )}
            </TouchableOpacity>
          ))}
        </View>
      </View>

      {/* <View style={styles.buttonsContainer}>
        <CustomButton
          title="Установить"
          onClick={handleConfirm}
          type="contained"
          stylesProps={styles.confirmButton}
        />
        <TouchableOpacity onPress={handleClose} style={styles.cancelButton}>
          <Text style={styles.cancelButtonText}>Отмена</Text>
        </TouchableOpacity>
      </View> */}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  title: {
    fontSize: SIZES.medium,
    fontFamily: FONT.regular,
    color: COLORS.black,
  },
  closeButton: {
    padding: 5,
  },
  monthHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  monthButton: {
    padding: 10,
  },
  monthText: {
    fontSize: SIZES.medium,
    fontFamily: FONT.medium,
    color: COLORS.black,
  },
  calendar: {
    marginBottom: 20,
  },
  daysHeader: {
    flexDirection: 'row',
    marginBottom: 10,
  },
  dayHeader: {
    flex: 1,
    textAlign: 'center',
    fontSize: SIZES.small,
    fontFamily: FONT.medium,
    color: COLORS.gray,
    paddingVertical: 8,
  },
  daysGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  dayCell: {
    width: '14.28%',
    aspectRatio: 1,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  dayText: {
    fontSize: SIZES.regular,
    fontFamily: FONT.regular,
    color: COLORS.black,
  },
  selectedDay: {
    backgroundColor: COLORS.primary,
    borderRadius: 20,
  },
  selectedDayText: {
    color: COLORS.white,
    fontFamily: FONT.medium,
  },
  todayDay: {
    backgroundColor: COLORS.background,
    borderRadius: 20,
  },
  todayDayText: {
    color: COLORS.primary,
    fontFamily: FONT.medium,
  },
  selectedDateContainer: {
    backgroundColor: COLORS.background,
    padding: 15,
    borderRadius: 10,
    marginBottom: 20,
  },
  selectedDateLabel: {
    fontSize: SIZES.small,
    fontFamily: FONT.regular,
    color: COLORS.gray,
    marginBottom: 5,
  },
  selectedDateValue: {
    fontSize: SIZES.medium,
    fontFamily: FONT.medium,
    color: COLORS.black,
  },
  buttonsContainer: {
    gap: 10,
  },
  confirmButton: {
    backgroundColor: COLORS.primary,
  },
  cancelButton: {
    alignItems: 'center',
    paddingVertical: 12,
  },
  cancelButtonText: {
    fontSize: SIZES.medium,
    fontFamily: FONT.regular,
    color: COLORS.primary,
  },
});
