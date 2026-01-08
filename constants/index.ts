import { COLORS, FONT, SHADOWS, SIZES } from "./theme";

export const webUrl = __DEV__
  ? "https://devmaster.smart-remont.kz"
  : "https://master.smartremont.kz";

export { COLORS, FONT, SIZES, SHADOWS };

export const STORE_KEYS = {
  login: "login",
  password: "password",
  allowBiometry: "allowBiometry",
  accessToken: "accessToken",
  refreshToken: "refreshToken",
  auth: "auth",
};

const DEV_API_URL = "https://devmaster-back.smart-remont.kz";
const PROD_API_URL = "https://master-api.smartremont.kz";
export const apiUrl = __DEV__ ? DEV_API_URL : PROD_API_URL;

//Prod
// export const apiUrl = PROD_API_URL;
// export const apiUrl = DEV_API_URL;

export const FILE_URL_MAIN = PROD_API_URL;

export const STORAGE_KEYS = {
  userData: "userData",
  menu: "menu",
  okkData: "okkData",
  checkListPoints: "checkListPoints",
  offlineActions: "offlineActions",
  notifications: "notifications",
  userType: "userType",
  notificationsEnabled: "notificationsEnabled",
} as const;

export type UserTypeValue = 'individual' | 'business';

export const PAGE_NAMES = {
  main: "main",
  okk: "okk",
  login: "login",
  register: "register",
  forgetPassword: "forgetPassword",
  okkTasks: "okkTasks",
  notifications: "notifications",
  notificationDetails: "notificationDetails",
  profile: "profile",
};

export type PageNameKeysType = keyof typeof PAGE_NAMES;

export const mobileSignUrl = "https://m.egov.kz/mobileSign/";
export const mobileSignBusinessUrl = "https://m.egov.kz/businessSign/";
