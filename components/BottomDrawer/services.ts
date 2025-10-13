import React from "react";
import { CustomSelectProps } from "../common/CustomSelect";
import { FlatSelectProps } from "../common/FlatSelect";
import { WorkSetSelectProps } from "../common/WorkSetSelect";
import { ConfirmBlock } from "./content/confirm";
import { CustomSelectList } from "./content/customSelectList";
import { FlatSelectList } from "./content/flatSelectList";
import { WorkSetSelectList } from "./content/workSetSelectList";
import { SelectModule } from "./content/selectModule";
import { UploadMedia } from "./content/uploadMedia";
import {
  ConfirmDrawerType,
  SelectModuleProps,
  UploadMediaDrawerType,
} from "./types";

export const BOTTOM_DRAWER_KEYS = {
  confirm: "confirm",
  uploadMedia: "uploadMedia",
  customSelectList: "customSelectList",
  selectModule: "selectModule",
  flatSelectList: "flatSelectList",
  workSetSelectList: "workSetSelectList",
} as const;

export const getBottomDrawerContent = (isOkk = false) => ({
  [BOTTOM_DRAWER_KEYS.confirm]: {
    component: ConfirmBlock as React.FC<{
      data: ConfirmDrawerType;
      handleClose: () => void;
    }>,
    snapPoints: [285],
  },
  [BOTTOM_DRAWER_KEYS.uploadMedia]: {
    component: UploadMedia as React.FC<{
      data: UploadMediaDrawerType;
      handleClose: () => void;
    }>,
    snapPoints: [550],
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
  [BOTTOM_DRAWER_KEYS.flatSelectList]: {
    component: FlatSelectList as React.FC<{
      data: FlatSelectProps;
      handleClose: () => void;
    }>,
    snapPoints: [500],
  },
  [BOTTOM_DRAWER_KEYS.workSetSelectList]: {
    component: WorkSetSelectList as React.FC<{
      data: any;
      handleClose: () => void;
    }>,
    snapPoints: [600],
  },
});
