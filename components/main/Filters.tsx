import { View } from "react-native";
import { CustomSelect } from "../common/CustomSelect";
import { useCallback, useEffect, useState } from "react";
import {
  getResidentList,
  getProjectTypes,
  getResidentialEntrances,
} from "./services";
import { ProjectEntranceAllInfoType, ProjectFiltersType, ProjectTypeType, ResidentType } from "./types";

type PropsType = {
  onChange: (key: string, value: any, row: any) => void;
  filters: ProjectFiltersType;
  onRefresh?: number;
};
export const MainPageFilters = ({ onChange, filters, onRefresh }: PropsType) => {
  const [residents, setResidents] = useState<ResidentType[]>([]);
  const [projectTypes, setProjectTypes] = useState<ProjectTypeType[]>([]);
  const [entrances, setEntrances] = useState<ProjectEntranceAllInfoType[]>([]);

  const getResidents = useCallback(async () => {  
    getResidentList().then((res) => setResidents(res || []));
  }, []);

  useEffect(() => {
    getResidents();
  }, []);

  const getProjectTypesData = async (residentId: number) => {
    getProjectTypes(residentId).then((res) => setProjectTypes(res || []));
  };

  const getEntrances = async (filters: ProjectFiltersType) => {
    getResidentialEntrances(filters).then((res) => setEntrances(res || []));
  };

  const refreshAllLists = useCallback(async () => {
    // Обновляем список жителей
    await getResidents();
    
    // Если выбран житель, обновляем типы проектов
    if (filters?.resident_id) {
      await getProjectTypesData(filters.resident_id);
    }
    
    // Если выбраны житель и тип проекта, обновляем подъезды
    if (filters?.resident_id && filters?.project_type_id) {
      await getEntrances(filters);
    }
  }, [filters, getResidents]);

  useEffect(() => {
    if(filters?.resident_id) {
      getProjectTypesData(filters.resident_id)
    }
    if(filters.project_entrance_id) {
      getEntrances(filters)
    }
  }, [])

  // Эффект для обновления списков при свайпе
  useEffect(() => {
    if (onRefresh && onRefresh > 0) {
      refreshAllLists();
    }
  }, [onRefresh, refreshAllLists]);

  const onFiltersChange = (key: string, value: any, row: any) => {
    if (key === "resident_id") {
      if (!!value) getProjectTypesData(value);
      else {
        setProjectTypes([]);
        setEntrances([]);
      }
    }
    if (key === "project_type_id") {
      if (filters.resident_id) {
        value && getEntrances({ ...filters, [key]: value });
      }
      if (!value) {
        setEntrances([]);
      }
    }
    onChange(key, value, row);
  };

  return (
    <View style={{ gap: 20 }}>
      <CustomSelect
        list={residents}
        labelKey="resident_name"
        onChange={(id, item) => onFiltersChange("resident_id", id, item)}
        label="Выберите ЖК" required
        value={filters.resident_id}
        valueKey="resident_id"
      />
      <CustomSelect
        list={projectTypes}
        labelKey="project_type_name"
        onChange={(id, item) => onFiltersChange("project_type_id", id, item)}
        label="Тип проекта" required
        value={filters.project_type_id}
        valueKey="project_type_id"
      />
      <CustomSelect
        list={entrances}
        onChange={(id, item) =>
          onFiltersChange("project_entrance_id", id, item)
        }
        label="Подъезд" required
        labelKey="entrance_name"
        valueKey="project_entrance_id"
        value={filters.project_entrance_id}
      />
    </View>
  );
};
