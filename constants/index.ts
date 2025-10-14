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

//Prod
// export const apiUrl = PROD_API_URL;
// export const MASTER_API = "https://master-api.smartremont.kz";

const DEV_API_URL = "https://devmaster-back.smart-remont.kz";
const PROD_API_URL = "https://master-api.smartremont.kz";
export const apiUrl = __DEV__ ? DEV_API_URL : PROD_API_URL;

export const FILE_URL = "https://office.smartremont.kz";

export const FILE_URL_MAIN = PROD_API_URL;

export const STORAGE_KEYS = {
  userData: "userData",
  menu: "menu",
  okkData: "okkData",
  checkListPoints: "checkListPoints",
  offlineActions: "offlineActions",
  notifications: "notifications",
} as const;

export const PAGE_NAMES = {
  main: "main",
  login: "login",
  forgetPassword: "forgetPassword",
  okkTasks: "okkTasks",
  notifications: "notifications",
  profile: "profile",
};

export type PageNameKeysType = keyof typeof PAGE_NAMES;
