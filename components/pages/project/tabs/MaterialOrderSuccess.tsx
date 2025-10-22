import React, { useEffect } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useDispatch } from 'react-redux';
import { COLORS, FONT } from '@/constants';
import { CustomButton } from '@/components/common/CustomButton';
import { Icon } from '@/components/Icon';
import { setPageSettings } from '@/services/redux/reducers/app';
import { NewMaterialRequestData } from '@/components/main/types';
import { ValueDisplay } from '@/components/common/ValueDisplay';

interface MaterialOrderSuccessProps {
  onBack: () => void;
  orderData: NewMaterialRequestData | null;
}

export const MaterialOrderSuccess: React.FC<MaterialOrderSuccessProps> = ({ onBack, orderData }) => {
  const dispatch = useDispatch();

  useEffect(() => {
    dispatch(setPageSettings({ 
      backBtn: true, 
      goBack: onBack
    }));
  }, [onBack]);

  console.log(orderData)

  if(!orderData)
    return null

  return (
    <View style={styles.container}>
      <View style={styles.content}>
        <View style={styles.contentTop}>
          <View style={styles.iconContainer}>
            <Icon name="success" width={80} height={80} />
          </View>
          
          <Text style={styles.title}>Материал заказан</Text>
        </View>
        
        <View style={styles.detailsContainer}>
          <ValueDisplay label="Материал" value={orderData.material_name} style={{flex: 0}} />
          <ValueDisplay label="Количество" value={`${orderData.qty_sell} ${orderData.unit_name}`} style={{flex: 0}} />
          <ValueDisplay label="Дата отгрузки" value={orderData.date_shipping} style={{flex: 0}} />
        </View>
      </View>
      
      <View style={styles.buttonContainer}>
        <CustomButton
          title="Вернуться назад"
          onClick={onBack}
          type="contained"
          allWidth={true}
          stylesProps={styles.backButton}
          wrapperStyles={{height: 52}}
        />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  content: {
    flex: 1,
    alignItems: 'center',
  },
  contentTop: {
    paddingTop: 20,
    alignItems: 'center',
    backgroundColor: COLORS.white,
    width: '100%',
    paddingBottom: 10,
    borderBottomRightRadius: 16,
    borderBottomLeftRadius: 16,
  },
  iconContainer: {
    marginBottom: 20,
  },
  title: {
    fontSize: 24,
    fontFamily: FONT.regular,
    color: COLORS.black,
    textAlign: 'center',
    marginBottom: 20,
  },
  detailsContainer: {
    width: '100%',
    gap: 20,
    padding: 20,
    backgroundColor: COLORS.white,
    flex: 1,
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    marginTop: 10
  },
  detailItem: {
    gap: 8,
  },
  detailLabel: {
    fontSize: 14,
    fontFamily: FONT.regular,
    color: COLORS.gray,
  },
  detailValue: {
    fontSize: 16,
    fontFamily: FONT.regular,
    color: COLORS.black,
  },
  buttonContainer: {
    paddingVertical: 15,
    paddingHorizontal: 20,
    backgroundColor: COLORS.white
  },
  backButton: {
    backgroundColor: COLORS.primary,
    borderRadius: 12,
    height: 52,
  },
});
