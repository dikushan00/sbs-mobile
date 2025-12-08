import { BottomDrawerDataType } from "@/components/BottomDrawer/types";
import { ModalDataType } from "@/components/Modal/types";
import { OfflineActionKeyType } from "..";
import { OkkDataType } from "@/components/pages/okk/services";

export interface AppStateType {
  init: boolean;
  networkWasOff: boolean;
  newVersionBannerShowed: boolean;
  shouldPageDataReload: boolean;
  webViewMode: { active: boolean; loading: boolean };
  bottomDrawerData: BottomDrawerDataType;
  secondBottomDrawerData: BottomDrawerDataType;
  modal: ModalDataType;
  pageSettings: { backBtn: boolean; goBack: (() => void) | null };
  hideFooterNav: boolean;
}

export type MenuItem = {
  icon: string;
  menu_action: string;
  menu_id: number;
  menu_name: string;
  what: string | null;
  count: number | null;
  sub_menus: MenuItem[] | null;
};

export type PageHeaderDataType = {
  title: string | null;
  desc: string | null;
  descColor: string | null;
};
export type UserDataType = {
  city_id: number;
  city_name: string;
  company_id: number;
  company_name: string;
  email: string;
  employee_id: number;
  contractor_id: number;
  fio: string;
  group_names: string;
  image_url: string | null;
  is_service_master: boolean;
  permissions: {
    show_update_grade_button: boolean;
    show_add_timeline_button: boolean;
    show_is_stop_timeline_button: boolean;
  };
  position_code: string;
  position_name: string;
  token: string;
  token_url: string;
};
export interface UserAppStateType {
  auth: boolean;
  loginData: { token: { access: string; refresh: string } } | null;
  pageHeaderData: PageHeaderDataType;
  menu: MenuItem[];
  userData: UserDataType | null;
  okkData: OkkDataType[];
  isFetching: boolean;
  logoutLoading: boolean;
  isOkk: boolean;
  userDataFetching: boolean;
}

export interface OfflineActionType {
  id: string;
  code: OfflineActionKeyType;
  args: any[];
}
