import { STORAGE_KEYS, STORE_KEYS } from "@/constants";
import { AppDispatch } from "@/services/redux";
import {
  getMenuData,
  setIsProjectOkk,
  setUserData,
} from "@/services/redux/reducers/userApp";
import { storageService } from "@/services/storage";
import {
  AuthLoginData,
  AuthRegisterData,
  LoginResponseType,
} from "@/services/types";
import * as SecureStore from "expo-secure-store";
import { loginAPI } from "./api";
import Toast from "react-native-toast-message";

export const handleLoginResData = async (
  res: LoginResponseType,
  isProjectOkk: boolean,
  dispatch: AppDispatch | null
) => {
  const { token, user } = res;
  await SecureStore.setItemAsync(STORE_KEYS.accessToken, token?.access);
  await SecureStore.setItemAsync(STORE_KEYS.refreshToken, token?.refresh);
  await SecureStore.setItemAsync(STORE_KEYS.auth, "true");
  await SecureStore.setItemAsync(
    STORE_KEYS.isProjectOkk,
    isProjectOkk ? "true" : "false"
  );
  if (dispatch) {
    await storageService.setData(STORAGE_KEYS.userData, user);
    dispatch(setUserData(user));
    dispatch(getMenuData());
    dispatch(setIsProjectOkk(!!isProjectOkk));
  }
  return { token, user, status: true };
};

const masterLogin = async (body: AuthLoginData, isProjectOkk: boolean) => {
  try {
    const res = loginAPI.login(body, isProjectOkk, {
      showSnackbar: false,
      throwError: false,
    });
    return res;
  } catch (e: any) {}
};

export const loginFormReq = async (body: AuthLoginData) => {
  try {
    const res = await Promise.allSettled([
      masterLogin(body, false),
      masterLogin(body, true),
    ]);

    const isResExist = res?.some(
      (item) => !!item && item?.status === "fulfilled"
    );
    if (!isResExist) {
      res?.forEach((item) => {
        Toast.show({
          type: "error",
          //@ts-ignore
          text1: item.reason,
          position: "top",
          visibilityTime: 3000,
          autoHide: true,
          topOffset: 50,
        });
      });
      return;
    }

    const [masterRes, okkRes] = res;

    const modules = [
      { res: masterRes, type: "master" },
      { res: okkRes, type: "okk" },
    ];
    return (
      modules
        .filter((item) => !!item.res && item.res.status === "fulfilled")
        //@ts-ignore
        ?.map((item) => ({ ...item, res: item.res?.value }))
    );
  } catch (e: any) {}
};

export const doLogin = async (
  body: AuthLoginData,
  dispatch: AppDispatch | null = null,
  isProjectOkk = false
) => {
  if (isProjectOkk) {
    body.is_mobile = true;
  }
  try {
    const res = await loginAPI.login(body, isProjectOkk);

    if (!res) return;
    return await handleLoginResData(res, isProjectOkk, dispatch);
  } catch (e: any) {
    if (e?.code === "ERR_NETWORK") return { status: false, errNetwork: true };
  }
};
export const checkAuth = async (): Promise<boolean> => {
  try {
    const token = await SecureStore.getItemAsync(STORE_KEYS.accessToken);
    if (!token) return false;
    await loginAPI.checkAuth({ token });
    return true;
  } catch (e) {
    return false;
  }
};
export const registerNewContractor = async (body: AuthRegisterData) => {
  try {
    await loginAPI.register(body);
    return true;
  } catch (e: any) {}
};
export const requestNewPassword = async (
  body: { email: string },
  isProjectOkk: boolean
) => {
  try {
    await loginAPI.requestNewPassword(body, isProjectOkk);
    return true;
  } catch (e: any) {}
};
