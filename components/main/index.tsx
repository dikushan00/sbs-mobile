import { setPageHeaderData } from "@/services/redux/reducers/userApp";
import { setHideFooterNav, showCustomWebViewMode } from "@/services/redux/reducers/app";
import React, { useEffect, useState, useRef } from "react";
import {
  Platform,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { useDispatch } from "react-redux";
import { ProjectPage } from "../pages/project";
import { COLORS, FONT, SIZES } from "@/constants";
import { ProjectFiltersType, SelectedDataType } from "./types";
import { setPageSettings } from "@/services/redux/reducers/app";
import { getProjects, tabNames } from "../pages/project/services";
import { ProjectType } from "../pages/project/services/types";
import { CustomLoader } from "../common/CustomLoader";
import { OuraFab } from "./OuraFab";
import { useRoute, useNavigation } from "@react-navigation/native";
import { Icon } from "../Icon";
import { MainModeTabContent } from "./MainModeTabContent";

export const MainPage = () => {
  const dispatch = useDispatch();
  const route = useRoute();
  const navigation = useNavigation();
  const routeParams = route.params as { project_id?: number; tab?: keyof typeof tabNames, mainMode?: boolean } | undefined;
  const [isFetching, setIsFetching] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [projectId, setProjectId] = useState<number | null>(null);
  const [selectedData, setSelectedData] = useState<Partial<SelectedDataType> | null>(null);
  const [filters, setFilters] = useState<ProjectFiltersType>({
    resident_id: null,
    project_type_id: null,
    project_entrance_id: null,
  });
  const [showProjectPage, setShowProjectPage] = useState(false);
  const [projectList, setProjectList] = useState<ProjectType[]>([]);
  const [initialTab, setInitialTab] = useState<string | undefined>(undefined);
  // Track which deep link params we've already handled (to avoid re-handling the same notification)
  const lastHandledParamsRef = useRef<string | null>(null);

  useEffect(() => {
    dispatch(
      setPageHeaderData({
        title: "Проекты",
        desc: "",
      })
    );
  }, [])

  const getProjectsData = async () => {
    const res = await getProjects()
    setProjectList(res || [])
  }

  useEffect(() => {
    setIsFetching(true)
    getProjects().then((res) => {
      setProjectList(res || [])
      setIsFetching(false)
    }).finally(() => setIsFetching(false))
  }, [])

  // Handle deep link from notification (project_id + tab)
  useEffect(() => {
    if (!projectList.length || !routeParams?.project_id) return;

    // Create a unique key for these params to avoid re-handling the same notification
    const paramsKey = `${routeParams.project_id}_${routeParams.tab || ''}`;
    if (lastHandledParamsRef.current === paramsKey) return;

    const targetProject = projectList.find(p => p.project_id === routeParams.project_id);
    if (!targetProject) return;

    // Mark these params as handled
    lastHandledParamsRef.current = paramsKey;

    // Set initial tab if provided
    if (routeParams.tab && tabNames[routeParams.tab]) {
      setInitialTab(tabNames[routeParams.tab]);
    }

    // Auto-select the project
    handleProjectSelect(targetProject);
  }, [projectList, routeParams])

  const handleRefresh = async () => {
    setIsRefreshing(true);
    await getProjectsData()
    setIsRefreshing(false);
  };

  const handleContinue = () => {
    setShowProjectPage(true);
    dispatch(setHideFooterNav(true));
    dispatch(
      setPageHeaderData({
        title: "Ведение проекта",
        desc: "",
      })
    );
  };

  const handleBackToFilters = () => {
    setShowProjectPage(false);
    setInitialTab(undefined); // Clear initial tab when going back
    lastHandledParamsRef.current = null; // Reset so next notification can be handled
    // Clear navigation params so they don't persist
    // @ts-ignore
    navigation.setParams({ project_id: undefined, tab: undefined });
    dispatch(setHideFooterNav(false));
    dispatch(
      setPageHeaderData({
        title: "Проекты",
        desc: "",
      })
    );
    dispatch(setPageSettings({ backBtn: false, goBack: null }));
  };

  const handleProjectSelect = (project: ProjectType) => {
    setProjectId(project.project_id);
    setFilters(prev => ({...prev, resident_id: project.resident_id, project_type_id: project.project_type_id}))
    setSelectedData({
      ...project
    });
    handleContinue()
  };

  const renderProjectCard = (project: ProjectType) => (
    <TouchableOpacity
      key={project.project_id}
      style={styles.projectCard}
      onPress={() => handleProjectSelect(project)}
    >
      <View>
        <View style={styles.projectHeader}>
          <Text style={styles.projectName}>{project.resident_name}</Text>
          {project.can_sign && !project.is_signed && <View style={styles.statusButton}>
            <Text style={styles.statusText}>На подписании</Text>
          </View>}
        </View>
        
        <View style={styles.projectDetails}>
          <View style={styles.projectTypeContainer}>
            <Text style={styles.projectTypeText}>{project.project_type_name}</Text>
          </View>
          <View style={styles.blocksRow}>
            <Text>Подъезды:</Text>
            {project?.blocks && (
              <View style={styles.blocksList}>
                {project.blocks.split(' / ').map((block, index) => {
                  const entranceNumber = block.trim().split(' ')[0];
                  const blockName = block.trim().split(' ')[1];
                  return (<View key={index} style={styles.blockBadge}>
                    <Text style={styles.blockIndex}>{entranceNumber}</Text>
                    <Text style={styles.blockText}>{blockName}</Text>
                  </View>)
                })}
              </View>
            )}
          </View>
          <View style={styles.dateRow}>
            <Text>Период:</Text>
            <View style={styles.dateBadge}>
              <Text style={styles.detailTextValue}>{project.start_date}</Text>
              <Text style={styles.detailTextValue}>-</Text>
              <Text style={styles.detailTextValue}>{project.finish_date}</Text>
            </View>
          </View>
        </View>
      </View>
      <View style={styles.arrowIconContainer}>
        <Icon name="arrowRightBlack" width={14} height={14} fill={'#757575'} />
      </View>
    </TouchableOpacity>
  );

  const handleTabExited = () => {
    // Reset deep link tracking so next notification can work
    lastHandledParamsRef.current = null;
    // Clear navigation params
    // @ts-ignore
    navigation.setParams({ project_id: undefined, tab: undefined });
  };

  const handleMainModeReset = () => {
    setShowProjectPage(false);
    setInitialTab(undefined);
    lastHandledParamsRef.current = null;
    setProjectId(null);
    setSelectedData(null);
    setFilters({
      resident_id: null,
      project_type_id: null,
      project_entrance_id: null,
    });
  };

  if (routeParams?.mainMode && routeParams?.tab && showProjectPage) {
    return (
      <MainModeTabContent
        currentTab={tabNames[routeParams.tab]}
        projectId={projectId}
        selectedData={selectedData}
        filters={filters}
        onReset={handleMainModeReset}
      />
    );
  }

  if (showProjectPage && selectedData) {
    return (
      <ProjectPage
        selectedData={selectedData}
        projectId={projectId}
        onBack={handleBackToFilters}
        filters={filters}
        initialTab={initialTab}
        onInitialTabConsumed={() => setInitialTab(undefined)}
        onTabExited={handleTabExited}
      />
    );
  }

  return (
    <View style={styles.wrapper}>
      {isFetching && <CustomLoader />}
      <ScrollView
        refreshControl={
          <RefreshControl
            refreshing={isRefreshing}
            onRefresh={handleRefresh}
          />
        }
        style={styles.container}
        contentContainerStyle={styles.contentContainer}
      >
        {projectList.map(renderProjectCard)}
      </ScrollView>

      <OuraFab
        bottom={20}
        onPress={() => dispatch(showCustomWebViewMode({ url: "https://oura.bi.group/" }))}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  wrapper: {
    flex: 1,
    backgroundColor: COLORS.background
  },
  container: { 
    paddingHorizontal: 16, 
    paddingTop: Platform.OS === 'ios' ? 0 : 16,
    flex: 1, 
    gap: 15 
  },
  contentContainer: {
    paddingBottom: 16,
  },
  projectCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    position: 'relative',
  },
  arrowIconContainer: {
    position: 'absolute',
    right: 16,
    top: '50%',
    height: 14,
    width: 14,
    transform: [{ translateY: 7 }],
  },
  projectHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  projectName: {
    fontSize: SIZES.medium,
    fontFamily: FONT.medium,
    color: COLORS.black,
    flex: 1,
    marginRight: 12,
  },
  statusButton: {
    backgroundColor: '#fff3cd',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
  },
  statusText: {
    fontSize: SIZES.small,
    fontFamily: FONT.regular,
    color: '#856404',
  },
  projectDetails: {
    gap: 8,
  },
  detailText: {
    fontSize: SIZES.regular,
    fontFamily: FONT.regular,
    color: COLORS.darkGray,
    lineHeight: 20,
  },
  detailTextValue: {
    fontSize: SIZES.regular,
    color: COLORS.black,
  },
  projectTypeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    flexWrap: 'wrap',
    backgroundColor: COLORS.primaryBackground,
    padding: 5,
    paddingHorizontal: 10,
    borderRadius: 8,
    alignSelf: 'flex-start',
  },
  projectTypeBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 6,
  },
  projectTypeText: {
    fontSize: 12,
    color: '#0075CA',
  },
  blocksContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    flexWrap: 'wrap',
  },
  blocksRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 7,
  },
  blocksList: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    flexWrap: 'wrap',
  },
  blockBadge: {
    paddingHorizontal: 2,
    paddingVertical: 4,
    borderRadius: 4,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
  },
  blockText: {
    fontSize: SIZES.small,
    fontFamily: FONT.regular,
    color: COLORS.black,
  },
  buttonContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: 10,
    paddingBottom: 20,
    paddingHorizontal: 16,
    backgroundColor: '#fff',
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
  dateRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  dateBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
});
