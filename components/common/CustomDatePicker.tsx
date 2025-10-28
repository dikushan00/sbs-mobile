import { COLORS, FONT } from "@/constants"
import { StyleSheet, TouchableOpacity, View } from "react-native"
import { Text } from "react-native"
import { Icon } from "../Icon"
import { BOTTOM_DRAWER_KEYS } from "../BottomDrawer/constants"
import { useDispatch } from "react-redux"
import { showSecondBottomDrawer } from "@/services/redux/reducers/app"

export const CustomDatePicker = ({label, value, onChange, onClose}: {label: string, value: string, onChange: (date: string) => void, onClose?: () => void}) => {
  const dispatch = useDispatch();

  const handleDateSelect = () => {
    dispatch(showSecondBottomDrawer({
      type: BOTTOM_DRAWER_KEYS.datePicker,
      data: {   
        title: label || 'Выберите дату',
        initialDate: value ? 
          new Date(value.split('.').reverse().join('-')) : 
          new Date(),
        onConfirm: (date: Date) => {
          const formattedDate = date.toLocaleDateString('ru-RU', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric'
          });
          onChange(formattedDate);
        },
        onClose
      }, 
    }));
  };
  return <View style={styles.inputContainer}>
  <Text style={{fontSize: 16}}>{label || 'Выберите дату'}</Text>
  <TouchableOpacity style={styles.dateInput} onPress={handleDateSelect}>
    <Text style={[styles.dateInputText, !value && styles.placeholderText]}>
      {value || 'Выберите дату'}
    </Text>
    <Icon name="arrowDown" width={16} height={16} fill={COLORS.darkGray} />
  </TouchableOpacity>
</View>
}

const styles = StyleSheet.create({
  inputContainer: {
    gap: 10,
  },
  dateInput: {
    backgroundColor: COLORS.background,
    borderRadius: 12,
    padding: 10,
    paddingHorizontal: 16,
    height: 46,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  dateInputText: {
    fontSize: 16,
    fontFamily: FONT.regular,
    color: COLORS.black,
    flex: 1,
  },
  placeholderText: {
    color: COLORS.darkGray,
  },
});
