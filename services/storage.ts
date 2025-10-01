import { NotificationsResponse } from "@/components/pages/notifications/services";
import { RemontType, WorkType } from "@/components/pages/remonts/types";
import { STORAGE_KEYS } from "@/constants";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { MenuItem, OfflineActionType, UserDataType } from "./redux/types";
import { WorkStatusesKeyType } from "@/components/pages/remonts/services";
import {
  CheckListPointsType,
  OkkStatusKeyType,
  ProjectOkkDataType,
} from "@/components/pages/projectOkk/services";

type StorageKeyType = keyof typeof STORAGE_KEYS;
type StorageDataMap = {
  [STORAGE_KEYS.remonts]: RemontType[] | null;
  [STORAGE_KEYS.projectOkkData]: Record<
    OkkStatusKeyType,
    ProjectOkkDataType[]
  > | null;
  [STORAGE_KEYS.checkListPoints]: CheckListPointsType[] | null;
  [STORAGE_KEYS.menu]: MenuItem[] | null;
  [STORAGE_KEYS.userData]: UserDataType | null;
  [STORAGE_KEYS.offlineActions]: OfflineActionType[] | null;
  [STORAGE_KEYS.tasks]: Record<WorkStatusesKeyType, WorkType[]> | null;
  [STORAGE_KEYS.notifications]: NotificationsResponse[] | null;
};

export const storageService = (function () {
  async function _setData<K extends StorageKeyType>(
    key: StorageKeyType,
    data: StorageDataMap[K]
  ) {
    try {
      await AsyncStorage.setItem(key, JSON.stringify(data));
    } catch (e) {}
  }

  async function _getData<K extends StorageKeyType>(
    key: K
  ): Promise<StorageDataMap[K] | undefined> {
    let stringData: string | null = "";
    try {
      stringData = await AsyncStorage.getItem(key);
    } catch (e) {}
    if (!stringData) return;
    const data: StorageDataMap[K] = JSON.parse(stringData);
    if (typeof data !== "object" || typeof data !== "object") return;
    return data;
  }

  async function _addNewItem(key: StorageKeyType, data: OfflineActionType) {
    try {
      const dataList = (await storageService.getData(key)) || [];
      //@ts-ignore
      const updatedData = [...dataList, data];
      await AsyncStorage.setItem(key, JSON.stringify(updatedData));
    } catch (e) {}
  }

  async function _removeItem(
    key: "offlineActions",
    id: number | string,
    idKey: string = "id"
  ) {
    try {
      const dataList = (await storageService.getData(key)) || [];
      //@ts-ignore
      const updatedData = dataList?.filter((item) => item[idKey] !== id);
      await AsyncStorage.setItem(key, JSON.stringify(updatedData));
    } catch (e) {}
  }

  async function _resetData(key: StorageKeyType) {
    try {
      await AsyncStorage.removeItem(key);
    } catch (e) {}
  }

  async function _resetAllData() {
    await Promise.all(
      Object.keys(STORAGE_KEYS).map(async (key) => {
        try {
          await AsyncStorage.removeItem(key);
        } catch (e) {}
      })
    );
  }

  async function _getAllData(): Promise<StorageDataMap> {
    const data: StorageDataMap = {
      remonts: null,
      projectOkkData: null,
      userData: null,
      menu: null,
      offlineActions: null,
      tasks: null,
      notifications: null,
      checkListPoints: null,
    };
    await Promise.all(
      Object.keys(STORAGE_KEYS).map(async (key) => {
        try {
          const storageKey: StorageKeyType = key as StorageKeyType;
          const storageItemData = await _getData(storageKey);
          //@ts-ignore
          data[storageKey] = storageItemData?.data || null;
        } catch (e) {}
      })
    );
    return data;
  }

  return {
    setData: _setData,
    getData: _getData,
    addNewItem: _addNewItem,
    removeItem: _removeItem,
    getAllData: _getAllData,
    resetData: _resetData,
    resetAllData: _resetAllData,
  };
})();
