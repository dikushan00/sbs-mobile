import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { COLORS, FONT, SIZES } from '@/constants';
import { Icon } from '@/components/Icon';

interface BlockItemProps {
  title: string;
  icon?: string;
  blockMode?: boolean;
  iconColor?: string;
  onPress: () => void;
  children?: React.ReactNode;
  renderContent?: () => React.ReactNode;
}

export const BlockItem: React.FC<BlockItemProps> = ({ 
  title, 
  icon, 
  iconColor = COLORS.primary,
  blockMode = true, 
  onPress, 
  children,
  renderContent
}) => {
  const blockStyle = blockMode ? styles.blockMode : styles.block;
  return (
    <TouchableOpacity
      style={blockStyle}
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
        {renderContent && renderContent()}
        <Icon name="arrowRightAlt" width={20} height={20} fill={COLORS.primaryLight} />
      </View>
      {children}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  block: {
    paddingVertical: 16,
    backgroundColor: COLORS.white,
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
    marginRight: 10,
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
    flexShrink: 1,
  },
  blockMode: {
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
});
