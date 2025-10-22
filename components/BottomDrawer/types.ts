import { FileType } from "@/services/types";
import { CustomSelectProps } from "../common/CustomSelect";
import { PointType } from "../pages/okk/services";
import { MaterialRequestType, ProjectFiltersType, ProjectMainDocumentType, ProjectPaymentType, ProjectStageType, FloorCheckPointInfo, FloorCheckPoint } from "../main/types";
import { BOTTOM_DRAWER_KEYS } from "./services";

export type BottomDrawerContentKeys = keyof typeof BOTTOM_DRAWER_KEYS;

export type ConfirmDrawerType = {
  cancelMode?: boolean;
  title: string;
  submitBtnText?: string;
  onSubmit: () => void;
  onClose: () => void;
};
export type UploadMediaDrawerType = {
  showTextarea?: boolean;
  files?: FileType[] | null;
  pointData?: PointType;
  comment?: string;
  isEditable?: boolean;
  accepted?: "1" | "0" | null;
  onDelete?: (point: PointType) => void;
  onSubmit?: (
    res: FileType[],
    comment: string,
    accepted: boolean | null,
    id?: string
  ) => void;
  onClose?: () => void;
};

export type SelectModuleProps = {
  modules: { type: string; res: any }[];
  btnLabel?: string;
  onSubmit: (res: any, key: "master" | "okk") => void;
};

export type MaterialActionsDrawerType = {
  material: MaterialRequestType;
  onSubmit: (res: MaterialRequestType[]) => void;
  params: ProjectFiltersType;
  provider_request_item_id: number;
};

export type DocumentActionsDrawerType = {
  document: ProjectMainDocumentType;
  onSubmit: (res: ProjectMainDocumentType[]) => void;
  params: ProjectFiltersType;
  floor_map_document_id: number;
};

export type PaymentActionsDrawerType = {
  payment: ProjectPaymentType;
  onSubmit: (res: ProjectPaymentType[]) => void;
};

export type StagesActionsDrawerType = {
  stage: ProjectStageType;
  onSubmit: (res: ProjectStageType[]) => void;
  onViewComments: (stage: ProjectStageType) => void;
  onOpenSchema: (stage: ProjectStageType) => void;
};

export type SignatoriesListDrawerType = {
  document: ProjectMainDocumentType;
  onSign: () => void;
};

export type DatePickerDrawerType = {
  title: string;
  initialDate?: Date;
  onConfirm: (date: Date) => void;
};

export type PointInfoDrawerType = {
  floor_map_id: number;
  point: FloorCheckPoint;
};

export type CitySelectDrawerType = {
  currentCityId?: number;
  onSelect: (cityId: number) => void;
};

export type BottomDrawerDataType = {
  show: boolean;
  data: any;
  type: BottomDrawerContentKeys | null;
  loading: boolean;
};

type BottomDrawerPayloadMap = {
  [BOTTOM_DRAWER_KEYS.confirm]: ConfirmDrawerType;
  [BOTTOM_DRAWER_KEYS.uploadMedia]: UploadMediaDrawerType;
  [BOTTOM_DRAWER_KEYS.customSelectList]: CustomSelectProps;
  [BOTTOM_DRAWER_KEYS.selectModule]: SelectModuleProps;
  [BOTTOM_DRAWER_KEYS.materialActions]: MaterialActionsDrawerType;
  [BOTTOM_DRAWER_KEYS.documentActions]: DocumentActionsDrawerType;
  [BOTTOM_DRAWER_KEYS.paymentActions]: PaymentActionsDrawerType;
  [BOTTOM_DRAWER_KEYS.stagesActions]: StagesActionsDrawerType;
  [BOTTOM_DRAWER_KEYS.signatoriesList]: SignatoriesListDrawerType;
  [BOTTOM_DRAWER_KEYS.datePicker]: DatePickerDrawerType;
  [BOTTOM_DRAWER_KEYS.pointInfo]: PointInfoDrawerType;
  [BOTTOM_DRAWER_KEYS.citySelect]: CitySelectDrawerType;
};

export type BottomDrawerPayload<T extends BottomDrawerContentKeys | null> = {
  type: T;
  data: T extends keyof BottomDrawerPayloadMap
    ? BottomDrawerPayloadMap[T]
    : never;
};
