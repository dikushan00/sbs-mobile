import React from "react";
import { CustomSelectProps } from "../common/CustomSelect";
import { ConfirmBlock } from "./content/confirm";
import { CustomSelectList } from "./content/customSelectList";
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
});
