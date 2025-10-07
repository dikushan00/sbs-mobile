import { FileType } from "@/services/types";
import { CustomSelectProps } from "../common/CustomSelect";
import { PointType } from "../pages/okk/services";
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
};

export type BottomDrawerPayload<T extends BottomDrawerContentKeys | null> = {
  type: T;
  data: T extends keyof BottomDrawerPayloadMap
    ? BottomDrawerPayloadMap[T]
    : never;
};
