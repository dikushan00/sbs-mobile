import React, { useEffect, useMemo, useState } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity } from 'react-native';
import { useDispatch } from 'react-redux';
import { COLORS, FONT } from '@/constants';
import { CustomButton } from '@/components/common/CustomButton';
import { numberWithCommas } from '@/utils';
import { MaterialRequestType, MaterialType, NewMaterialRequestData, ProjectFiltersType, SelectedDataType } from '@/components/main/types';
import { createEntranceMaterialRequest, getEntranceMaterials } from '@/components/main/services';
import { CustomSelect } from '@/components/common/CustomSelect';
import { Icon } from '@/components/Icon';
import { setPageSettings, showBottomDrawer } from '@/services/redux/reducers/app';
import { BOTTOM_DRAWER_KEYS } from '@/components/BottomDrawer/services';
import { setPageHeaderData } from '@/services/redux/reducers/userApp';

interface MaterialOrderFormProps {
  onBack: () => void;
  onSubmit: (res: MaterialRequestType[]) => void;
  onSuccess: (orderData: NewMaterialRequestData) => void;
  filters: ProjectFiltersType;
  selectedData: SelectedDataType
}

export const MaterialOrderForm: React.FC<MaterialOrderFormProps> = ({ onBack, onSubmit, onSuccess, filters, selectedData }) => {
  const dispatch = useDispatch();
  const [isLoading, setIsLoading] = useState(false);
  const [materials, setMaterials] = useState<MaterialType[]>([]);
  const [formData, setFormData] = useState<{material_id: number | null, qty_sell: number | null, date_shipping: string}>({material_id: null, qty_sell: null, date_shipping: ''});
  const [selectedMaterial, setSelectedMaterial] = useState<MaterialType | null>(null);

  useEffect(() => {
    dispatch(setPageSettings({ 
      backBtn: true, 
      goBack: onBack
    }));
    dispatch(setPageHeaderData({
      title: 'Заказать материал',
      desc: `${selectedData?.entrance_name || ''}`,
    }));
  }, [onBack, selectedData])

  const handleSubmitOrder = async () => {
    if (!formData.material_id || !formData.qty_sell || Number(formData.qty_sell) <= 0) {
      return; 
    }
    setIsLoading(true);
    const res = await createEntranceMaterialRequest(formData, filters)
    setIsLoading(false);
    if(!res) return;
    onSubmit(res);
    if(selectedMaterial)
      onSuccess({...formData, unit_name: selectedMaterial.unit_name, material_name: selectedMaterial.material_name});
  };

  const isFormValid = formData.material_id && formData.qty_sell && Number(formData.qty_sell) > 0 && formData.date_shipping;

  const handleDateSelect = () => {
    dispatch(showBottomDrawer({
      type: BOTTOM_DRAWER_KEYS.datePicker,
      data: {
        title: 'Дата отгрузки',
        initialDate: formData.date_shipping ? 
          new Date(formData.date_shipping.split('.').reverse().join('-')) : 
          new Date(),
        onConfirm: (date: Date) => {
          const formattedDate = date.toLocaleDateString('ru-RU', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric'
          });
          setFormData(prev => ({...prev, date_shipping: formattedDate}));
        },
      }
    }));
  };

  useEffect(() => {
    const fetchMaterials = async () => {
      const data = await getEntranceMaterials(filters);
      setMaterials(data || []);
    };
    fetchMaterials();
  }, [filters]);

  const onChange = (key: string, value: any, row?: any) => {
    if (key === "qty_sell") {
      // Защита от нечисловых символов
      let numericValue = value.replace(/[^0-9.]/g, '');
      
      // Защита от множественных точек
      const dotCount = (numericValue.match(/\./g) || []).length;
      if (dotCount > 1) {
        const parts = numericValue.split('.');
        numericValue = parts[0] + '.' + parts.slice(1).join('');
      }
      
      // Защита от отрицательных значений
      if (numericValue.startsWith('-')) {
        return; // Игнорируем отрицательные значения
      }
      
      // Ограничиваем количество знаков после запятой до 2
      if (numericValue.includes('.')) {
        const parts = numericValue.split('.');
        if (parts[1] && parts[1].length > 2) {
          numericValue = parts[0] + '.' + parts[1].substring(0, 2);
        }
      }
      
      setFormData(prev => ({...prev, [key]: numericValue}));
    } else {
      setFormData(prev => ({...prev, [key]: value}));
      if(key === "material_id") {
        setSelectedMaterial(row || null);
      }
    }
  }

  const materialAmount = useMemo(() => {
    if(!selectedMaterial || !formData.qty_sell) return 0;
    const amount = selectedMaterial?.material_price * (Number(formData.qty_sell) || 0)
    if(!amount) return 0
    return amount.toFixed(2);
  }, [selectedMaterial, formData.qty_sell]);

  return (
    <View style={styles.container}>
      <View style={styles.formContainer}>
        <CustomSelect list={materials} label="Материал"
          labelKey='material_name'
            valueKey="material_id" value={formData.material_id} 
            onChange={(id, item) => onChange("material_id", id, item)}
            style={{backgroundColor: COLORS.background}}
            alt
            />
          <View style={styles.inputContainer}>
            <Text style={{fontSize: 16}}>Количество</Text>
            <View style={styles.quantityInputContainer}>
              <TextInput
                style={styles.input}
                placeholderTextColor={COLORS.darkGray}
                placeholder="Кол-во" 
                keyboardType='numeric'
                value={formData.qty_sell?.toString() || ''}
                onChangeText={value => onChange("qty_sell", value)}
              />
              {selectedMaterial && (
                <View style={styles.unitSuffixWrapper}>
                  <Text style={styles.unitSuffix}>{selectedMaterial.unit_name}</Text>
                </View>
              )}
            </View>
            {!!materialAmount && <Text style={styles.materialAmount}><Text style={{color: COLORS.darkGray}}>Сумма:</Text> {numberWithCommas(materialAmount)}</Text>}
          </View>
          
          <View style={styles.inputContainer}>
            <Text style={{fontSize: 16}}>Дата отгрузки</Text>
            <TouchableOpacity style={styles.dateInput} onPress={handleDateSelect}>
              <Text style={[styles.dateInputText, !formData.date_shipping && styles.placeholderText]}>
                {formData.date_shipping || 'Выберите дату'}
              </Text>
              <Icon name="arrowDown" width={16} height={16} fill={COLORS.darkGray} />
            </TouchableOpacity>
          </View>
        </View>
       <View style={styles.fixedBottomContainer}>
         <CustomButton
           title="Заказать материал"
           onClick={handleSubmitOrder}
           type="contained" 
           allWidth={true}
           disabled={!isFormValid} 
           loading={isLoading}
           stylesProps={styles.orderButton}
           wrapperStyles={{height: 52}}
         />
       </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.white,
    padding: 16
  },
  fixedBottomContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: COLORS.white,
    paddingHorizontal: 20,
    paddingVertical: 15,
  },
  orderButton: {
    borderRadius: 12, 
    height: 52
  },
  formContainer: {
    gap: 20,
  },
  input: {
    backgroundColor: COLORS.background,
    borderRadius: 12, 
    padding: 10,
    height: 46,
    flex: 1,
    color: COLORS.dark,
    fontSize: 16,
    paddingLeft: 16
  },
  quantityInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.background,
    borderRadius: 12,
    paddingRight: 16,
    gap: 8,
  },
  unitSuffixWrapper: {
    padding: 5,
    paddingHorizontal: 8, 
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#D1D5DB',
  },
  unitSuffix: {
    fontSize: 16,
    fontFamily: FONT.regular,
    color: COLORS.black,
  },
  inputContainer: {
    gap: 10,
  },
  materialAmount: {
    fontSize: 14,
    color: COLORS.black,
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
