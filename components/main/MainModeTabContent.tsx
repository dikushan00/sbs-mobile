import React from "react";
import { useDispatch } from "react-redux";
import { useNavigation } from "@react-navigation/native";
import { PAGE_NAMES } from "@/constants";
import { ProjectFiltersType, SelectedDataType } from "./types";
import { setPageSettings, setHideFooterNav } from "@/services/redux/reducers/app";
import { setPageHeaderData } from "@/services/redux/reducers/userApp";
import { Contracts } from "../pages/project/blocks";
import { OKKTab } from "../pages/project/tabs/OkkTab";
import { DocumentsTab, MaterialsTab, PaymentsTab, StagesTab, WorkTab } from "../pages/project/tabs";

interface MainModeTabContentProps {
  currentTab: string;
  projectId: number | null;
  selectedData: Partial<SelectedDataType> | null;
  filters: ProjectFiltersType;
  onReset: () => void;
}

export const MainModeTabContent: React.FC<MainModeTabContentProps> = ({
  currentTab,
  projectId,
  selectedData,
  filters,
  onReset,
}) => {
  const dispatch = useDispatch();
  const navigation = useNavigation();

  if (!currentTab || !selectedData) return null;

  const isSBS = true;

  const backToProject = () => {
    onReset();
    dispatch(setHideFooterNav(false));
    dispatch(
      setPageHeaderData({
        title: "Проекты",
        desc: "",
      })
    );
    dispatch(setPageSettings({ 
      backBtn: false, 
      goBack: () => {
        // @ts-ignore
        navigation.navigate(PAGE_NAMES.home as never, { mainMode: false, tab: undefined, project_id: undefined });
        dispatch(setHideFooterNav(false));
      } 
    }));
  };

  switch (currentTab) {
    case 'M__ProjectFormMobileAgreement':
      return <Contracts project_id={projectId} isSBS={isSBS} onBack={backToProject} />;
    case 'M__ProjectFormMobileOkk':
      return <OKKTab onBack={backToProject} selectedData={selectedData as SelectedDataType} />;
    case 'M__ProjectFormWorkTab':
      return <WorkTab filters={filters} selectedData={selectedData as SelectedDataType} />;
    case 'M__ProjectFormMaterialTab':
      return <MaterialsTab filters={filters} onBack={backToProject} selectedData={selectedData as SelectedDataType} />;
    case 'M__ProjectFormRemontCostTab':
      return <PaymentsTab filters={filters} onBack={backToProject} project_id={projectId} selectedData={selectedData as SelectedDataType} />;
    case 'M__ProjectFormDocumentTab':
      return <DocumentsTab filters={filters} onBack={backToProject} isSBS={isSBS} selectedData={selectedData as SelectedDataType} />;
    case 'M__ProjectFormStagesTab':
      return <StagesTab filters={filters} onBack={backToProject} project_id={projectId} selectedData={selectedData as SelectedDataType} />;
    default:
      return null;
  }
};

