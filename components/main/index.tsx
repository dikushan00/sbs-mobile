import { setPageHeaderData } from "@/services/redux/reducers/userApp";
import { setHideFooterNav } from "@/services/redux/reducers/app";
import React, { useEffect, useState } from "react";
import { RefreshControl, ScrollView, StyleSheet, View, Text, TouchableOpacity, Platform } from "react-native";
import { useDispatch } from "react-redux";
import { ProjectPage } from "../pages/project";
import { COLORS, FONT, SIZES } from "@/constants";
import { ProjectFiltersType, SelectedDataType } from "./types";
import { setPageSettings } from "@/services/redux/reducers/app";
import { getProjects } from "../pages/project/services";
import { ProjectType } from "../pages/project/services/types";
import { CustomLoader } from "../common/CustomLoader";

export const MainPage = () => {
  const dispatch = useDispatch();
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

  const getProjectTypeColor = (projectTypeName: string): string => {
    const typeName = projectTypeName.toLowerCase();
    if (typeName.includes('черновая') || typeName.includes('чернов')) {
      return '#6C757D'; // Серый для черновой
    } else if (typeName.includes('чистовая') || typeName.includes('чистов')) {
      return '#4ECDC4'; // Бирюзовый для чистовой
    } else if (typeName.includes('стяжка') || typeName.includes('стяж')) {
      return '#95E1D3'; // Светло-бирюзовый для косметической
    } else if (typeName.includes('капитальная') || typeName.includes('капитальн')) {
      return '#F38181'; // Розовый для капитальной
    } else if (typeName.includes('элитная') || typeName.includes('элит')) {
      return '#AA96DA'; // Фиолетовый для элитной
    } else if (typeName.includes('дизайнерская') || typeName.includes('дизайн')) {
      return '#FCBAD3'; // Светло-розовый для дизайнерской
    } else {
      return COLORS.primaryLight; // По умолчанию
    }
  };

  const renderProjectCard = (project: ProjectType) => (
    <TouchableOpacity
      key={project.project_id}
      style={styles.projectCard}
      onPress={() => handleProjectSelect(project)}
    >
      <View style={styles.projectHeader}>
        <Text style={styles.projectName}>{project.resident_name}</Text>
        {project.can_sign && !project.is_signed && <View style={styles.statusButton}>
          <Text style={styles.statusText}>На подписании</Text>
        </View>}
      </View>
      
      <View style={styles.projectDetails}>
        <View style={styles.projectTypeContainer}>
          <Text style={styles.detailText}>Тип проекта: </Text>
          <View style={[styles.projectTypeBadge, { backgroundColor: getProjectTypeColor(project.project_type_name) }]}>
            <Text style={styles.projectTypeText}>{project.project_type_name}</Text>
          </View>
        </View>
        <View style={styles.blocksContainer}>
          <Text style={styles.detailText}>Подъезды: </Text>
          <View style={styles.blocksList}>
            {project.blocks.split(' / ').map((block, index) => (
              <View key={index} style={styles.blockBadge}>
                <Text style={styles.blockText}>{block.trim()}</Text>
              </View>
            ))}
          </View>
        </View>
        <Text style={styles.detailText}>
          Период: <Text style={styles.detailTextValue}>{project.start_date} - {project.finish_date}</Text>
        </Text>
      </View>
    </TouchableOpacity>
  );

  if (showProjectPage && selectedData) {
    return (
      <ProjectPage
        selectedData={selectedData}
        projectId={projectId}
        onBack={handleBackToFilters}
        filters={filters}
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
  },
  projectHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  projectName: {
    fontSize: SIZES.large,
    fontFamily: FONT.medium,
    color: COLORS.black,
    flex: 1,
    marginRight: 12,
  },
  statusButton: {
    backgroundColor: '#fff3cd',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
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
  },
  projectTypeBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 6,
  },
  projectTypeText: {
    fontSize: SIZES.small,
    fontFamily: FONT.medium,
    color: COLORS.white,
  },
  blocksContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    flexWrap: 'wrap',
  },
  blocksList: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    flexWrap: 'wrap',
  },
  blockBadge: {
    backgroundColor: '#E9ECEF',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
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
});
