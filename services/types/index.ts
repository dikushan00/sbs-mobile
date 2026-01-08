import { UserDataType } from "../redux/types";

export type ReqResponse<T> = {
  errorCode: number;
  status: boolean;
  data: T;
};
export interface LoginResponseType {
  token: { access: string; refresh: string };
  user: UserDataType;
  status: boolean;
}
export interface NetworkErrorType {
  status: boolean;
  errNetwork: boolean;
}

export type AuthLoginData = {
  login: string;
  password: string;
  is_mobile?: boolean;
  mobile_token?: string;
};

export type AuthRegisterData = {
  fio: string;
  login: string;
  password: string;
  password_repeat: string;
};

export type MobileNotifyGroupCodeType = 'OKK' | 'AGREEMENT' | 'DOCUMENTS' | 'MATERIALS';
export interface NotificationType {
  mobile_notify_id: number;
  mobile_notify_title: string;
  mobile_notify_text: string;
  mobile_notify_type_name: string;
  mobile_notify_type_code: string;
  project_id?: number | null;
  help_call_id?: number | null;
  date_create: string;
  is_read: boolean;
}

export type FileType = {
  uri: string;
  name: string;
  type: string;
  desc?: string;
  room_id?: number;
  checked?: boolean;
  deletable?: boolean;
  file?: Blob | undefined | null;
};

export interface CityType {
  city_id: number;
  city_name: string;
  is_filter: boolean;
}