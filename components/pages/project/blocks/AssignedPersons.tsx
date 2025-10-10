import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { COLORS, FONT } from '@/constants';
import { ProjectEmployeesType } from '@/components/main/types';
import { Block, BlockContainer } from './Block';

type AssignedPersonsProps = {
  data: ProjectEmployeesType[]
}

export const AssignedPersons = ({ data }: AssignedPersonsProps) => {
  return (
    <BlockContainer>
      {data.map((contractor) => (
        <Block key={contractor.contractor_id}>
          <View style={styles.blockContent}>
            <View style={styles.assignTypeSection}>
              <Text style={styles.assignTypeLabel}>Организация:</Text>
              <Text style={styles.assignTypeValue}>{contractor.contractor_name}</Text>
            </View>
            
            {contractor.assign_types.map((assignType, assignIndex) => (
              <View key={assignIndex} style={styles.assignTypeSection}>
                <Text style={styles.assignTypeLabel}>{assignType.assign_type_name}:</Text>
                <Text style={styles.assignTypeValue}>
                  {assignType.fio || ''}
                </Text>
              </View>
            ))}
          </View>
        </Block>
      ))}
    </BlockContainer>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.backgroundWhite,
  },
  contentContainer: {
    padding: 16,
    gap: 12,
  },
  block: {
    backgroundColor: COLORS.white,
    borderRadius: 12,
    padding: 16,
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
    gap: 12,
  },
  assignTypeSection: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    flexWrap: 'wrap',
  },
  assignTypeLabel: {
    fontSize: 14,
    fontFamily: FONT.regular,
    color: COLORS.darkGray,
    marginRight: 8,
    flex: 0,
  },
  assignTypeValue: {
    fontSize: 14,
    fontFamily: FONT.regular,
    color: COLORS.dark,
    flex: 1,
    flexWrap: 'wrap',
  },
});
