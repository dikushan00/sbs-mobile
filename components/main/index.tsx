import { setPageHeaderData } from "@/services/redux/reducers/userApp";
import { setHideFooterNav } from "@/services/redux/reducers/app";
import React, { useEffect, useState } from "react";
import { RefreshControl, ScrollView, StyleSheet, View, Text, TouchableOpacity } from "react-native";
import { useDispatch } from "react-redux";
import { ProjectPage } from "../pages/project";
import { COLORS, FONT, SIZES } from "@/constants";
import { SelectedDataType } from "./types";
import { setPageSettings } from "@/services/redux/reducers/app";
import { getProjectList } from "../pages/project/services";
import { ProjectCombinedType } from "../pages/project/services/types";

export const MainPage = () => {
  const dispatch = useDispatch();
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [projectId, setProjectId] = useState<number | null>(null);
  const [selectedData, setSelectedData] = useState<Partial<SelectedDataType> | null>(null);
  const [filters, setFilters] = useState({
    resident_id: null,
    project_type_id: null,
    project_entrance_id: null,
  });
  const [showProjectPage, setShowProjectPage] = useState(false);
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  const [projectList, setProjectList] = useState<ProjectCombinedType[]>([]);

  useEffect(() => {
    dispatch(
      setPageHeaderData({
        title: "Проекты",
        desc: "",
      })
    );
  }, [])

  useEffect(() => {
    getProjectList().then((res) => {
      setProjectList(res || [])
    })
  }, [])

  const onFiltersChange = (key: string, value: any, row: any) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
    if (!!row)
      setSelectedData(selectedData ? { ...selectedData, ...row } : { ...row });

    if (key === "resident_id") {
      setFilters({
        resident_id: value,
        project_type_id: null,
        project_entrance_id: null,
      });
      setProjectId(null);
      if (selectedData)
        setSelectedData((prev: any) => ({ ...prev, entrance_full_name: null }));
      if (!value) setSelectedData(null);
    }
    if (key === "project_type_id") {
      setFilters((prev) => ({ ...prev, project_entrance_id: null }));
      setProjectId(null);
      if (selectedData)
        setSelectedData((prev: any) => ({ ...prev, entrance_full_name: null }));
    }
    if (key === "project_entrance_id") {
      setProjectId(row?.project_id);
    }
  };

  const handleRefresh = async () => {
    setIsRefreshing(true);
    setRefreshTrigger(prev => prev + 1);
    setIsRefreshing(false);
  };

  const isAllFiltersFilled = () => {
    return filters.resident_id && filters.project_type_id && filters.project_entrance_id;
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

  const handleProjectSelect = (project: ProjectCombinedType) => {
    setProjectId(project.project_id);
    setSelectedData({
      entrance_full_name: project.entrances_info?.map(entrance => `${entrance.entrance} ${entrance.block_name || ''}`).join(' ') || '',
      ...project
    });
    handleContinue()
  };

  const renderProjectCard = (project: ProjectCombinedType) => (
    <TouchableOpacity
      key={project.project_id}
      style={styles.projectCard}
      onPress={() => handleProjectSelect(project)}
    >
      <View style={styles.projectHeader}>
        <Text style={styles.projectName}>{project.resident_name}</Text>
        {/* <View style={styles.statusButton}>
          <Text style={styles.statusText}>На подписании</Text>
        </View> */}
      </View>
      
      <View style={styles.projectDetails}>
        <Text style={styles.detailText}>Тип проекта: <Text style={styles.detailTextValue}>{project.project_type_name}</Text></Text>
        <Text style={styles.detailText}>
          Подъезды: <Text style={styles.detailTextValue}>{project.entrances_info?.map(entrance => `${entrance.entrance} ${entrance.block_name || ''}`).join(' ') || 'Не указаны'}</Text>
        </Text>
        <Text style={styles.detailText}>
          Период: <Text style={styles.detailTextValue}>{project.min_start_date} - {project.max_finish_date}</Text>
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
      <ScrollView
        refreshControl={
          <RefreshControl
            refreshing={isRefreshing}
            onRefresh={handleRefresh}
          />
        }
        contentContainerStyle={{ paddingBottom: 100 }}
        style={styles.container}
      >
        {projectList.map(renderProjectCard)}
      </ScrollView>
      
      {/* <View style={styles.buttonContainer}>
        <CustomButton
          title="Продолжить"
          type="contained"
          onClick={handleContinue} wrapperStyles={{height: 46}}
          disabled={!isAllFiltersFilled()}
          allWidth={true}
        />
      </View> */}
    </View>
  );
};

const styles = StyleSheet.create({
  wrapper: {
    flex: 1,
    backgroundColor: COLORS.background
  },
  container: { 
    padding: 16, 
    paddingTop: 0,
    flex: 1, 
    gap: 15 
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
    gap: 4,
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
