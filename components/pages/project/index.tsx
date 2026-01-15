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
import { getIsProjectSBS, getProjectInfo } from '@/components/main/services';
import { CustomLoader } from '@/components/common/CustomLoader';
import { Contracts } from './blocks';
import { OKKTab } from './tabs/OkkTab';
import { getProjectData, tabsNames } from "../../pages/project/services";
import { GrantTabType, ProjectType } from './services/types';
import { FloorSchemaChessTab } from './tabs/FloorSchemaChessTab';

interface ProjectPageProps {
  projectId: number | null,
  selectedData?: any;
  onBack?: () => void;
  filters: ProjectFiltersType;
  initialTab?: string; // grant_code from tabNames (e.g., 'M__ProjectFormMobileAgreement')
  onInitialTabConsumed?: () => void;
  onTabExited?: () => void; // Called when exiting a tab to project page (not back to list)
}

const getIconForGrantCode = (grantCode: string) => {
  const iconMap: { [key: string]: string } = {
    'M__ProjectFormMobileOkk': 'checkCircleBlue',
    'M__ProjectFormInfoTab': 'info',
    'M__ProjectFormMobileFloorMap': 'map',
    'M__ProjectFormWorkTab': 'work',
    'M__ProjectFormMaterialTab': 'materials',
    'M__ProjectFormRemontCostTab': 'payment',
    'M__ProjectFormDocumentTab': 'document',
    'M__ProjectFormStagesTab': 'flag',
    'M__ProjectFormMobileAgreement': 'documentPen',
  };
  return iconMap[grantCode] || 'info';
};

