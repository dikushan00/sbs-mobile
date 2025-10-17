import { setPageHeaderData } from "@/services/redux/reducers/userApp";
import { setHideFooterNav } from "@/services/redux/reducers/app";
import React, { useEffect, useState } from "react";
import { RefreshControl, ScrollView, StyleSheet, View } from "react-native";
import { useDispatch } from "react-redux";
import { CustomButton } from "../common/CustomButton";
import { MainPageFilters } from "./Filters";
import { ProjectPage } from "../pages/project";
import { COLORS } from "@/constants";
import { SelectedDataType } from "./types";
import { setPageSettings } from "@/services/redux/reducers/app";

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

  useEffect(() => {
    dispatch(
      setPageHeaderData({
        title: "Проекты",
        desc: "",
      })
    );
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

  const isAllFiltersFilled = () => {
    return filters.resident_id && filters.project_type_id && filters.project_entrance_id;
  };

  const handleContinue = () => {
    if (!isAllFiltersFilled()) return;
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
            onRefresh={() => {}}
          />
        }
        contentContainerStyle={{ paddingBottom: 100 }}
        style={styles.container}
      >
        <MainPageFilters filters={filters} onChange={onFiltersChange} />
      </ScrollView>
      
      <View style={styles.buttonContainer}>
        <CustomButton
          title="Продолжить"
          type="contained"
          onClick={handleContinue} wrapperStyles={{height: 46}}
          disabled={!isAllFiltersFilled()}
          allWidth={true}
        />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  wrapper: {
    flex: 1,
    backgroundColor: COLORS.backgroundWhite
  },
  container: { 
    padding: 16, 
    flex: 1, 
    gap: 15 
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
