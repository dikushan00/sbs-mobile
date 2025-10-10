import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { COLORS, FONT, SIZES } from '@/constants';
import { Icon } from '@/components/Icon';

interface BlockItemProps {
  title: string;
  icon?: string;
  iconColor?: string;
  onPress: () => void;
  children?: React.ReactNode;
}

export const BlockItem: React.FC<BlockItemProps> = ({ 
  title, 
  icon, 
  iconColor = COLORS.primary,
  onPress, 
  children 
}) => {
  return (
    <TouchableOpacity
      style={styles.block}
      onPress={onPress}
    >
      <View style={styles.blockContent}>
        <View style={styles.leftSection}>
          {icon && (
            <View style={styles.iconContainer}>
              <Icon name={icon as any} width={16} height={16} fill={iconColor} />
            </View>
          )}
          <Text style={styles.blockTitle}>{title}</Text>
        </View>
        <Icon name="arrowRightAlt" width={20} height={20} fill={COLORS.gray} />
      </View>
      {children}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  block: {
    backgroundColor: COLORS.white,
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 0,
    },
    shadowOpacity: 0.05,
    shadowRadius: 15,
    elevation: 0,
  },
  blockContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  leftSection: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  iconContainer: {
    backgroundColor: '#DFEFFF',
    borderRadius: 6,
    padding: 7,
    marginRight: 15,
  },
  blockTitle: {
    fontSize: SIZES.medium,
    fontFamily: FONT.regular,
    color: COLORS.black,
    flex: 1,
  },
});
