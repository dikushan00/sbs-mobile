import { WorkStatusesKeyType } from "./../../remonts/services/index";
import { WorkType } from "../../remonts/types";
import { tasksAPI } from "./api";
import { storageService } from "@/services/storage";
import { STORAGE_KEYS } from "@/constants";

export const updateTasksData = async (
  status: WorkStatusesKeyType,
  data: WorkType[]
) => {
  try {
    const localData = (await storageService.getData(STORAGE_KEYS.tasks)) || {};
    //@ts-ignore
    await storageService.setData(STORAGE_KEYS.tasks, {
      ...localData,
      [status]: data,
    });
  } catch (e) {}
};

export const getTasks = async (
  status: WorkStatusesKeyType,
  signal?: AbortSignal
): Promise<WorkType[] | undefined> => {
  try {
    const res = await tasksAPI.getWorkSets(status, signal);
    await updateTasksData(status, res?.data || []);
    return res?.data;
  } catch (e: any) {
    if (e?.code === "ERR_NETWORK" || e?.code === "ECONNABORTED") {
      const localData = await storageService.getData(STORAGE_KEYS.tasks);
      if (localData) return localData[status];
      return [];
    }
  }
};
