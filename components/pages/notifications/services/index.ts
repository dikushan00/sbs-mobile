import { STORAGE_KEYS } from "@/constants";
import { storageService } from "@/services/storage";
import { MobileNotifyGroupCodeType, NotificationType } from "@/services/types";
import { format } from "date-fns";
import { notificationsAPI } from "./api";

export type DayListItem = {
  day_date: string;
  notify_list: NotificationType[];
};

export type NotificationsResponse = {
  mobile_notify_group_code: MobileNotifyGroupCodeType;
  day_list: DayListItem[];
};

// Информация о группах уведомлений
export const NOTIFICATION_GROUPS: Record<MobileNotifyGroupCodeType, {
  title: string;
  icon: string;
}> = {
  AGREEMENT: {
    title: "Договоры",
    icon: "documentOutlinePen",
  },
  DOCUMENTS: {
    title: "Документы", 
    icon: "documentOutline",
  },
  OKK: {
    title: "Вызов ОКК",
    icon: "checkCircleOutline",
  },
  MATERIALS: {
    title: "Материалы",
    icon: "car",
  },
};

export const getNotifications = async (
  signal?: AbortSignal
): Promise<NotificationsResponse[] | undefined> => {
  try {
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

export const updateNotificationsRead = async (
  group_code: MobileNotifyGroupCodeType
): Promise<NotificationsResponse[] | undefined> => {
  try {
    const res = await notificationsAPI.updateRead(group_code);
    if (res?.data) {
      await storageService.setData(STORAGE_KEYS.notifications, res?.data);
      return res?.data;
    }
  } catch (e: any) {
  }
};

// Получить последнее время уведомления для группы
export const getGroupLatestTime = (group: NotificationsResponse): string => {
  if (!group.day_list?.length) return "";
  
  // Берем первый день (самый новый) и первое уведомление
  const latestDay = group.day_list[group.day_list.length - 1];
  if (!latestDay?.notify_list?.length) return "";
  
  const latestNotify = latestDay.notify_list[latestDay.notify_list.length - 1];
  if (!latestNotify?.date_create) return "";
  
  // Извлекаем только время (HH:mm)
  const timeMatch = latestNotify.date_create.match(/(\d{2}:\d{2})/);
  return timeMatch ? timeMatch[1] : "";
};

// Получить количество уведомлений в группе
export const getGroupNotifyCount = (group: NotificationsResponse): number => {
  return group.day_list?.reduce((acc, day) => {
    return acc + (day.notify_list?.length || 0);
  }, 0) || 0;
};

// Получить title последнего уведомления для группы
export const getGroupLatestTitle = (group: NotificationsResponse): string => {
  if (!group.day_list?.length) return "";
  
  const latestDay = group.day_list[0];
  if (!latestDay?.notify_list?.length) return "";
  
  const latestNotify = latestDay.notify_list[0];
  return latestNotify?.mobile_notify_title || "";
};
