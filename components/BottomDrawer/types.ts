import { CustomSelectProps } from "../common/CustomSelect";
import { PointType } from "../pages/projectOkk/services";
import { WorkStatusesKeyType } from "../pages/remonts/services";
import {
  FileType,
  MasterType,
  RemontType,
  RoomType,
  WorkType,
} from "../pages/remonts/types";
import { BOTTOM_DRAWER_KEYS } from "./services";

export type BottomDrawerContentKeys = keyof typeof BOTTOM_DRAWER_KEYS;

export type ConfirmDrawerType = {
  cancelMode?: boolean;
  title: string;
  submitBtnText?: string;
  onSubmit: () => void;
  onClose: () => void;
};
export interface WorkReportDrawerType extends WorkType {
  onSubmit: (res: RemontType) => void;
  remontId: number;
  workSet: WorkType;
}
export interface WorkSetHistoryDrawerType {
  workSet?: WorkType;
  remontId: number | null;
  tasksMode?: boolean;
  onSubmit?: (res: WorkType[]) => void;
}
export interface SelectMasterDrawerType {
  masters?: MasterType[];
  onSubmit: (team_master_id: number) => void;
}
export type UploadMediaCheckDrawerType = {
  remontId: number | null;
  isOfflineData?: boolean;
  tasksMode?: boolean;
  master_work_set_media_type_id?: string | number | undefined;
  status: WorkStatusesKeyType | null;
  work_set_id?: number;
  rooms: RoomType[];
  workSet: WorkType;
  onSubmit?: (res: WorkType[]) => void;
  onClose?: () => void;
};
export type UploadMediaDrawerType = {
  showTextarea?: boolean;
  files?: FileType[] | null;
  pointData?: PointType;
  comment?: string;
  isEditable?: boolean;
  accepted?: '1' | '0' | null;
  onDelete?: (point: PointType) => void;
  onSubmit?: (res: FileType[], comment: string, accepted: boolean | null, id?: string) => void;
  onClose?: () => void;
};

export type SelectModuleProps = {
  modules: {type: string, res: any}[];
  btnLabel?: string;
  onSubmit: (res: any, key: 'master' | 'okk') => void;
};

export type BottomDrawerDataType = {
  show: boolean;
  data: any;
  type: BottomDrawerContentKeys | null;
  loading: boolean;
};

type BottomDrawerPayloadMap = {
  [BOTTOM_DRAWER_KEYS.confirm]: ConfirmDrawerType;
  [BOTTOM_DRAWER_KEYS.workReport]: WorkReportDrawerType;
  [BOTTOM_DRAWER_KEYS.uploadMediaCheck]: UploadMediaCheckDrawerType;
  [BOTTOM_DRAWER_KEYS.uploadMedia]: UploadMediaDrawerType;
  [BOTTOM_DRAWER_KEYS.workSetHistory]: WorkSetHistoryDrawerType;
  [BOTTOM_DRAWER_KEYS.selectMaster]: SelectMasterDrawerType;
  [BOTTOM_DRAWER_KEYS.customSelectList]: CustomSelectProps;
  [BOTTOM_DRAWER_KEYS.selectModule]: SelectModuleProps;
};

export type BottomDrawerPayload<T extends BottomDrawerContentKeys | null> = {
  type: T;
  data: T extends keyof BottomDrawerPayloadMap
    ? BottomDrawerPayloadMap[T]
    : never;
};
