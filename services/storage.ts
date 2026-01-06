import { NotificationsResponse } from "@/components/pages/notifications/services";
import { STORAGE_KEYS, UserTypeValue } from "@/constants";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { MenuItem, OfflineActionType, UserDataType } from "./redux/types";
import {
  CheckListPointsType,
  OkkStatusKeyType,
  OkkDataType,
} from "@/components/pages/okk/services";

type StorageKeyType = keyof typeof STORAGE_KEYS;
type StorageDataMap = {
  [STORAGE_KEYS.okkData]: Record<OkkStatusKeyType, OkkDataType[]> | null;
  [STORAGE_KEYS.checkListPoints]: CheckListPointsType[] | null;
  [STORAGE_KEYS.menu]: MenuItem[] | null;
  [STORAGE_KEYS.userData]: UserDataType | null;
  [STORAGE_KEYS.offlineActions]: OfflineActionType[] | null;
  [STORAGE_KEYS.notifications]: NotificationsResponse[] | null;
  [STORAGE_KEYS.userType]: {userType: UserTypeValue} | null;
  [STORAGE_KEYS.notificationsEnabled]: {enabled: boolean} | null;
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
      okkData: null,
      userData: null,
      menu: null,
      offlineActions: null,
      notifications: null,
      checkListPoints: null,
      userType: null,
      notificationsEnabled: null,
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
