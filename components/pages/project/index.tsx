import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { COLORS, FONT, SIZES } from '@/constants';
import { ProjectFiltersType, ProjectInfoResponseType, Tabulation } from '@/components/main/types';
import { Icon } from '@/components/Icon';
import { Grid } from '@/components/common/Grid';
import { useDispatch } from 'react-redux';
import { setPageSettings } from '@/services/redux/reducers/app';
import { setPageHeaderData as setUserPageHeaderData } from '@/services/redux/reducers/userApp';
import { 
  GeneralTab, 
  WorkTab, 
  MaterialsTab, 
  PaymentsTab, 
  DocumentsTab, 
  StagesTab 
} from './tabs';
import { FloorSchemaTab } from './tabs/FloorSchemaTab';
import { getFloorTabs, getIsProjectSBS, getProjectInfo } from '@/components/main/services';
import { CustomLoader } from '@/components/common/CustomLoader';

interface ProjectPageProps {
  projectId: number | null,
  selectedData?: any;
  onBack?: () => void;
  filters: ProjectFiltersType
}

const getIconForGrantCode = (grantCode: string) => {
  const iconMap: { [key: string]: string } = {
    'M__ProjectFormInfoTab': 'info',
    'EntranceSchema': 'map',
    'M__ProjectFormWorkTab': 'work',
    'M__ProjectFormMaterialTab': 'materials',
    'M__ProjectFormRemontCostTab': 'payment',
    'M__ProjectFormDocumentTab': 'document',
    'M__ProjectFormStagesTab': 'flag',
  };
  return iconMap[grantCode] || 'info';
};

export const ProjectPage: React.FC<ProjectPageProps> = ({
  projectId, selectedData,
  onBack, filters
}) => {
  const dispatch = useDispatch();
  const [isFetching, setIsFetching] = useState(false);
  const [tabsFetching, setTabsFetching] = useState(false);
  const [tabulations, setTabulations] = useState<Tabulation[]>([]);
  const [currentTab, setCurrentTab] = useState<Tabulation | null>(null);
  const [projectInfo, setProjectInfo] = useState<ProjectInfoResponseType | null>(null);
  const [isSBS, setIsSBS] = useState(false);

  const getTabs = async () => {
    if (tabulations?.length) return;
    setTabsFetching(true)
    const res = await getFloorTabs();
    setTabsFetching(false)
    if (!res?.length) return;
    setTabulations(res || []);
  };

  useEffect(() => {
    getTabs()
  }, [])

  useEffect(() => {
    const getIsSBS = async () => {
      if(!projectId) return setIsSBS(false)
      const res = await getIsProjectSBS(projectId);
      setIsSBS(!!res?.is_sbs);
    };
    getIsSBS()
  }, [projectId])

  const handleTabPress = (tab: Tabulation) => {
    setCurrentTab(tab);
    dispatch(setUserPageHeaderData({
      title: tab.grant_name,
      desc: "",
    }));
  };

  useEffect(() => {
    if(projectId) {
      setIsFetching(true)
      getProjectInfo(projectId).then(res => {
        setIsFetching(false)
        setProjectInfo(res || null)
      })
    }
  }, [projectId])

  const backToProject = () => {
    setCurrentTab(null);
    dispatch(setUserPageHeaderData({
      title: "Ведение проекта",
      desc: "",
    }));
  }

  useEffect(() => {
    if (currentTab) {
      dispatch(setPageSettings({ 
        backBtn: true, 
        goBack: () => {
          setCurrentTab(null);
          dispatch(setUserPageHeaderData({
            title: "Ведение проекта",
            desc: "",
          }));
        }
      }));
    } else {
      dispatch(setPageSettings({ backBtn: true, goBack: onBack }));
    }
  }, [currentTab, onBack])

  const renderTabContent = () => {
    if (!currentTab) return null;

    switch (currentTab.grant_code) {
      case 'M__ProjectFormInfoTab':
        return <GeneralTab 
          projectId={projectId}
          projectInfo={projectInfo} 
          isSBS={isSBS}
          onBackToProject={() => {
            setCurrentTab(null);
            dispatch(setUserPageHeaderData({
              title: "Ведение проекта",
              desc: "",
            }));
          }}
        />;
      case 'EntranceSchema':
        return <FloorSchemaTab filters={filters} onBack={backToProject} selectedData={selectedData} />;
      case 'M__ProjectFormWorkTab':
        return <WorkTab filters={filters} selectedData={selectedData} />;
      case 'M__ProjectFormMaterialTab':
        return <MaterialsTab filters={filters} onBack={backToProject} />;
      case 'M__ProjectFormRemontCostTab':
        return <PaymentsTab filters={filters} onBack={backToProject} project_id={projectId} />;
      case 'M__ProjectFormDocumentTab':
        return <DocumentsTab filters={filters} onBack={backToProject} />;
      case 'M__ProjectFormStagesTab':
        return <StagesTab filters={filters} onBack={backToProject} project_id={projectId} selectedData={selectedData}/>;
      default:
        return null
    }
  };

  const renderProjectInfoBlock = () => {
    if(!projectInfo) return
    return (
      <View
        style={styles.projectInfoBlock}
      >
        <View style={styles.projectInfoHeader}>
          <Text style={styles.projectName}>{projectInfo.data?.project_name}</Text>
          <Icon name="folder" width={24} height={24} fill={COLORS.primary} />
        </View>
        
        <View style={styles.projectDetails}>
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Тип проекта:</Text>
            <Text style={styles.detailValue}>{projectInfo.data?.project_type_name}</Text>
          </View>
          
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Период:</Text>
            <Text style={styles.detailValue}>
              {projectInfo.data?.start_date} - {projectInfo.data?.finish_date}
            </Text>
          </View>
          
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Подъезд:</Text>
            <Text style={styles.detailValue}>
              Подъезд {selectedData?.entrance}, Блок {selectedData?.block_name}
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
                fill={COLORS.primaryLight} 
              />
            </View>
          </TouchableOpacity>
        )}
      />
    );
  };

  if (currentTab) {
    return renderTabContent();
  }

  if(isFetching || tabsFetching)
    return <CustomLoader />
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
