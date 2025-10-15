import {
  BottomDrawerContentKeys,
  BottomDrawerPayload,
} from "@/components/BottomDrawer/types";
import { ModalKeys, ModalPayload } from "@/components/Modal/types";
import { PayloadAction, createSlice } from "@reduxjs/toolkit";
import { AppThunk, RootState } from "..";
import { AppStateType } from "../types";
import { checkUserAuth } from "./userApp";

const initialState: AppStateType = {
  init: false,
  webViewMode: { active: false, loading: false },
  networkWasOff: false,
  newVersionBannerShowed: false,
  bottomDrawerData: { show: false, data: null, type: null, loading: false },
  secondBottomDrawerData: { show: false, data: null, type: null, loading: false },
  modal: { show: false, data: null, type: null },
  shouldPageDataReload: false,
  pageSettings: { backBtn: false, goBack: null },
  hideFooterNav: false,
};
const appSlice = createSlice({
  name: "app",
  initialState: { ...initialState },
  reducers: {
    setInit: (state) => {
      state.init = true;
    },
    showWebViewMode: (state) => {
      state.webViewMode = { active: true, loading: true };
    },
    closeWebViewMode: (state) => {
      state.webViewMode = { active: false, loading: false };
    },
    endWebViewModeLoading: (state) => {
      state.webViewMode = { active: true, loading: false };
    },
    setNetworkStatus: (state, { payload }) => {
      state.networkWasOff = !!payload;
    },
    setShowNewVersionBanner: (state, { payload }) => {
      state.newVersionBannerShowed = !!payload;
    },
    setShouldPageDataReload: (state, { payload }) => {
      state.shouldPageDataReload = !!payload;
    },
    showBottomDrawer: (
      state,
      action: PayloadAction<BottomDrawerPayload<BottomDrawerContentKeys | null>>
    ) => {
      const { payload } = action;
      state.bottomDrawerData = { ...payload, show: true, loading: false };
    },
    closeBottomDrawer: (state) => {
      state.bottomDrawerData = {
        show: false,
        type: null,
        data: null,
        loading: false,
      };
    },
    setBottomDrawerLoading: (state, { payload }) => {
      state.bottomDrawerData = { ...state.bottomDrawerData, loading: payload };
    },
    showSecondBottomDrawer: (
      state,
      action: PayloadAction<BottomDrawerPayload<BottomDrawerContentKeys | null>>
    ) => {
      const { payload } = action;
      state.secondBottomDrawerData = { ...payload, show: true, loading: false };
    },
    closeSecondBottomDrawer: (state) => {
      state.secondBottomDrawerData = {
        show: false,
        type: null,
        data: null,
        loading: false,
      };
    },
    setSecondBottomDrawerLoading: (state, { payload }) => {
      state.secondBottomDrawerData = { ...state.secondBottomDrawerData, loading: payload };
    },
    setPageSettings: (state, { payload }) => {
      try {
        state.pageSettings = { ...state.pageSettings, ...payload };
      } catch (e) {
        state.pageSettings = { backBtn: false, goBack: null };
      }
    },
    showModal: (
      state,
      action: PayloadAction<ModalPayload<ModalKeys | null>>
    ) => {
      const { payload } = action;
      state.modal = { ...payload, show: true };
    },
    closeModal: (state) => {
      state.modal = { show: false, type: null, data: null };
    },
    setHideFooterNav: (state, { payload }) => {
      state.hideFooterNav = !!payload;
    },
  },
});
export const {
  setInit,
  showWebViewMode,
  closeWebViewMode,
  endWebViewModeLoading,
  setShowNewVersionBanner,
  showBottomDrawer,
  setShouldPageDataReload,
  setNetworkStatus,
  closeBottomDrawer,
  setBottomDrawerLoading,
  showSecondBottomDrawer,
  closeSecondBottomDrawer,
  setSecondBottomDrawerLoading,
  showModal,
  closeModal,
  setPageSettings,
  setHideFooterNav,
} = appSlice.actions;

export type appStateType = ReturnType<typeof appSlice.reducer>;
export const appState = (state: RootState) => state.app;
export default appSlice.reducer;

export const initialize = (): AppThunk => async (dispatch) => {
  const checkAuth = dispatch(checkUserAuth());

  return Promise.all([checkAuth])
    .then(() => dispatch(setInit()))
    .catch(() => {});
};
