import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { COLORS, FONT, SIZES } from '@/constants';
import { Tabulation } from '@/components/main/types';
import { Icon } from '@/components/Icon';
import { Grid } from '@/components/common/Grid';
import { useDispatch } from 'react-redux';
import { setPageSettings } from '@/services/redux/reducers/app';

interface ProjectPageProps {
  tabulations: Tabulation[];
  projectInfo: {
    project_name: string;
    project_type_name: string;
    start_date: string;
    finish_date: string;
    entrance: number;
    block_name: string;
  };
  onTabPress: (tab: Tabulation) => void;
  onBack?: () => void;
}

// Icon mapping for different grant codes
const getIconForGrantCode = (grantCode: string) => {
  const iconMap: { [key: string]: string } = {
    'M__ProjectFormInfoTab': 'info',
    'EntranceSchema': 'map',
    'M__ProjectFormWorkTab': 'map',
    'M__ProjectFormMaterialTab': 'materials',
    'M__ProjectFormRemontCostTab': 'payment',
    'M__ProjectFormDocumentTab': 'document',
    'M__ProjectFormStagesTab': 'flag',
  };
  return iconMap[grantCode] || 'info';
};

export const ProjectPage: React.FC<ProjectPageProps> = ({
  tabulations,
  projectInfo,
  onTabPress,
  onBack,
}) => {
  const dispatch = useDispatch();
  const [selectedTab, setSelectedTab] = useState<string>('');

  const handleTabPress = (tab: Tabulation) => {
    setSelectedTab(tab.grant_code);
    onTabPress(tab);
  };

  useEffect(() => {
    dispatch(setPageSettings({ backBtn: true, goBack: onBack }));
  }, [])

  const renderProjectInfoBlock = () => {
    const generalTab = tabulations.find(tab => tab.grant_code === 'M__ProjectFormInfoTab');
    if (!generalTab) return null;

    return (
      <View
        style={styles.projectInfoBlock}
      >
        <View style={styles.projectInfoHeader}>
          <Text style={styles.projectName}>{projectInfo.project_name}</Text>
          <Icon name="folder" width={24} height={24} fill={COLORS.primary} />
        </View>
        
        <View style={styles.projectDetails}>
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Тип проекта:</Text>
            <Text style={styles.detailValue}>{projectInfo.project_type_name}</Text>
          </View>
          
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Период:</Text>
            <Text style={styles.detailValue}>
              {projectInfo.start_date} - {projectInfo.finish_date}
            </Text>
          </View>
          
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Подъезд:</Text>
            <Text style={styles.detailValue}>
              Подъезд {projectInfo.entrance}, Блок {projectInfo.block_name}
            </Text>
          </View>
        </View>
      </View>
    );
  };

  const renderTabGrid = () => {
    return (
      <Grid
        data={tabulations}
        numColumns={2}
        spacing={16}
        rowSpacing={16}
        renderItem={(tab) => (
          <TouchableOpacity
            key={tab?.grant_id}
            style={styles.tabBlock}
            onPress={() => handleTabPress(tab)}
          >
            <View style={styles.tabContent}>
              <Text style={styles.tabName}>{tab?.grant_name}</Text>
              <Icon 
                name={getIconForGrantCode(tab?.grant_code) as any} 
                width={20} 
                height={20} 
                fill={COLORS.primary} 
              />
            </View>
          </TouchableOpacity>
        )}
      />
    );
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.contentContainer}>
      {renderProjectInfoBlock()}
      {renderTabGrid()}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  contentContainer: {
    padding: 16,
    paddingBottom: 100,
  },
  projectInfoBlock: {
    backgroundColor: COLORS.white,
    borderRadius: 12,
    padding: 20,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 0,
    },
    shadowOpacity: 0.05,
    shadowRadius: 15,
    elevation: 0,
  },
  projectInfoHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  projectName: {
    fontSize: SIZES.large,
    fontFamily: FONT.regular,
    color: COLORS.black,
    flex: 1,
  },
  projectDetails: {
    gap: 8,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  detailLabel: {
    fontSize: SIZES.medium,
    fontFamily: FONT.regular,
    color: COLORS.darkGray,
    marginRight: 8,
  },
  detailValue: {
    fontSize: SIZES.medium,
    fontFamily: FONT.regular,
    color: COLORS.dark,
    flex: 1,
  },
  tabBlock: {
    backgroundColor: COLORS.white,
    borderRadius: 12,
    padding: 16,
    minHeight: 80,
    justifyContent: 'center',
    flex: 1,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 0,
    },
    shadowOpacity: 0.05,
    shadowRadius: 15,
    elevation: 0,
  },
  tabContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  tabName: {
    fontSize: SIZES.medium,
    fontFamily: FONT.regular,
    color: COLORS.dark,
    flex: 1,
    textAlign: 'left',
  },
});
