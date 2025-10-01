import { UserDataType } from "../redux/types";

export type ReqResponse<T> = {
  errorCode: number;
  status: boolean;
  data: T;
};
export interface LoginResponseType {
  token: { access: string; refresh: string };
  user: UserDataType;
}

export type AuthLoginData = {
  login: string;
  password: string;
  is_mobile?: boolean
  mobile_token?: string
};

export type AuthRegisterData = {
  fio: string;
  login: string;
  password: string;
  password_repeat: string;
};
export interface NotificationType {
  mobile_notify_id: number;
  mobile_notify_title: string;
  mobile_notify_text: string;
  mobile_notify_type_name: string;
  mobile_notify_type_code: string;
  remont_id?: number | null;
  date_create: string;
}
