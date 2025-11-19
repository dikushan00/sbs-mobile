import { STORAGE_KEYS, STORE_KEYS } from "@/constants";
import { AppDispatch } from "@/services/redux";
import { getMenuData, getUserInfo } from "@/services/redux/reducers/userApp";
import { storageService } from "@/services/storage";
import {
  AuthLoginData,
  AuthRegisterData,
  LoginResponseType,
  NetworkErrorType,
} from "@/services/types";
import * as SecureStore from "expo-secure-store";
import { loginAPI } from "./api";

export const handleLoginResData = async (
  res: LoginResponseType,
  dispatch: AppDispatch | null
) => {
  const { token, user } = res;
  await SecureStore.setItemAsync(STORE_KEYS.accessToken, token?.access);
  await SecureStore.setItemAsync(STORE_KEYS.refreshToken, token?.refresh);
  await SecureStore.setItemAsync(STORE_KEYS.auth, "true");

  if (dispatch) {
    await storageService.setData(STORAGE_KEYS.userData, user);
    dispatch(getUserInfo());
    dispatch(getMenuData());
  }
  return { token, user, status: true };
};

export const doLogin = async (
  body: AuthLoginData,
  dispatch: AppDispatch | null = null,
  returnRes: boolean = false
): Promise<LoginResponseType | NetworkErrorType | undefined> => {
  body.is_mobile = true;
  try {
    const res = await loginAPI.login(body);
    if (!res) return;
    if (returnRes) return res;
    return await handleLoginResData(res, dispatch);
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
export const requestNewPassword = async (body: { email: string }) => {
  try {
    await loginAPI.requestNewPassword(body);
    return true;
  } catch (e: any) {}
};
export const registerNewContractor = async (body: AuthRegisterData) => {
  try {
    await loginAPI.register(body);
    return true;
  } catch (e: any) {}
};