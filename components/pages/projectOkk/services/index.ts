import { COLORS, MASTER_API, STORAGE_KEYS } from "@/constants";
import { AppDispatch } from "@/services/redux";
import { logout } from "@/services/redux/reducers/userApp";
import { storageService } from "@/services/storage";
import { getFileInfo } from "@/utils";
import * as FileSystem from "expo-file-system";
import * as ImageManipulator from "expo-image-manipulator";
import Toast from "react-native-toast-message";
import { handleReqError } from "../../remonts/services";
import { FileType } from "../../remonts/types";
import { okkAPI } from "./api";

export interface ProjectOkkDataType {
  resident_id: number;
  resident_name: string;
  project_id: number;
  project_name: string;
  entrances: Entrance[];
}

export type PointType = {
  id: string;
  call_check_list_point_id: number | null;
  x: number;
  y: number;
  comment: string;
  files: FileType[] | null;
  point_is_accepted?: "1" | "0" | null;
  is_accepted?: boolean;
};
export type CheckListType = {
  check_list_id: number;
  check_name: string;
  is_required: boolean;
  check_list_is_accepted: "1" | "0" | null;
  is_accepted: boolean;
  points: PointType[];
};
export type CheckListPointsType = {
  check_list_id: number;
  help_call_id: number;
  check_list_is_accepted?: "1" | "0" | null;
  points: PointType[];
};
export type PointCoordType = {
  coord_type: 'LINESTRING' | 'CIRCLE'
  floor_param_id: number
  floor_param_type_color: string
  points: [number, number][]
}
export interface ProjectOkkTaskType {
  help_call_id: number;
  placement_type_id: number;
  placement_type_name: string;
  work_set_check_group_id: number;
  work_set_check_group_short_name: string;
  file_url: string;
  file_ext: string;
  floor: string;
  resident_id: number;
  resident_name: string;
  entrance_label: string;
  entrance: number;
  call_date: string;
  check_list: CheckListType[];
  points?: PointCoordType[]
}
export interface Entrance {
  entrance: number;
  block_name: string;
  calls: ProjectOkkTaskType[];
}

export const okkStatuses = {
  DEFECT: "DEFECT",
  PROCESSING: "PROCESSING",
  DONE: "DONE",
};

export type OkkStatusKeyType = keyof typeof okkStatuses;

export const okkStatusesData = {
  [okkStatuses.PROCESSING]: {
    name: "В процессе",
  },
  [okkStatuses.DEFECT]: {
    name: "На исправлении",
  },
  [okkStatuses.DONE]: {
    name: "Завершено",
  },
};
export const updateProjectOkkData = async (
  status: OkkStatusKeyType,
  data: ProjectOkkDataType[]
) => {
  if (status !== "PROCESSING") return;
  try {
    const localData =
      (await storageService.getData(STORAGE_KEYS.projectOkkData)) || {};
    //@ts-ignore
    await storageService.setData(STORAGE_KEYS.projectOkkData, {
      ...localData,
      [status]: data,
    });
  } catch (e) {}
};

export const downloadSchemaImage = async (file_url: string) => {
  if (!file_url) return;
  try {
    const fileName = file_url.split("/").reverse()[0];
    const fileInfo = await getFileInfo(fileName);
    if (!!fileInfo?.exists) return;
    const uri: string = `${MASTER_API}${file_url}`;
    const fileUri = FileSystem.documentDirectory + fileName;
    const response = uri && (await FileSystem.downloadAsync(uri, fileUri));
    if (!response) return;
    if (typeof response !== "string" && response?.status !== 200)
      return Toast.show({
        type: "error",
        text1: "Не удалось загрузить изображения схемы этажа",
        position: "top",
        visibilityTime: 3000,
        autoHide: true,
        topOffset: 50,
      });
  } catch (error: any) {
    Toast.show({
      type: "error",
      text1: "Не удалось загрузить изображения схемы этажа",
      position: "top",
      visibilityTime: 3000,
      autoHide: true,
      topOffset: 50,
    });
  }
};

