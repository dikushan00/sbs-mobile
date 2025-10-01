import { STORAGE_KEYS } from "@/constants";
import { storageService } from "@/services/storage";
import { NotificationType } from "@/services/types";
import { format } from "date-fns";
import { notificationsAPI } from "./api";

export type NotificationsResponse = {
  day_date: string;
  notify_list: NotificationType[];
};

export const getNotifications = async (
  signal?: AbortSignal
): Promise<NotificationsResponse[] | undefined> => {
  try {
    return;
    const res = await notificationsAPI.getList(signal);
    if (res?.data) {
      await storageService.setData(STORAGE_KEYS.notifications, res?.data);
      return res?.data;
    }
    return [];
  } catch (e: any) {
    if (e?.code === "ERR_NETWORK" || e?.code === "ECONNABORTED") {
      const localData = await storageService.getData(
        STORAGE_KEYS.notifications
      );
      return localData || [];
    }
  }
};

export const getNotifyDate = (date: string) => {
  if (!date) return "";
  const today = format(new Date(), "dd.MM.yyyy");
  if (today === date) return "Сегодня";
  const yesterday = format(
    new Date(new Date().getTime() - 86400000),
    "dd.MM.yyyy"
  );
  if (yesterday === date) return "Вчера";
  return date;
};
