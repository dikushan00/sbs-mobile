import { MODAL_NAMES } from "@/components/Modal/services";
import { okkCheck } from "@/components/pages/okk/services";
import { sendProjectOkkCheck } from "@/components/pages/projectOkk/services";
import {
  beforeWorkCheck,
  passKeys,
  receiveKeys,
  submitWork,
} from "@/components/pages/remonts/services";
import { COLORS, STORE_KEYS, webUrl } from "@/constants";
import * as Device from "expo-device";
import * as Notifications from "expo-notifications";
import * as SecureStore from "expo-secure-store";
import { Platform } from "react-native";
import { appAPI } from "./api/appAPI";
import { AppDispatch } from "./redux";
import {
  closeBottomDrawer,
  closeModal,
  setShouldPageDataReload,
  showModal,
} from "./redux/reducers/app";
import { MenuItem, UserDataType } from "./redux/types";
import { storageService } from "./storage";
import { AuthLoginData, LoginResponseType } from "./types";

export const getWebViewUrl = (loginData: LoginResponseType) => {
  return `${webUrl}/?${STORE_KEYS.accessToken}=${loginData.token?.access}&${STORE_KEYS.refreshToken}=${loginData.token?.refresh}`;
};

export const getUserCredentials = async (): Promise<
  AuthLoginData | undefined
> => {
  try {
    const login = await SecureStore.getItemAsync(STORE_KEYS.login);
    const password = await SecureStore.getItemAsync(STORE_KEYS.password);
    if (!login || !password) return;
    return { password, login };
  } catch (error) {}
};

export const getUserData = async (
  isProjectOkk: boolean
): Promise<UserDataType | undefined> => {
  try {
    return await appAPI.getUserData(!!isProjectOkk);
  } catch (e) {}
};

export const getMenu = async (): Promise<MenuItem[] | undefined> => {
  try {
    const res = await appAPI.getMenu();
    return res?.data;
  } catch (e) {}
};

export const deletePushToken = async (token: string) => {
  try {
    await appAPI.deletePushToken({ mobile_token: token });
  } catch (e) {}
};

export const getAppLastVersion = async () => {
  try {
    const res = await appAPI.getAppLastVersion();
    return res?.data;
  } catch (e) {}
};

export const registerForPushNotificationsAsync = async () => {
  if (Platform.OS === "android") {
    Notifications.setNotificationChannelAsync("default", {
      name: "default",
      importance: Notifications.AndroidImportance.MAX,
      vibrationPattern: [0, 250, 250, 250],
      lightColor: "#FF231F7C",
    });
  }

  if (Device.isDevice) {
    const { status: existingStatus } =
      await Notifications.getPermissionsAsync();
    let finalStatus = existingStatus;
    if (existingStatus !== "granted") {
      const { status } = await Notifications.requestPermissionsAsync();
      finalStatus = status;
    } else return true;
    if (finalStatus !== "granted") {
      alert("Failed to get push token for push notification!");
      return;
    }
    return true;
  } else {
    alert("Must use physical device for Push Notifications");
  }
};

export const sortArrayToFirstPlace = (
  arr: any[] = [],
  key: string,
  name: string
) => {
  try {
    return arr.sort((a, b) => {
      if (a[key] === name && b[key] !== name) {
        return -1;
      }
      if (a[key] !== name && b[key] === name) {
        return 1;
      }
      return 0;
    });
  } catch (e) {
    return arr;
  }
};

export const getPrimaryColor = (disabled: boolean = false): string =>
  disabled ? COLORS.primaryDisabled : COLORS.primary;

export const offlineActionsKeys = {
  beforeWorkCheck: "beforeWorkCheck",
  submitWork: "submitWork",
  receiveKeys: "receiveKeys",
  passKeys: "passKeys",
  okkCheck: "okkCheck",
  sendProjectOkkCheck: "sendProjectOkkCheck",
};

export type OfflineActionKeyType = keyof typeof offlineActionsKeys;

const getOfflineFunction = (code: OfflineActionKeyType) => {
  switch (code) {
    case offlineActionsKeys.beforeWorkCheck:
      return beforeWorkCheck;
    case offlineActionsKeys.submitWork:
      return submitWork;
    case offlineActionsKeys.receiveKeys:
      return receiveKeys;
    case offlineActionsKeys.passKeys:
      return passKeys;
    case offlineActionsKeys.okkCheck:
      return okkCheck;
    case offlineActionsKeys.sendProjectOkkCheck:
      return sendProjectOkkCheck;
  }
};

export const doOfflineActions = async (dispatch: AppDispatch) => {
  const actions = await storageService.getData("offlineActions");
  if (!actions?.length) return;

  dispatch(closeBottomDrawer());
  dispatch(showModal({ type: MODAL_NAMES.syncData, data: { close: false } }));

  const res = await actions.reduce(async (prevPromise: any, action: any) => {
    const results = await prevPromise;

    const args = action.args || [];
    if (!action.code) {
      await storageService.removeItem("offlineActions", action.id, "id");
      return results;
    }

    const offlineFunction = getOfflineFunction(action.code);
    if (!offlineFunction) {
      await storageService.removeItem("offlineActions", action.id, "id");
      return results;
    }

    try {
      //@ts-ignore
      const result = await offlineFunction(...args);

      await storageService.removeItem("offlineActions", action.id, "id");
      return [...results, result];
    } catch (error) {
      await storageService.removeItem("offlineActions", action.id, "id");
      return results;
    }
  }, Promise.resolve([]));

  const filtered = res
    ?.filter((item: any) => item !== true)
    ?.map((item: any) => !!item || item === null);

  const lastSuccessResIndex = filtered?.lastIndexOf(true);
  const successRes = filtered ? filtered[lastSuccessResIndex] : null;

  if (successRes) dispatch(setShouldPageDataReload(true));
  dispatch(closeModal());
};
