import React, { useMemo } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { COLORS, FONT, SIZES } from '@/constants';
import { Icon } from '@/components/Icon';
import { CustomButton } from '@/components/common/CustomButton';
import { ProjectMainDocumentType } from '@/components/main/types';
import { BottomDrawerHeader } from '../BottomDrawerHeader';
import { ValueDisplay } from '@/components/common/ValueDisplay';

interface SignatoriesListProps {
  data: {
    document: ProjectMainDocumentType;
    onSubmit: (res: ProjectMainDocumentType[]) => void;
    onSign: () => void;
  };
  handleClose: () => void;
}

export const SignatoriesList: React.FC<SignatoriesListProps> = ({ data, handleClose }) => {
  const { document, onSubmit, onSign } = data;

  const getStatusColor = (isSigned: boolean) => {
    return isSigned ? COLORS.green : '#F6BA30';
  };

  const getStatusText = (isSigned: boolean) => {
    return isSigned ? 'Подписан' : 'На подписании';
  };

  const signDocument = useMemo(() => {
    return document.assign_signs?.find((signatory) => !signatory.is_signed && signatory.can_sign)
  }, [document]);
  
  return (
    <View style={styles.container}>
      <BottomDrawerHeader handleClose={handleClose} title={`Подписанты: ${document.work_set_check_group_name}`} />
      
      <View style={styles.signatoriesList}>
        {document.assign_signs?.map((signatory, index) => (
          <View key={index} style={styles.signatoryCard}>
            <View style={styles.signatoryInfo}>
              <View style={{flexDirection: 'row', gap: 10,
               alignItems: 'center', marginBottom: 10}}>
                 <Text style={styles.signatoryName} numberOfLines={0}>
                   {signatory.employee_fio} / {signatory.assign_type_id}
                 </Text>
                <View 
                  style={[
                    styles.statusButton, 
                    { backgroundColor: getStatusColor(signatory.is_signed) }
                  ]}
                >
                  <Text style={styles.statusText}>
                    {getStatusText(signatory.is_signed)}
                  </Text>
                </View>
              </View>

              <View style={{flexDirection: 'row', gap: 10, marginTop: 10, width: '100%'}}>
                <View style={{flex: 1}}>
                  <ValueDisplay label='Должность' value={signatory.assign_type_name} />
                </View>
                <View style={{flex: 1}}>
                  <ValueDisplay label='Номер телефона' value={signatory.phone} />
                </View>
              </View>
              {!!signatory.sign_date && <ValueDisplay label='Дата подписания' value={signatory.sign_date} style={{marginTop: 15}} />}
            </View>
          </View>
        ))}
      </View>

      {!!signDocument && <View style={styles.actionContainer}>
        <CustomButton
          title="Подписать"
          onClick={onSign}
          type="contained"
          stylesProps={{ backgroundColor: COLORS.primary }}
          wrapperStyles={styles.signButton}
        />
      </View>}
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
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  title: {
    fontSize: SIZES.large,
    fontFamily: FONT.regular,
    color: COLORS.black,
    flex: 1,
  },
  closeButton: {
    padding: 5,
  },
  signatoriesList: {
    flex: 1,
    marginBottom: 20,
    paddingTop: 20
  },
  signatoryCard: {
    backgroundColor: COLORS.background,
    borderRadius: 12,
    padding: 15,
    marginBottom: 10,
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  signatoryInfo: {
    flex: 1,
  },
  signatoryName: {
    fontSize: SIZES.medium,
    fontFamily: FONT.regular,
    color: COLORS.black,
    flex: 1,
    flexWrap: 'wrap'
  },
  signatoryDetails: {
    flexDirection: 'row',
    marginBottom: 4,
  },
  detailLabel: {
    fontSize: SIZES.regular,
    fontFamily: FONT.regular,
    color: COLORS.gray,
    minWidth: 120,
  },
  detailValue: {
    fontSize: SIZES.regular,
    fontFamily: FONT.regular,
    color: COLORS.black,
    flex: 1,
  },
  statusContainer: {
    marginLeft: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  statusButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
    minWidth: 100,
    alignItems: 'center',
  },
  statusText: {
    fontSize: SIZES.small,
    fontFamily: FONT.medium,
    color: COLORS.white,
  },
  actionContainer: {
    width: '100%',
  },
  signButton: {
    width: '100%',
    height: 52
  },
});
