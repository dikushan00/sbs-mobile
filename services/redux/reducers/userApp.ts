import { getOkkTasks, updateOkkData } from "@/components/pages/okk/services";
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
  okkData: [],
  isFetching: false,
  logoutLoading: false,
  userDataFetching: false,
  isOkk: false,
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
    setOkkData: (state, { payload }) => {
      state.okkData = payload || [];
    },
    setIsFetching: (state, { payload }) => {
      state.isFetching = !!payload;
    },
    setUserDataFetching: (state, { payload }) => {
      state.userDataFetching = !!payload;
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
    resetData: () => {
      return { ...initialState };
    },
  },
});
export const {
  setUserData,
  setAuth,
  setMenu,
  setLoginData,
  resetData,
  setPageHeaderData,
  setIsFetching,
  setLogoutLoading,
  setOkkData,
  setUserDataFetching,
} = appSlice.actions;

export type appStateType = ReturnType<typeof appSlice.reducer>;
export const userAppState = (state: RootState) => state.userApp;
export default appSlice.reducer;

export const getUserInfo = (): AppThunk => async (dispatch) => {
  dispatch(setUserDataFetching(true));
  const res = await getUserData();
  dispatch(setUserDataFetching(false));
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
    return
    if (getState()?.userApp?.menu?.length && !update) return;
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

  const res = await doLogin(data, dispatch);
  if (!res?.status) {
    //@ts-ignore
    if (res?.errNetwork) {
      dispatch(setAuth(true));
      dispatch(getUserInfo());
      dispatch(getMenuData());
      return;
    }
    return resetAuthData();
  }
  dispatch(setAuth(true));
  dispatch(getUserInfo());
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
  if(!__DEV__)  {
    const token = (await Notifications.getExpoPushTokenAsync()).data;
    if (token) deletePushToken(token);
  }
  dispatch(resetData());
  await storageService.resetAllData();
  await SecureStore.deleteItemAsync(STORE_KEYS.auth);
  dispatch(setLogoutLoading(false));
};

export const getOkkData =
  (
    setIsRefreshing: (s: boolean) => void,
    options: { signal?: AbortSignal; params?: any } = {},
    isRefreshing = false
  ): AppThunk =>
  async (dispatch) => {
    if (!isRefreshing) dispatch(setOkkData([]));
    isRefreshing ? setIsRefreshing(true) : dispatch(setIsFetching(true));
    const res = await getOkkTasks(options.params, options.signal, dispatch);
    isRefreshing ? setIsRefreshing(false) : dispatch(setIsFetching(false));
    dispatch(setOkkData(res || []));
  };

export const onSuccessOkkCheck =
  (residentId: number, entrance: number, helpCallId: number): AppThunk =>
  async (dispatch, getState) => {
    const okkData = getState()?.userApp?.okkData;
    const editedOkkData = okkData?.map((item) => {
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
    await updateOkkData("PROCESSING", editedOkkData);
    dispatch(setOkkData(editedOkkData || []));
  };
