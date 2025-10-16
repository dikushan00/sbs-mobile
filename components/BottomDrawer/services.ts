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
import { MaterialActions } from "./content/materialActions";
import { DocumentActions } from "./content/documentActions";
import { PaymentActions } from "./content/paymentActions";
import { StagesActions } from "./content/stagesActions";
import { SignatoriesList } from "./content/signatoriesList";
import { DatePicker } from "./content/datePicker";
import {
  ConfirmDrawerType,
  SelectModuleProps,
  UploadMediaDrawerType,
  MaterialActionsDrawerType,
  DocumentActionsDrawerType,
  PaymentActionsDrawerType,
  StagesActionsDrawerType,
  SignatoriesListDrawerType,
  DatePickerDrawerType,
} from "./types";

export const BOTTOM_DRAWER_KEYS = {
  confirm: "confirm",
  uploadMedia: "uploadMedia",
  customSelectList: "customSelectList",
  selectModule: "selectModule",
  flatSelectList: "flatSelectList",
  workSetSelectList: "workSetSelectList",
  materialActions: "materialActions",
  documentActions: "documentActions",
  paymentActions: "paymentActions",
  stagesActions: "stagesActions",
  signatoriesList: "signatoriesList",
  datePicker: "datePicker",
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
  [BOTTOM_DRAWER_KEYS.materialActions]: {
    component: MaterialActions as React.FC<{
      data: MaterialActionsDrawerType;
      handleClose: () => void;
    }>,
    snapPoints: [300],
  },
  [BOTTOM_DRAWER_KEYS.documentActions]: {
    component: DocumentActions as React.FC<{
      data: DocumentActionsDrawerType;
      handleClose: () => void;
    }>,
    snapPoints: [300],
  },
  [BOTTOM_DRAWER_KEYS.paymentActions]: {
    component: PaymentActions as React.FC<{
      data: PaymentActionsDrawerType;
      handleClose: () => void;
    }>,
    snapPoints: [200],
  },
  [BOTTOM_DRAWER_KEYS.stagesActions]: {
    component: StagesActions as React.FC<{
      data: StagesActionsDrawerType;
      handleClose: () => void;
    }>,
    snapPoints: [200],
  },
  [BOTTOM_DRAWER_KEYS.signatoriesList]: {
    component: SignatoriesList as React.FC<{
      data: SignatoriesListDrawerType;
      handleClose: () => void;
    }>,
    snapPoints: ['80%'],
  },
  [BOTTOM_DRAWER_KEYS.datePicker]: {
    component: DatePicker as React.FC<{
      data: DatePickerDrawerType;
      handleClose: () => void;
    }>,
    snapPoints: ['90%'],
  },
});