const getResFiles = (res: ProjectOkkDataType[]) => {
  const files: string[] = [];
  try {
    res.map((item) => {
      return item.entrances?.map((item) => {
        return item.calls?.forEach((item) => {
          if (item?.file_url) files.push(item.file_url);
        });
      });
    });
  } catch (e) {
    return [];
  }
  return files;
};

export const getOkkTasks = async (
  params: { okk_status_code?: OkkStatusKeyType } = {},
  signal?: AbortSignal,
  dispatch?: AppDispatch
): Promise<ProjectOkkDataType[] | undefined> => {
  if (!params.okk_status_code) return;
  try {
    const res = await okkAPI.getOkkData(params, signal);
    if (res?.errorCode === 401 && !res?.status) {
      dispatch && dispatch(logout());
      return;
    }
    if (res?.data) {
      const edited: ProjectOkkDataType[] = res.data.map((item) => ({
        ...item,
        entrances: item.entrances?.map((ent) => ({
          ...ent,
          calls: ent.calls?.map((call) => ({
            ...call,
            resident_id: item.resident_id,
            entrance: ent.entrance,
            resident_name: item.resident_name,
            entrance_label: `Блок ${ent.block_name}`,
            check_list: call?.check_list?.map((ch) => ({
              ...ch,
              check_list_is_accepted:
                ch.is_accepted === null
                  ? null
                  : ch.is_accepted
                  ? ("1" as "1")
                  : ("0" as "0"),
              points: ch.points?.map((point) => ({
                ...point,
                point_is_accepted:
                  point.is_accepted === null
                    ? null
                    : point.is_accepted
                    ? ("1" as "0")
                    : ("0" as "0"),
              })),
            })),
          })),
        })),
      }));
      await updateProjectOkkData(params.okk_status_code, edited || []);
      if (params.okk_status_code === "PROCESSING") {
        const files = getResFiles(res.data);
        await Promise.allSettled(
          files.map((item) => downloadSchemaImage(item))
        );
      }
      return edited;
    }
    return [];
  } catch (e: any) {
    if (e?.code === "ERR_NETWORK" || e?.code === "ECONNABORTED") {
      const localData = await storageService.getData(
        STORAGE_KEYS.projectOkkData
      );
      if (localData) return localData[params.okk_status_code];
      return [];
    }
  }
};

export const sendCheckListCheck = async (
  help_call_id: number,
  checkList: {
    check_list_id: number;
    check_list_is_accepted: "1" | "0" | null;
    points: PointType[];
  },
  call_is_checked: boolean,
  dispatch?: AppDispatch
): Promise<{ status: boolean } | boolean | undefined> => {
  try {
    const res = checkList?.points?.length
      ? await Promise.all(
          checkList?.points?.map((item) =>
            sendProjectOkkCheck(
              help_call_id,
              item,
              {
                check_list_id: checkList.check_list_id,
                check_list_is_accepted: checkList.check_list_is_accepted as "1",
              },
              call_is_checked,
              dispatch
            )
          )
        )
      : await Promise.all([
          sendProjectOkkCheck(
            help_call_id,
            null,
            {
              check_list_id: checkList.check_list_id,
              check_list_is_accepted: checkList.check_list_is_accepted as "1",
            },
            call_is_checked,
            dispatch
          ),
        ]);
    let isNetworkError = res?.find((item) => item === true);
    if (isNetworkError) return true;

    const isFilesHasError = res?.some((item) => !item);
    if (isFilesHasError) return;

    let checkLists =
      (await storageService.getData(STORAGE_KEYS.checkListPoints)) || [];
    checkLists = checkLists?.filter(
      (item) =>
        !(
          item.check_list_id === checkList.check_list_id &&
          item.help_call_id === help_call_id
        )
    );
    await storageService.setData(STORAGE_KEYS.checkListPoints, checkLists);

    return { status: true };
  } catch (e: any) {}
};

