import { setPageHeaderData } from "@/services/redux/reducers/userApp";
import React, { useEffect, useState } from "react";
import { RefreshControl, ScrollView, StyleSheet } from "react-native";
import { useDispatch } from "react-redux";
import { CustomLoader } from "../common/CustomLoader";
import { MainPageFilters } from "./Filters";
import {
  getEntranceApartments,
  getFloorTabs,
  getIsProjectSBS,
} from "./services";

export const MainPage = () => {
  const dispatch = useDispatch();
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isFetching, setIsFetching] = useState(false);
  const [isSbs, setIsSbs] = useState(false);
  const [projectId, setProjectId] = useState<number | null>(null);
  const [selectedData, setSelectedData] = useState<any>(null);
  const [tabs, setTabs] = useState<any>(null);
  const [tab, setTab] = useState<string>("");
  const [floorsPlan, setFloorsPlan] = useState<any>(null);
  const [floorParamData, setFloorParamData] = useState<any>(null);
  const [filters, setFilters] = useState({
    resident_id: null,
    project_type_id: null,
    project_entrance_id: null,
  });

  useEffect(() => {
    dispatch(
      setPageHeaderData({
        title: "Проекты",
        desc: "",
      })
    );
  }, [])
  const getData = async (
    isRefreshing = false,
    controller?: AbortController
  ) => {};

  const getTabs = async () => {
    if (tabs?.length) return;
    const res = await getFloorTabs();
    if (!res?.length) return;
    setTabs(res || []);

    if (!tab) {
      setTab(res[0].grant_code);
    }
  };

  const getIsSBS = async (projectId: number) => {
    if (!projectId) return;
    const res = await getIsProjectSBS(projectId);
    setIsSbs(!!res?.is_sbs);
  };

  const getFloorsPlan = async () => {
    if (!filters?.project_entrance_id) {
      setFloorParamData(null);
      setFloorsPlan(null);
      return;
    }
    setIsFetching(true);
    const res = await getEntranceApartments(filters);
    setIsFetching(false);
    setFloorsPlan(res?.data || []);
  };

  const onFiltersChange = (key: string, value: any, row: any) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
    console.log(key, value, row);
    if (!!row)
      setSelectedData(selectedData ? { ...selectedData, ...row } : { ...row });

    if (key === "resident_id") {
      setFilters({
        resident_id: value,
        project_type_id: null,
        project_entrance_id: null,
      });
      setProjectId(null);
      setFloorsPlan(null);
      setFloorParamData(null);
      if (selectedData)
        setSelectedData((prev: any) => ({ ...prev, entrance_full_name: null }));
      if (!value) setSelectedData(null);
    }
    if (key === "project_type_id") {
      setFilters((prev) => ({ ...prev, project_entrance_id: null }));
      setProjectId(null);
      setFloorsPlan(null);
      setFloorParamData(null);
      if (selectedData)
        setSelectedData((prev: any) => ({ ...prev, entrance_full_name: null }));
    }
    if (key === "project_entrance_id") {
      setFloorParamData(null);
      setProjectId(row?.project_id);
      getIsSBS(row?.project_id);
      getFloorsPlan();
      getTabs();
    }
  };

  return (
    <ScrollView
      refreshControl={
        <RefreshControl
          refreshing={isRefreshing}
          onRefresh={() => getData(true)}
        />
      }
      contentContainerStyle={{ paddingBottom: 20 }}
      style={styles.container}
    >
      {isFetching && <CustomLoader />}
      <MainPageFilters filters={filters} onChange={onFiltersChange} />
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: { padding: 25, flex: 1, gap: 15 },
});
