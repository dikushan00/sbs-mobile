import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { COLORS, FONT, SIZES } from '@/constants';
import { Icon } from '@/components/Icon';
import { CustomButton } from '@/components/common/CustomButton';
import { MaterialRequestType, ProjectFiltersType } from '@/components/main/types';
import { numberWithCommas } from '@/utils';
import { ValueDisplay } from '@/components/common/ValueDisplay';
import { deleteEntranceMaterialRequest } from '@/components/main/services';

interface MaterialActionsProps {
  data: {
    material: MaterialRequestType;
    onSubmit: (res: MaterialRequestType[]) => void;
    params: ProjectFiltersType
    provider_request_item_id: number
  };
  handleClose: () => void;
}

export const MaterialActions: React.FC<MaterialActionsProps> = ({ data, handleClose }) => {
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const { material, params, provider_request_item_id, onSubmit } = data;
  const [deleting, setDeleting] = useState(false)

  const handleDelete = () => {
    setShowDeleteConfirm(true);
  };

  const confirmDelete = async () => {
    if(deleting) return
    setDeleting(true)
    const res = await deleteEntranceMaterialRequest(params, provider_request_item_id)
    setDeleting(false)
    if(!res) return
    onSubmit(res);
    handleClose()
  };

  if (showDeleteConfirm) {
    return (
      <View style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.title}>Вы точно хотите удалить?</Text>
        </View>
        
        <View style={styles.confirmContent}>
          <View style={styles.materialInfo}>
            <ValueDisplay value={material.material_name} label='Материал' />
            <ValueDisplay label='Количество' value={
                `${numberWithCommas(material.material_cnt)} ${material.sell_unit_name}`} />
           
            <ValueDisplay value={material.date_shipping} label='Дата отгрузки' />
          </View>
        </View>

        <View style={styles.buttonContainer}>
          <CustomButton
            disabled={deleting}
            loading={deleting}
            title="Удалить" 
            onClick={confirmDelete} 
            type="contained"
            stylesProps={{backgroundColor: COLORS.red}}
            wrapperStyles={styles.deleteButton}
          />
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Действия</Text>
      </View>

      <View style={styles.actionsList}>
        
        {material.provider_request_status_code === 'CREATE' || material.provider_request_status_code === 'BRING_TO_CONTRACTOR' && <TouchableOpacity style={styles.actionItem} onPress={handleDelete}>
          <View style={styles.actionIcon}>
            <Icon name="trash" width={20} height={20} fill={COLORS.red} />
          </View>
          <Text style={[styles.actionText]}>Удалить</Text>
        </TouchableOpacity>}
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
  confirmContent: {
    marginBottom: 30,
  },
  confirmText: {
    fontSize: SIZES.medium,
    fontFamily: FONT.regular,
    color: COLORS.black,
    textAlign: 'center',
    marginBottom: 20,
  },
  materialInfo: {
    borderRadius: 10,
    gap: 15
  },
  materialName: {
    fontSize: SIZES.medium,
    fontFamily: FONT.medium,
    color: COLORS.black,
    marginBottom: 10,
  },
  materialDetails: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 5,
  },
  detailLabel: {
    fontSize: SIZES.regular,
    fontFamily: FONT.regular,
    color: COLORS.gray,
  },
  detailValue: {
    fontSize: SIZES.regular,
    fontFamily: FONT.regular,
    color: COLORS.black,
  },
  buttonContainer: {
    flexDirection: 'row',
    gap: 15,
    width: '100%'
  },
  cancelButton: {
    flex: 1,
    backgroundColor: COLORS.grayLight,
  },
  cancelButtonText: {
    color: COLORS.black,
  },
  deleteButton: {
    flex: 1,
  },
});
