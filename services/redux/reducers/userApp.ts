import { getOkkRemonts } from "@/components/pages/okk/services";
import {
  getOkkTasks,
  updateProjectOkkData,
} from "@/components/pages/projectOkk/services";
import { getRemonts } from "@/components/pages/remonts/services";
import { RemontType } from "@/components/pages/remonts/types";
import { STORAGE_KEYS, STORE_KEYS } from "@/constants";
import {
  deletePushToken,
  getMenu,
  getUserCredentials,
  getUserData,
} from "@/services";
import { storageService } from "@/services/storage";
import { createSlice } from "@reduxjs/toolkit";
import * as Notifications from "expo-notifications";
import * as SecureStore from "expo-secure-store";
import { AppThunk, RootState } from "..";
import { checkAuth, doLogin } from "../../../components/login/services";
import { MenuItem, PageHeaderDataType, UserAppStateType } from "../types";

const initialState: UserAppStateType = {
  auth: false,
  loginData: null,
  pageHeaderData: { title: "", desc: "", descColor: "" },
  menu: [],
  userData: null,
  remonts: [],
  projectOkkData: [],
  remontInfo: null,
  isRemontsFetching: false,
  logoutLoading: false,
  isOkk: false,
  isProjectOkk: false,
};
const appSlice = createSlice({
  name: "userApp",
  initialState: { ...initialState },
  reducers: {
    setAuth: (state, { payload }) => {
      state.auth = payload;
    },
    setUserData: (state, { payload }) => {
      if (payload.position_code === "OKK") state.isOkk = true;
      state.userData = payload;
    },
    setMenu: (state, { payload }) => {
      state.menu = payload;
    },
    setIsProjectOkk: (state, { payload }) => {
      state.isProjectOkk = payload;
    },
    setRemonts: (state, { payload }) => {
      state.remonts = payload || [];
    },
    setProjectOkkData: (state, { payload }) => {
      state.projectOkkData = payload || [];
    },
    setRemontInfo: (state, { payload }) => {
      state.remontInfo = payload || null;
    },
    setIsRemontFetching: (state, { payload }) => {
      state.isRemontsFetching = !!payload;
    },
    setLogoutLoading: (state, { payload }) => {
      state.logoutLoading = !!payload;
    },
    setPageHeaderData: (
      state,
      { payload }: { payload: Partial<PageHeaderDataType> }
    ) => {
      try {
        state.pageHeaderData = { ...state.pageHeaderData, ...payload };
      } catch (e) {}
    },
    setLoginData: (state, { payload }) => {
      state.loginData = payload;
    },
    resetData: (state) => {
      return {...initialState, isProjectOkk: state.isProjectOkk}
    },
  },
});
export const {
  setUserData,
  setAuth,
  setMenu,
  setRemonts,
  setRemontInfo,
  setLoginData,
  resetData,
  setPageHeaderData,
  setIsRemontFetching,
  setLogoutLoading,
  setIsProjectOkk,
  setProjectOkkData,
} = appSlice.actions;

export type appStateType = ReturnType<typeof appSlice.reducer>;
export const userAppState = (state: RootState) => state.userApp;
export default appSlice.reducer;

export const getUserInfo = (): AppThunk => async (dispatch) => {
  const isProjectOkk = await SecureStore.getItemAsync(STORE_KEYS.isProjectOkk);
  const res = await getUserData(isProjectOkk === "true");
  if (!res) {
    const localData = await storageService.getData(STORAGE_KEYS.userData);
    if (!localData || !localData) return;
    return dispatch(setUserData(localData));
  }
  dispatch(setUserData(res));
  await storageService.setData(STORAGE_KEYS.userData, res);
};
export const getMenuData =
  (update = false): AppThunk =>
  async (dispatch, getState) => {
    if (getState()?.userApp?.menu?.length && !update) return;
    const isProjectOkk = await SecureStore.getItemAsync(
      STORE_KEYS.isProjectOkk
    );
    if (isProjectOkk === "true") return;
    const res = await getMenu();
    if (!res) {
      const localData = await storageService.getData(STORAGE_KEYS.menu);
      if (!localData || !localData?.length) return;
      return dispatch(setMenu(localData));
    }
    let data: MenuItem[] | null = [];
    try {
      data = res[0].sub_menus;
    } catch (e) {}
    dispatch(setMenu(data));
    await storageService.setData(STORAGE_KEYS.menu, data);
  };

const login = (): AppThunk => async (dispatch) => {
  const data = await getUserCredentials();
  if (!data) return;

  const isProjectOkk = await SecureStore.getItemAsync(STORE_KEYS.isProjectOkk);
  const res = await doLogin(data, dispatch, isProjectOkk === "true");
  if (!res?.status) {
    //@ts-ignore
    if (res?.errNetwork) {
      dispatch(setIsProjectOkk(isProjectOkk === "true"));
      dispatch(setAuth(true));
      dispatch(getUserInfo());
      dispatch(getMenuData());
      return;
    }
    return resetAuthData();
  }
  dispatch(setIsProjectOkk(isProjectOkk === "true"));
  dispatch(setAuth(true));
  //@ts-ignore
  dispatch(setUserData(res.user));
  dispatch(setLoginData(res));
  dispatch(getMenuData());
};

