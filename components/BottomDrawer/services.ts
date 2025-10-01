import React from "react";
import { ConfirmBlock } from "./content/confirm";
import { WorkReport } from "./content/workReport";
import { UploadMediaCheck } from "./content/uploadMediaCheck";
import {
  ConfirmDrawerType,
  SelectMasterDrawerType,
  SelectModuleProps,
  UploadMediaCheckDrawerType,
  UploadMediaDrawerType,
  WorkReportDrawerType,
  WorkSetHistoryDrawerType,
} from "./types";
import { WorkSetHistory } from "./content/WorkSetHistory";
import { SelectMaster } from "./content/selectMaster";
import { CustomSelectList } from "./content/customSelectList";
import { CustomSelectProps } from "../common/CustomSelect";
import { UploadMedia } from "./content/uploadMedia";
import { SelectModule } from "./content/selectModule";

export const BOTTOM_DRAWER_KEYS = {
  confirm: "confirm",
  workReport: "workReport",
  uploadMediaCheck: "uploadMediaCheck",
  uploadMedia: "uploadMedia",
  workSetHistory: "workSetHistory",
  selectMaster: "selectMaster",
  customSelectList: "customSelectList",
  selectModule: "selectModule",
} as const;

export const getBottomDrawerContent = (isOkk = false) => ({
  [BOTTOM_DRAWER_KEYS.confirm]: {
    component: ConfirmBlock as React.FC<{
      data: ConfirmDrawerType;
      handleClose: () => void;
    }>,
    snapPoints: [285],
  },
  [BOTTOM_DRAWER_KEYS.workReport]: {
    component: WorkReport as React.FC<{
      data: WorkReportDrawerType;
      handleClose: () => void;
    }>,
    snapPoints: [435],
  },
  [BOTTOM_DRAWER_KEYS.workSetHistory]: {
    component: WorkSetHistory as React.FC<{
      data: WorkSetHistoryDrawerType;
      handleClose: () => void;
    }>,
    snapPoints: ["100%"],
  },
  [BOTTOM_DRAWER_KEYS.uploadMediaCheck]: {
    component: UploadMediaCheck as React.FC<{
      data: UploadMediaCheckDrawerType;
      handleClose: () => void;
    }>,
    snapPoints: [isOkk ? 480 : 415],
  },
  [BOTTOM_DRAWER_KEYS.uploadMedia]: {
    component: UploadMedia as React.FC<{
      data: UploadMediaDrawerType;
      handleClose: () => void;
    }>,
    snapPoints: [550],
  },
  [BOTTOM_DRAWER_KEYS.selectMaster]: {
    component: SelectMaster as React.FC<{
      data: SelectMasterDrawerType;
      handleClose: () => void;
    }>,
    snapPoints: [500],
  },
  [BOTTOM_DRAWER_KEYS.customSelectList]: {
    component: CustomSelectList as React.FC<{
      data: CustomSelectProps;
      handleClose: () => void;
    }>,
    snapPoints: [500],
  },
  [BOTTOM_DRAWER_KEYS.selectModule]: {
    component: SelectModule as React.FC<{
      data: SelectModuleProps;
      handleClose: () => void;
    }>,
    snapPoints: [500],
  },
});
