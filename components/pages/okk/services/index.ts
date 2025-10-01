import { STORAGE_KEYS } from "@/constants";
import { storageService } from "@/services/storage";
import { okkAPI } from "./api";
import {
  RemontType,
  SpecialityType,
  WorkSetMediaType,
} from "../../remonts/types";
import {
  handleReqError,
  refactorRemontDetailResponse,
  refactorRemontResponse,
} from "../../remonts/services";
import { format } from "date-fns";

export interface SpecialityTypeWithWorkSets extends SpecialityType {
  work_sets: {
    media: {
      comment: string | null;
      date: string;
      is_allow: boolean;
      master_work_set_media_type_code: string;
      master_work_set_media_type_id: number;
      master_work_set_media_type_name: string;
      media_url_list: string[];
    }[];
    phone_number: string | null;
    team_master_fio: string | null;
    team_master_id: number | null;
    work_set_id: number;
    work_set_name: string;
  };
}

export interface OkkRemontType extends RemontType {
  work_sets?: {
    check_status_code: OkkStatusKeyType;
    specialities: SpecialityTypeWithWorkSets[];
  };
}

export const getOkkRemonts = async (
  signal?: AbortSignal
): Promise<OkkRemontType[] | undefined> => {
  try {
    const res = await okkAPI.getOkkRemonts(signal);
    if (res?.data) {
      await storageService.setData(STORAGE_KEYS.remonts, res?.data);
      return res?.data;
    }
    return [];
  } catch (e: any) {
    if (e?.code === "ERR_NETWORK" || e?.code === "ECONNABORTED") {
      const localData = await storageService.getData(STORAGE_KEYS.remonts);
      return localData || [];
    }
  }
};
export const getOkkRemont = async (
  remontId: number,
  signal?: AbortSignal
): Promise<OkkRemontType | undefined> => {
  try {
    const res = await okkAPI.getOkkRemont(remontId, signal);
    return refactorRemontResponse(res?.data);
  } catch (e: any) {
    if (e?.code === "ERR_NETWORK" || e?.code === "ECONNABORTED") {
      const remontsData = await storageService.getData(STORAGE_KEYS.remonts);
      if (remontsData?.length) {
        const remont = remontsData.find(
          (item: OkkRemontType) => item.remont_id === remontId
        );
        return refactorRemontDetailResponse(remont?.info) || remont;
      }
    }
  }
};
type FileBodyType = {
  work_set_id: number | undefined;
  team_master_id?: number | undefined;
  is_accept?: number;
  comment?: string;
  file?: { uri: string; type: string; room_id?: number };
};

const fillFormData = (data: FileBodyType): FormData => {
  const formData = new FormData();
  formData.append("work_set_id", String(data.work_set_id));
  formData.append("date_submitted", format(new Date(), "dd.MM.yyyy HH:mm:ss"));
  formData.append("comment", data?.comment || "");
  formData.append("is_accept", String(data.is_accept));
  formData.append("team_master_id", String(data.team_master_id));
  if (data.file) {
    formData.append("media", {
      uri: data?.file.uri,
      name: data?.file.uri.split("/").pop(),
      type: data?.file.type,
    } as any);
  }
  return formData;
};

export const okkCheck = async (
  remontId: number,
  body: FileBodyType
): Promise<OkkRemontType | undefined | boolean> => {
  try {
    const formData = fillFormData(body);
    const res = await okkAPI.okkCheck(remontId, formData);
    return refactorRemontResponse(res?.data);
  } catch (e: any) {
    return await handleReqError(e, [remontId, body], "okkCheck");
  }
};

export const okkStatuses = {
  ALL: "ALL",
  NEW: "NEW",
  PROCESSING: "PROCESSING",
  DONE: "DONE",
};

export const okkWorkStatuses = {
  ALL: "ALL",
  CHECKED: "CHECKED",
  WAITING: "WAITING",
  REJECTED: "REJECTED",
};

export type OkkStatusKeyType = keyof typeof okkWorkStatuses;

export const okkStatusesData = {
  [okkStatuses.PROCESSING]: {
    name: "В процессе",
  },
  [okkStatuses.NEW]: {
    name: "Новые",
  },
  [okkStatuses.DONE]: {
    name: "Завершено",
  },
};

export const okkWorkStatusesData = {
  [okkWorkStatuses.WAITING]: {
    backgroundColor: "rgb(12, 75, 134)",
    textColor: "#fff",
    name: "Ожидает проверки",
    icon: "star",
  },
  [okkWorkStatuses.REJECTED]: {
    backgroundColor: "rgb(255, 140, 0)",
    textColor: "#fff",
    name: "На исправлении",
    icon: "wrench",
  },
  [okkWorkStatuses.CHECKED]: {
    backgroundColor: "rgb(19, 178, 33)",
    textColor: "#fff",
    name: "Завершено",
    icon: "check",
  },
};

export const getCurrentOkkMedia = (media: WorkSetMediaType[]) => {
  try {
    return (
      media.findLast(
        (item) => item.master_work_set_media_type_code !== "OKK_REMARK"
      ) || null
    );
  } catch (e) {
    return null;
  }
};
