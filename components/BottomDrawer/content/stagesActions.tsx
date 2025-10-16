import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { COLORS, FONT, SIZES } from '@/constants';
import { Icon } from '@/components/Icon';
import { ProjectStageType } from '@/components/main/types';
import { BottomDrawerHeader } from '../BottomDrawerHeader';

interface StagesActionsProps {
  data: {
    stage: ProjectStageType;
    onSubmit: (res: ProjectStageType[]) => void;
    onViewComments: (stage: ProjectStageType) => void;
  };
  handleClose: () => void;
}

export const StagesActions: React.FC<StagesActionsProps> = ({ data, handleClose }) => {
  const { stage, onSubmit, onViewComments } = data;

  const handleOpenScheme = () => {
    // TODO: Implement open scheme logic
    console.log('Opening scheme for stage:', stage.floor_map_id);
    handleClose();
  };

  const handleViewComments = () => {
    onViewComments(stage);
    handleClose();
  };

  const showViewComments = stage.check_status_code === 'DEFECT';

  return (
    <View style={styles.container}>
      <BottomDrawerHeader title='Действия' handleClose={handleClose} />
      
      <View style={styles.actionsList}>
        <TouchableOpacity style={styles.actionItem} onPress={handleOpenScheme}>
          <View style={styles.actionIcon}>
            <Icon name="map" width={20} height={20} fill={COLORS.primary} />
          </View>
          <Text style={styles.actionText}>Открыть схему</Text>
        </TouchableOpacity>
        
        {showViewComments && (
          <TouchableOpacity style={styles.actionItem} onPress={handleViewComments}>
            <View style={styles.actionIcon}>
              <Icon name="info" width={20} height={20} fill={COLORS.primary} />
            </View>
            <Text style={styles.actionText}>Просмотр замечаний</Text>
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