export const sendProjectOkkCheck = async (
  help_call_id: number,
  point: PointType | null,
  checkList: { check_list_id: number; check_list_is_accepted: "1" | "0" },
  call_is_checked: boolean,
  dispatch?: AppDispatch
): Promise<{ status: boolean } | boolean | undefined> => {
  const formData = new FormData();
  formData.append("help_call_id", String(help_call_id));
  formData.append("check_list_id", String(checkList.check_list_id));
  formData.append("call_is_checked", call_is_checked ? "1" : "0");
  if (point) {
    formData.append("comment", point.comment || "");
    formData.append("x", String(point.x));
    formData.append("y", String(point.y));
    formData.append("point_is_accepted", point.point_is_accepted || "0");

    point.files?.forEach((file) => {
      !!file?.uri &&
        formData.append("file_list", {
          uri: file.uri,
          name: file.uri.split("/").pop(),
          type: file.type,
        } as any);
    });
  }
  if (!!checkList.check_list_is_accepted)
    formData.append("check_list_is_accepted", checkList.check_list_is_accepted);

  try {
    const res = await okkAPI.sendCheck(formData);

    let checkLists =
      (await storageService.getData(STORAGE_KEYS.checkListPoints)) || [];
    checkLists = checkLists
      ?.map((item) => {
        if (
          item.check_list_id === checkList.check_list_id &&
          item.help_call_id === help_call_id
        ) {
          const points = item.points || [];
          return {
            ...item,
            points: points?.filter((item) => {
              if (point?.call_check_list_point_id) {
                return (
                  item.call_check_list_point_id !==
                  point.call_check_list_point_id
                );
              }
              return item.id !== point?.id;
            }),
          };
        }
        return item;
      })
      ?.filter((item) => !!item?.points?.length);
    await storageService.setData(STORAGE_KEYS.checkListPoints, checkLists);

    return { status: true };
  } catch (e: any) {
    const args = [help_call_id, point, checkList, call_is_checked, dispatch];
    return await handleReqError(e, args, "sendProjectOkkCheck");
  }
};

export const schemaMaxZoom = 15;
export const schemaMinZoom = 0.8;

const maxZoom = 5;

export const getCircleRadius = (zoom: number) => {
  const maxRadius = 5;
  const minRadius = 1;
  try {
    const clampedZoom = Math.max(schemaMinZoom, Math.min(maxZoom, zoom));
    const t = (clampedZoom - schemaMinZoom) / (maxZoom - schemaMinZoom);
    return maxRadius * (1 - t) + minRadius * t;
  } catch (e) {
    return minRadius;
  }
};

export const getCircleStrokeWidth = (zoom: number) => {
  const maxWidth = 4;
  const minWidth = 0.4;
  try {
    const clampedZoom = Math.max(schemaMinZoom, Math.min(maxZoom, zoom));
    const t = (clampedZoom - schemaMinZoom) / (maxZoom - schemaMinZoom);
    return maxWidth * (1 - t) + minWidth * t;
  } catch (e) {
    return minWidth;
  }
};

export const getCircleStrokeColor = (
  pt: PointType,
  activePointId: string | number | null
) => {
  if (
    pt.call_check_list_point_id &&
    pt.call_check_list_point_id === activePointId
  )
    return COLORS.primary;

  if (pt.id && pt.id === activePointId) return COLORS.primary;

  if (pt.point_is_accepted === "1") return "#006600";
  if (pt.call_check_list_point_id && pt.point_is_accepted === "0") return "red";
  if (pt.point_is_accepted === "0") return "#a40015";

  return "#000";
};

export const getImageSize = async (uri: string) => {
  try {
    const result = await ImageManipulator.manipulateAsync(uri, [], {
      base64: false,
    });
    return { width: result.width, height: result.height };
  } catch (e) {}
};