export const ProjectPage: React.FC<ProjectPageProps> = ({
  projectId, selectedData,
  onBack, filters,
  initialTab, onInitialTabConsumed, onTabExited
}) => {
  const dispatch = useDispatch();
  const [isFetching, setIsFetching] = useState(false);
  const [tabsFetching, setTabsFetching] = useState(false);
  const [tabulations, setTabulations] = useState<GrantTabType[]>([]);
  const [currentTab, setCurrentTab] = useState<GrantTabType | null>(null);
  const [projectData, setProjectData] = useState<ProjectType | null>(null);
  const [projectInfo, setProjectInfo] = useState<ProjectInfoResponseType | null>(null);
  const [isSBS, setIsSBS] = useState(false);

  const getTabs = async () => {
    if (tabulations?.length || !projectId) return;
    setTabsFetching(true)
    const res = await getProjectData(projectId);
    setTabsFetching(false)
    if (!res) return;
    setProjectData(res?.project)
    setTabulations(
      res?.grant_tabs
        ?.filter(tab => tabsNames.includes(tab.grant_code))
        ?.sort((a, b) => {
          return tabsNames.indexOf(a.grant_code) - tabsNames.indexOf(b.grant_code)
        }) || []
    );
  };

  useEffect(() => {
    getTabs()
  }, [])

  // Handle initialTab from notification deep link
  useEffect(() => {
    if (!initialTab || !tabulations.length) return;
    const targetTab = tabulations.find(tab => tab.grant_code === initialTab);
    if (targetTab) {
      handleTabPress(targetTab as Tabulation);
      // Clear initialTab after consuming it
      onInitialTabConsumed?.();
    }
  }, [initialTab, tabulations])

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
    onTabExited?.(); // Notify parent to reset deep link tracking
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
          onTabExited?.(); // Notify parent to reset deep link tracking
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
          projectInfo={projectInfo} 
          onBackToProject={() => {
            setCurrentTab(null);
            dispatch(setUserPageHeaderData({
              title: "Ведение проекта",
              desc: "",
            }));
          }}
        />;
        
      case 'M__ProjectFormMobileAgreement':
        return <Contracts project_id={projectId} isSBS={isSBS} />;
      case 'M__ProjectFormMobileOkk':
        return <OKKTab onBack={backToProject} selectedData={selectedData} />;
      case 'M__ProjectFormMobileFloorMap':
        return <FloorSchemaChessTab onBack={backToProject} selectedData={selectedData} />;
      case 'M__ProjectFormWorkTab':
        return <WorkTab filters={filters} selectedData={selectedData} />;
      case 'M__ProjectFormMaterialTab':
        return <MaterialsTab filters={filters} onBack={backToProject} selectedData={selectedData} />;
      case 'M__ProjectFormRemontCostTab':
        return <PaymentsTab filters={filters} project_id={projectId} selectedData={selectedData} />;
      case 'M__ProjectFormDocumentTab':
        return <DocumentsTab filters={filters} isSBS={isSBS} selectedData={selectedData} />;
      case 'M__ProjectFormStagesTab':
        return <StagesTab filters={filters} onBack={backToProject} project_id={projectId} selectedData={selectedData}/>;
      default:
        return null
    }
  }

  const renderProjectInfoBlock = () => {
    const isSigned = projectData?.is_signed;
    
    return (
      <View style={styles.projectInfoBlock}>
        {/* Header with name and folder icon */}
        <View style={styles.projectInfoHeader}>
          <Text style={styles.projectName}>{projectData?.resident_name}</Text>
          <View style={styles.folderIconWrapper}>
            <Icon name="folder" width={22} height={22} fill={COLORS.primarySecondary} />
          </View>
        </View>
        {/* Date range and status row */}
        <View style={styles.dateStatusWrapper}>
          <View style={styles.dateStatusRow}>
            <View style={styles.dateBadge}>
              <Icon name="calendar2" width={14} height={14} fill={'#242424'} />
              <Text style={styles.dateText}>{projectData?.start_date}</Text>
            </View>
            <View style={styles.dateBadge}>
              <Icon name="calendar2" width={14} height={14} fill={'#242424'} />
              <Text style={styles.dateText}>{projectData?.finish_date}</Text>
            </View>
          </View>
          {isSigned !== undefined && (
            <View style={[styles.statusBadge, isSigned ? styles.statusSigned : styles.statusPending]}>
              <Text style={styles.statusText}>
                {isSigned ? 'Подписан' : 'На подписании'}
              </Text>
            </View>
          )}
        </View>

        {/* Project type row */}
        <View style={styles.infoRow}>
          <Icon name="noteStar" width={14} height={14} fill={COLORS.primarySecondary} />
          <Text style={styles.infoText}>
            {projectData?.project_type_name || projectInfo?.data?.project_type_name || 'Не указан'}
          </Text>
        </View>

        {/* Blocks row */}
        <View style={styles.blocksRow}>
          <Icon name="residentCloud" width={14} height={14} fill={COLORS.primarySecondary} />
          {projectData?.blocks ? (
            <View style={styles.blocksList}>
              {projectData.blocks.split(' / ').map((block, index) => {
                const entranceNumber = block.trim().split(' ')[0];
                const blockName = block.trim().split(' ')[1];
                return (<View key={index} style={styles.blockBadge}>
                  <Text style={styles.blockIndex}>{entranceNumber}</Text>
                  <Text style={styles.blockText}>{blockName}</Text>
                </View>)
              })}
            </View>
          ) : (
            <Text style={styles.infoText}>Подъезды не указаны</Text>
          )}
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
                fill={COLORS.primarySecondary} 
              />
              {tab.grant_code === 'M__ProjectFormMobileOkk' && <View style={{position: 'absolute', bottom: -23, left: 0,flexDirection: 'row', gap: 5, alignItems: 'center'}}>
                {!!tab.okk_call && <View style={{flexDirection: 'row', alignItems: 'center', gap: 3,
                backgroundColor: COLORS.background, padding: 3, borderRadius: 10, }}>
                  <Icon name='clockFilled' fill={'#FFAE4C'} width={12} height={12} />
                  <Text style={{fontSize: 12}}>{tab.okk_call}</Text>
                </View>}
                {!!tab.okk_def && <View style={{flexDirection: 'row', alignItems: 'center', gap: 3, 
                backgroundColor: COLORS.background, padding: 3, borderRadius: 10, }}>
                  <Icon name='info' fill='red' width={12} height={12} />
                  <Text style={{fontSize: 12}}>{tab.okk_def}</Text>
                </View>}
              </View>}
              {tab.grant_code === 'M__ProjectFormDocumentTab' && <View style={{position: 'absolute', bottom: -23, left: 0,flexDirection: 'row', gap: 5, alignItems: 'center'}}>
                {!!tab.not_signed_cnt && <View style={{flexDirection: 'row', alignItems: 'center', gap: 3,
                backgroundColor: COLORS.background, padding: 3, borderRadius: 10, }}>
                  <Icon name='clockFilled' fill={'#FFAE4C'} width={12} height={12} />
                  <Text style={{fontSize: 12}}>{tab.not_signed_cnt}</Text>
                </View>}
                {!!tab.is_signed_cnt && <View style={{flexDirection: 'row', alignItems: 'center', gap: 3,
                backgroundColor: COLORS.background, padding: 3, borderRadius: 10, }}>
                  <Icon name='checkCircle' fill={'green'} width={12} height={12} />
                  <Text style={{fontSize: 12}}>{tab.is_signed_cnt}</Text>
                </View>}
              </View>}
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
      {projectData?.can_sign && !projectData?.is_signed && <View style={{flexDirection: 'row', gap: 10, alignItems: 'center', 
          backgroundColor: '#F5EECA', padding: 15, borderRadius: 12, marginBottom: 15}}>
        <View style={{borderRadius: '50%', backgroundColor: '#BBBE31', padding: 5}}>
          <Icon name='clock' fill='#fff' />
        </View>
        <Text>Договор на подписании</Text>
      </View>}
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
    padding: 16,
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
    alignItems: 'flex-start',
    marginBottom: 15,
  },
  projectName: {
    fontSize: 16,
    fontFamily: FONT.medium,
    color: '#1a202c',
    flex: 1,
    lineHeight: 26,
  },
  folderIconWrapper: {
  },
  dateStatusWrapper: {flexDirection: 'row', justifyContent: 'flex-start', alignItems: 'center', gap: 10, flexWrap: 'wrap'},
  dateStatusRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: 8,
    backgroundColor: '#F0F0F0',
    borderRadius: 8,
    paddingHorizontal: 7,
    paddingVertical: 5,
  },
  dateBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  dateText: {
    fontSize: 12,
    fontFamily: FONT.medium,
    color: '#242424',
  },
  statusBadge: {
    paddingHorizontal: 7,
    paddingVertical: 5,
    borderRadius: 8,
  },
  statusSigned: {
    backgroundColor: '#48BB78',
  },
  statusPending: {
    backgroundColor: '#FF8D28',
  },
  statusText: {
    fontSize: 12,
    fontFamily: FONT.medium,
    color: '#FFFFFF',
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 15,
    marginTop: 10,
  },
  infoText: {
    fontSize: 14,
    fontFamily: FONT.regular,
    color: '#242424',
    flex: 1,
  },
  blocksRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  blocksList: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    flexWrap: 'wrap',
    flex: 1,
  },
  blockBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
  },
  blockIndex: {
    fontSize: 12,
    fontFamily: FONT.medium,
    color: '#242424',
    backgroundColor: '#F0F0F0',
    paddingHorizontal: 5,
    paddingVertical: 0,
    borderRadius: 4,
    overflow: 'hidden',
  },
  blockText: {
    fontSize: 12,
    fontFamily: FONT.medium,
    color: '#242424',
  },
  tabBlock: {
    backgroundColor: COLORS.white,
    borderRadius: 12,
    padding: 16,
    minHeight: 80,
    justifyContent: 'center',
    flex: 1,
    shadowColor: '#404040',
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