export const checkUserAuth = (): AppThunk => async (dispatch, getState) => {
  const auth = await SecureStore.getItemAsync(STORE_KEYS.auth);
  if (auth !== "true") return;
  if (getState()?.userApp?.auth) return;
  const res = await checkAuth();
  if (!res) return dispatch(login());
  dispatch(setAuth(true));
  dispatch(getUserInfo());
  dispatch(getMenuData());

  const access = await SecureStore.getItemAsync(STORE_KEYS.accessToken);
  const refresh = await SecureStore.getItemAsync(STORE_KEYS.refreshToken);
  dispatch(setLoginData({ token: { access, refresh } }));
};

export const resetAuthData = async () => {
  try {
    await SecureStore.deleteItemAsync(STORE_KEYS.allowBiometry);
    await SecureStore.deleteItemAsync(STORE_KEYS.login);
    await SecureStore.deleteItemAsync(STORE_KEYS.password);
    await SecureStore.deleteItemAsync(STORE_KEYS.accessToken);
    await SecureStore.deleteItemAsync(STORE_KEYS.refreshToken);
  } catch (e) {}
};

export const logout = (): AppThunk => async (dispatch) => {
  dispatch(setLogoutLoading(true));
  const token = (await Notifications.getExpoPushTokenAsync()).data;
  if (token) deletePushToken(token);
  dispatch(resetData());
  await storageService.resetAllData();
  await SecureStore.deleteItemAsync(STORE_KEYS.auth);
  dispatch(setLogoutLoading(false));
};

export const changeRemontsData =
  (remont: RemontType): AppThunk =>
  async (dispatch, getState) => {
    const remonts = getState()?.userApp?.remonts;
    if (remonts?.length) {
      const updatedRemonts = remonts?.map((item: RemontType) => {
        if (item.remont_id === remont?.remont_id)
          return { ...item, info: { ...remont, remont_info: remont } };
        return item;
      });
      dispatch(setRemonts(updatedRemonts));
      dispatch(setRemontInfo(remont));
    }
    const remontsData = await storageService.getData(STORAGE_KEYS.remonts);
    if (remontsData?.length) {
      const updatedRemonts = remontsData?.map((item) => {
        if (item.remont_id === remont?.remont_id)
          return { ...item, info: { ...remont, remont_info: remont } };
        return item;
      });
      if (updatedRemonts) {
        //@ts-ignore
        await storageService.setData("remonts", updatedRemonts);
      }
    }
  };

export const getRemontsData =
  (
    setIsRefreshing: (s: boolean) => void,
    options: { signal?: AbortSignal },
    isRefreshing = false,
    isOkk = false
  ): AppThunk =>
  async (dispatch) => {
    isRefreshing ? setIsRefreshing(true) : dispatch(setIsRemontFetching(true));
    const res = isOkk
      ? await getOkkRemonts(options.signal)
      : await getRemonts(options);
    isRefreshing
      ? setIsRefreshing(false)
      : dispatch(setIsRemontFetching(false));
    dispatch(setRemonts(res || []));
  };

export const getProjectOkkData =
  (
    setIsRefreshing: (s: boolean) => void,
    options: { signal?: AbortSignal; params?: any } = {},
    isRefreshing = false
  ): AppThunk =>
  async (dispatch) => {
    if (!isRefreshing) dispatch(setProjectOkkData([]));
    isRefreshing ? setIsRefreshing(true) : dispatch(setIsRemontFetching(true));
    const res = await getOkkTasks(options.params, options.signal, dispatch);
    isRefreshing
      ? setIsRefreshing(false)
      : dispatch(setIsRemontFetching(false));
    dispatch(setProjectOkkData(res || []));
  };

export const onSuccessProjectOkkCheck =
  (residentId: number, entrance: number, helpCallId: number): AppThunk =>
  async (dispatch, getState) => {
    const projectOkkData = getState()?.userApp?.projectOkkData;
    const editedProjectOkkData = projectOkkData?.map((item) => {
      if (item.resident_id === residentId)
        return {
          ...item,
          entrances: item.entrances?.map((ent) => {
            if (ent.entrance === entrance)
              return {
                ...ent,
                calls: ent?.calls?.filter(
                  (call) => call?.help_call_id !== helpCallId
                ),
              };
            return ent;
          }),
        };
      return item;
    });
    await updateProjectOkkData("PROCESSING", editedProjectOkkData);
    dispatch(setProjectOkkData(editedProjectOkkData || []));
  };
