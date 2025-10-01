import { COLORS, FONT, SHADOWS, SIZES } from "./theme";

// export const webUrl = "https://devpartner.smart-remont.kz";
export const webUrl = __DEV__
  ? "https://devpartner.smart-remont.kz"
  : "https://partner.smartremont.kz";

export { COLORS, FONT, SIZES, SHADOWS };

export const STORE_KEYS = {
  login: "login",
  password: "password",
  allowBiometry: "allowBiometry",
  accessToken: "accessToken",
  refreshToken: "refreshToken",
  auth: "auth",
  isProjectOkk: "isProjectOkk",
};

//Prod
// export const apiUrl = PROD_API_URL;
// export const MASTER_API = "https://master-api.smartremont.kz";


const DEV_API_URL = "https://devpartner-back.smart-remont.kz";
const PROD_API_URL = "https://bpapi.smartremont.kz";
export const apiUrl = __DEV__ ? DEV_API_URL : PROD_API_URL;

export const FILE_URL = "https://office.smartremont.kz";
export const MASTER_API = __DEV__
  ? "https://devmaster-back.smart-remont.kz"
  : "https://master-api.smartremont.kz";

export const FILE_URL_MAIN = "https://bpapi.smartremont.kz";

export const STORAGE_KEYS = {
  userData: "userData",
  menu: "menu",
  remonts: "remonts",
  projectOkkData: "projectOkkData",
  checkListPoints: "checkListPoints",
  offlineActions: "offlineActions",
  tasks: "tasks",
  notifications: "notifications",
} as const;

export const PAGE_NAMES = {
  main: "main",
  login: "login",
  register: "register",
  forgetPassword: "forgetPassword",
  okkTasks: "okkTasks",
  remontList: "remontList",
  remontDetail: "remontDetail",
  tasks: "tasks",
  notifications: "notifications",
};

export type PageNameKeysType = keyof typeof PAGE_NAMES;
