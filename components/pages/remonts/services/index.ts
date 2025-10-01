import { RoomsDataType } from "@/components/BottomDrawer/content/uploadMediaCheck";
import { COLORS, FILE_URL_MAIN, STORAGE_KEYS } from "@/constants";
import { OfflineActionKeyType } from "@/services";
import { storageService } from "@/services/storage";
import { generateRandomString } from "@/utils";
import { format } from "date-fns";
import { okkWorkStatuses } from "../../okk/services";
import { updateTasksData } from "../../tasks/services";
import {
  FileType,
  MasterType,
  RemontType,
  RoomMediaType,
  WorkSetMediaType,
  WorkType,
} from "../types";
import { OfflineActionType } from "./../../../../services/redux/types";
import { remontsAPI } from "./api";

export type DetailRemontResponse = {
  remont_info: RemontType;
  work_set_info: WorkType[];
  team_masters: MasterType[];
  remont_key_request: { remont_key_id: number; is_accept: boolean } | null;
};
export const getRemonts = async (options: {
  signal?: AbortSignal;
}): Promise<RemontType[] | undefined> => {
  try {
    const res = await remontsAPI.getRemonts(options);
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

const editRemontStorageData = async (data: RemontType) => {
  const remontsData = await storageService.getData(STORAGE_KEYS.remonts);
  if (remontsData?.length) {
    const edited = remontsData.map((item: RemontType) => {
      if (item.remont_id === data.remont_id) return { ...item, info: data };
      return item;
    });
    await storageService.setData(
      STORAGE_KEYS.remonts,
      //@ts-ignore
      edited
    );
  }
};

export const refactorRemontDetailResponse = (
  res: DetailRemontResponse | undefined
) => {
  if (res?.remont_info) {
    const data = {
      ...res.remont_info,
      work_set_info: res.work_set_info,
      team_masters: res.team_masters,
      remont_key_request: res.remont_key_request || null,
    };
    return data;
  }
};

export const refactorRemontResponse = async (res: DetailRemontResponse) => {
  const data = refactorRemontDetailResponse(res);
  if (!data) return;
  await editRemontStorageData(data);
  return data;
};

export const getRemontDetail = async (
  remontId: number,
  options: { signal?: AbortSignal }
): Promise<RemontType | undefined> => {
  try {
    const res = await remontsAPI.getRemontDetail(remontId, options);
    return refactorRemontResponse(res);
  } catch (e: any) {
    if (e?.code === "ERR_NETWORK" || e?.code === "ECONNABORTED") {
      const remontsData = await storageService.getData(STORAGE_KEYS.remonts);
      if (remontsData?.length) {
        const remont = remontsData.find(
          (item: RemontType) => item.remont_id === remontId
        );
        return refactorRemontDetailResponse(remont?.info) || remont;
      }
    }
  }
};

export const acceptOrRefuseRemont = async (
  remontId: number,
  is_accepted: boolean
): Promise<RemontType | undefined> => {
  try {
    const res = await remontsAPI.acceptOrRefuseRemont(remontId, {
      is_accepted,
    });
    return refactorRemontResponse(res);
  } catch (e: any) {}
};

type FileBodyType = {
  work_set_id: number | undefined;
  file?: { uri: string; type: string; room_id?: number };
};

const fillFormData = (data: FileBodyType): FormData => {
  const formData = new FormData();
  formData.append("work_set_id", String(data.work_set_id));
  formData.append("date_submitted", format(new Date(), "dd.MM.yyyy HH:mm:ss"));
  data.file &&
    formData.append("media", {
      uri: data?.file.uri,
      name: data?.file.uri.split("/").pop(),
      type: data?.file.type,
    } as any);
  if (data?.file?.room_id)
    formData.append("room_id", String(data?.file.room_id));
  return formData;
};

export const generateNewOfflineAction = async (
  args: any[],
  code: OfflineActionKeyType
) => {
  const newOfflineAction: OfflineActionType = {
    id: generateRandomString(),
    args,
    code,
  };
  await storageService.addNewItem(
    STORAGE_KEYS.offlineActions,
    newOfflineAction
  );
  return true;
};

export const handleReqError = (
  e: any,
  args: any[],
  code: OfflineActionKeyType
) => {
  if (e?.code === "ERR_NETWORK") {
    return generateNewOfflineAction(args, code);
  }
};

export const getOfflineFunctionName = (status: WorkStatusesKeyType) => {
  let functionName: string | null = null;
  if (status === workStatuses.NOT_STARTED) {
    functionName = "beforeWorkCheck";
  } else if (
    status === workStatuses.STARTED ||
    status === workStatuses.ON_CORRECTION
  ) {
    functionName = "submitWork";
  } else if (status === workStatuses.SENT_VERIFICATION) {
    functionName = "okkCheck";
  }
  return functionName;
};

export const generateFilesOfflineActions = async (
  body: any,
  remontId: number | null,
  files: FileType[],
  status: WorkStatusesKeyType | null,
  tasksMode = false
) => {
  await files.map(async (file) => {
    const functionName = status && getOfflineFunctionName(status);
    const formDataBody = {
      ...body,
      file,
    };
    const args: any[] = [remontId, formDataBody];
    if (tasksMode) args.push(status);
    functionName &&
      (await generateNewOfflineAction(args, functionName as "beforeWorkCheck"));
  });
};
export const beforeWorkCheck = async (
  remontId: number,
  body: FileBodyType,
  status: WorkStatusesKeyType | null = null
): Promise<RemontType | WorkType[] | undefined | boolean> => {
  try {
    const formData = fillFormData(body);
    const params: any = {};
    if (status) params.work_status = status;
    const res = await remontsAPI.beforeWorkCheck(
      remontId,
      formData,
      status ? params : null
    );
    if (status && (Array.isArray(res) || res === null)) {
      await updateTasksData(status, res || []);
      return res || [];
    }
    if (res && !Array.isArray(res)) return refactorRemontResponse(res);
  } catch (e: any) {
    return await handleReqError(e, [remontId, body, status], "beforeWorkCheck");
  }
};

export const submitWork = async (
  remontId: number,
  body: FileBodyType,
  status: WorkStatusesKeyType | null = null
): Promise<RemontType | WorkType[] | undefined | boolean> => {
  try {
    const formData = fillFormData(body);
    const params: any = {};
    if (status) params.work_status = status;
    const res = await remontsAPI.submitWork(
      remontId,
      formData,
      status ? params : null
    );
    if (status && (Array.isArray(res) || res === null)) {
      await updateTasksData(status, res || []);
      return res || [];
    }
    if (res && !Array.isArray(res)) return refactorRemontResponse(res);
  } catch (e: any) {
    return handleReqError(e, [remontId, body, status], "submitWork");
  }
};

export const receiveKeys = async (
  remontId: number,
  body: { remont_key_id: number }
): Promise<RemontType | undefined | boolean> => {
  try {
    const res = await remontsAPI.receiveKeys(remontId, body);
    return refactorRemontResponse(res);
  } catch (e: any) {
    return handleReqError(e, [remontId, body], "receiveKeys");
  }
};

export const passKeys = async (
  remontId: number,
  body: { team_master_id: number }
): Promise<RemontType | undefined | boolean> => {
  try {
    const res = await remontsAPI.passKeys(remontId, body);
    return refactorRemontResponse(res);
  } catch (e: any) {
    return handleReqError(e, [remontId, body], "passKeys");
  }
};

export const remontStatuses = {
  NEW: "NEW",
  CANCELLED: "CANCELLED",
  DONE: "DONE",
  PROCESSING: "PROCESSING",
  CHECKING: "CHECKING",
};

export const workStatuses = {
  ALL: "ALL",
  NOT_STARTED: "NOT_STARTED",
  STARTED: "STARTED",
  SENT_VERIFICATION: "SENT_VERIFICATION",
  ON_CORRECTION: "ON_CORRECTION",
  DONE: "DONE",
};

export type WorkStatusesKeyType = keyof typeof workStatuses;
export type RemontStatusesKeyType = keyof typeof remontStatuses;

export const remontStatusData = {
  [remontStatuses.PROCESSING]: {
    backgroundColor: "#CEE7FF",
    textColor: COLORS.primary,
    name: "В работе",
    icon: "spinner",
  },
  [remontStatuses.NEW]: {
    backgroundColor: "#CDFFCD",
    textColor: "#13B413",
    name: "Новая",
    icon: "star",
  },
  [remontStatuses.CHECKING]: {
    backgroundColor: "#fef6eb",
    textColor: COLORS.edit,
    name: "На исправлении",
    icon: "wrench",
  },
  [remontStatuses.DONE]: {
    backgroundColor: "#CEE7FF",
    textColor: COLORS.primary,
    name: "Готово",
    icon: "check",
  },
  [remontStatuses.CANCELLED]: {
    backgroundColor: "#fff",
    textColor: COLORS.black,
    name: "Отклоненные",
    icon: "bam",
  },
};

export const workStatusData = {
  [workStatuses.STARTED]: {
    backgroundColor: "#CEE7FF",
    textColor: COLORS.primary,
    name: "Начат",
    icon: "spinner",
  },
  [workStatuses.NOT_STARTED]: {
    backgroundColor: "#4783bb",
    textColor: "#fff",
    textColorDark: "#404040",
    name: "Не начат",
    icon: "hourglass",
  },
  [workStatuses.SENT_VERIFICATION]: {
    backgroundColor: COLORS.primaryDisabled,
    textColor: COLORS.primary,
    name: "Ожидает проверки",
    icon: "search",
  },
  [workStatuses.ON_CORRECTION]: {
    backgroundColor: "#fef6eb",
    textColor: COLORS.edit,
    name: "На исправлении",
    icon: "wrench",
  },
  [workStatuses.DONE]: {
    backgroundColor: "#CDFFCD",
    textColor: "#13B413",
    name: "Завершен",
    icon: "check",
  },
};

export const getWorkBtnTitle = (status: WorkStatusesKeyType) => {
  if (!status) return "Взять в работу";
  switch (status) {
    case workStatuses.NOT_STARTED: {
      return "Начать работу";
    }
    case workStatuses.STARTED: {
      return "Отправить на проверку";
    }
    case workStatuses.ON_CORRECTION: {
      return "Отправить на проверку";
    }
    default:
      return "";
  }
};

export const workHistoryStatuses = {
  BEFORE_WORK: "BEFORE_WORK",
  AFTER_WORK: "AFTER_WORK",
  AFTER_CORRECTION: "AFTER_CORRECTION",
  OKK_REMARK: "OKK_REMARK",
};
export type WorkHistoryStatusKeys = keyof typeof workHistoryStatuses;

export const getWorkSetMediaCode = (
  status: WorkStatusesKeyType | null
): WorkHistoryStatusKeys => {
  if (!status) return "BEFORE_WORK";
  switch (status) {
    case workStatuses.NOT_STARTED: {
      return "BEFORE_WORK";
    }
    case workStatuses.STARTED: {
      return "AFTER_WORK";
    }
    case workStatuses.ON_CORRECTION: {
      return "AFTER_CORRECTION";
    }
    case workStatuses.SENT_VERIFICATION: {
      return "OKK_REMARK";
    }
    default:
      return "BEFORE_WORK";
  }
};

export const getWorkSetNextStatus = (
  status: WorkStatusesKeyType | null,
  rejected = true
): WorkStatusesKeyType | null => {
  switch (status) {
    case workStatuses.NOT_STARTED: {
      return "STARTED";
    }
    case workStatuses.STARTED: {
      return "SENT_VERIFICATION";
    }
    case workStatuses.ON_CORRECTION: {
      return "SENT_VERIFICATION";
    }
    case workStatuses.SENT_VERIFICATION: {
      return rejected ? "ON_CORRECTION" : "DONE";
    }
    default:
      return status;
  }
};

export const getWorkStatusHistoryTitle = (
  status: WorkStatusesKeyType | null
) => {
  if (!status) return "";
  switch (status) {
    case workStatuses.NOT_STARTED: {
      return "До работ";
    }
    case workStatuses.STARTED: {
      return "После работ";
    }
    case workStatuses.ON_CORRECTION: {
      return "После исправления";
    }
    case workStatuses.SENT_VERIFICATION: {
      return "Замечания ОКК";
    }
    default:
      return "";
  }
};

const createWorkSetMediaItem = (
  master_work_set_media_type_id: string | number | null,
  status: WorkStatusesKeyType | null,
  files: FileType[],
  rooms?: RoomMediaType[],
  comment = ""
) => {
  const newMediaItem: WorkSetMediaType = {
    master_work_set_media_type_id:
      master_work_set_media_type_id || generateRandomString(),
    master_work_set_media_type_name: getWorkStatusHistoryTitle(status),
    master_work_set_media_type_code: getWorkSetMediaCode(status),
    date: format(new Date(), "dd.MM.yyyy HH:mm:ss"),
    is_allow: true,
    media_url_list: files.map((item) => item.uri),
    rooms: rooms || [],
    id: generateRandomString(),
    comment: comment || "",
    isOfflineData: true,
  };
  return newMediaItem;
};

export const changeWorkSetData = async (
  remontId: number | string,
  workSet: WorkType
) => {
  try {
    const remonts = await storageService.getData(STORAGE_KEYS.remonts);
    if (!remonts?.length) return;
    const remontInfo = remonts.find(
      (item) => item.remont_id === Number(remontId)
    );
    if (!remontInfo) return;

    const isWorkSetExist = remontInfo.work_set_info?.find(
      (item) => item.work_set_id === workSet?.work_set_id
    );
    const editedRemontInfo: RemontType = {
      ...remontInfo,
      work_set_info: remontInfo.work_set_info
        ? isWorkSetExist
          ? remontInfo.work_set_info.map((item) =>
              item.work_set_id === workSet.work_set_id ? workSet : item
            )
          : [...remontInfo.work_set_info, workSet]
        : [workSet],
    };
    const editedRemonts = remonts.map((item) =>
      item.remont_id === editedRemontInfo.remont_id ? editedRemontInfo : item
    );
    await storageService.setData(STORAGE_KEYS.remonts, editedRemonts);
  } catch (e) {}
};

export const changeWorkSetTasksData = async (
  workSet: WorkType,
  oldStatus?: WorkStatusesKeyType | undefined
) => {
  try {
    const workStatus = oldStatus || workSet.work_status;
    const tasksInfo = await storageService.getData(STORAGE_KEYS.tasks);
    if (!tasksInfo) {
      await updateTasksData(workStatus, [workSet]);
      return [workSet];
    }

    const tasks = tasksInfo[workStatus] || [];

    const isWorkSetExist = tasks?.find(
      (item) => item.work_set_id === workSet?.work_set_id
    );
    let editedTasks: WorkType[] = [];
    if (isWorkSetExist) {
      editedTasks = tasks.map((item) => {
        if (item.work_set_id === workSet.work_set_id) return workSet;
        return item;
      });
      await updateTasksData(workStatus, editedTasks);
    } else {
      editedTasks = [...tasks, workSet];

      //@ts-ignore
      const editedTasksData: Record<WorkStatusesKeyType, WorkType[]> = {};
      Object.keys(tasksInfo).forEach((key) => {
        if (key === workStatus) {
          const isWorkSetExist = tasksInfo[key]?.find(
            (item) => item.work_set_id === workSet?.work_set_id
          );
          if (isWorkSetExist) {
            editedTasksData[key as "ALL"] = tasksInfo[key].map((item) => {
              if (item.work_set_id === workSet.work_set_id) return workSet;
              return item;
            });
          } else {
            editedTasksData[key] = tasksInfo[key]?.length
              ? [...tasksInfo[key], workSet]
              : [workSet];
          }
        } else {
          editedTasksData[key as "ALL"] = tasksInfo[key as "ALL"]
            ? tasksInfo[key as "ALL"].filter(
                (item) => item.work_set_id !== workSet.work_set_id
              )
            : [];
        }
      });

      await storageService.setData(STORAGE_KEYS.tasks, editedTasksData);
    }
    return editedTasks;
  } catch (e) {}
  return [];
};

export const getUpdatedWorkSet = (
  workSet: WorkType,
  status: WorkStatusesKeyType | null,
  files: FileType[] | null,
  roomsData: RoomsDataType[],
  master_work_set_media_type_id: string | number | null,
  isOffline = false,
  comment = "",
  rejected = true
) => {
  const addMedia = !!master_work_set_media_type_id;
  let workSetNewStatus = getWorkSetNextStatus(status, rejected);
  if (addMedia || isOffline) workSetNewStatus = null;

  const rooms: RoomMediaType[] = [];
  const roomsWithFiles = roomsData?.filter((room) => room.files?.length);
  roomsWithFiles?.forEach((room) => {
    rooms.push({
      room_id: room.room_id,
      room_name: room.room_name,
      media_url_list: room.files?.map((item) => item.uri) || [],
    });
  });
  const newMediaItem: WorkSetMediaType | null = createWorkSetMediaItem(
    master_work_set_media_type_id,
    status,
    files || [],
    rooms,
    comment
  );

  return {
    ...workSet,
    work_status: workSetNewStatus || workSet.work_status,
    check_status_code: rejected
      ? (okkWorkStatuses.REJECTED as "REJECTED")
      : (okkWorkStatuses.CHECKED as "CHECKED"),
    isOfflineData: true,
    media: rejected
      ? workSet.media?.length
        ? addMedia
          ? workSet.media?.map((item) => {
              if (
                item.master_work_set_media_type_id ===
                master_work_set_media_type_id
              ) {
                const newFiles = files?.map((item) => item.uri) || [];
                return {
                  ...item,
                  media_url_list: item?.media_url_list?.length
                    ? [...item.media_url_list, ...newFiles]
                    : newFiles,
                  rooms: item?.rooms ? [...item.rooms, ...rooms] : rooms,
                };
              }
              return item;
            })
          : [...workSet.media, newMediaItem]
        : [newMediaItem]
      : workSet.media || [],
  };
};

export const addWorkSetMedia = (
  remontInfo: RemontType | null,
  roomsData: RoomsDataType[],
  data: {
    status: WorkStatusesKeyType | null;
    work_set_id?: number;
  },
  files: FileType[] | null,
  master_work_set_media_type_id: string | number | null,
  isOffline = false,
  updatedWorkSet: WorkType | undefined,
  comment = ""
) => {
  if (!remontInfo) return null;
  try {
    return {
      ...remontInfo,
      work_set_info:
        remontInfo?.work_set_info?.map((workSet) => {
          if (workSet?.work_set_id === data?.work_set_id) {
            return (
              updatedWorkSet ||
              getUpdatedWorkSet(
                workSet,
                data.status,
                files,
                roomsData,
                master_work_set_media_type_id,
                isOffline,
                comment
              )
            );
          }
          return workSet;
        }) || null,
    };
  } catch (e) {}
  return remontInfo;
};

export const changeRemontData = (
  remontInfo: RemontType,
  key: string,
  data: any
) => {
  try {
    return {
      ...remontInfo,
      [key]: data,
    };
  } catch (e) {
    return remontInfo;
  }
};

export const getRoomFiles = (roomsWithFiles: RoomsDataType[]): FileType[] => {
  const roomFiles: FileType[] = [];
  try {
    roomsWithFiles.forEach((room) => {
      room.files?.forEach((file) => {
        roomFiles.push({ ...file, room_id: room.room_id });
      });
    });
  } catch (e) {}
  return roomFiles;
};

export const refactorWorkSetMedia = (
  media: WorkSetMediaType[] | null | undefined
) => {
  if (!media) return [];
  return (
    media?.map((item, idx) => {
      let files = item?.media_url_list?.map((fileUrl, i) => {
        return {
          url:
            item.isOfflineData || fileUrl.includes("file:///")
              ? fileUrl
              : `${FILE_URL_MAIN}${fileUrl}`,
          id: i,
          checked: false,
        };
      });
      item.rooms?.forEach((room) => {
        if (room?.media_url_list?.length) {
          room?.media_url_list?.map((roomFileUrl, i) => {
            const roomFile = {
              url:
                item.isOfflineData || roomFileUrl.includes("file:///")
                  ? roomFileUrl
                  : `${FILE_URL_MAIN}${roomFileUrl}`,
              id: i + (item?.media_url_list?.length || 0),
              checked: false,
              desc: room.room_name,
            };
            files.push(roomFile);
          });
        }
      });
      return {
        ...item,
        id: `${idx}-${item.date}`,
        files,
      };
    }) || []
  );
};
