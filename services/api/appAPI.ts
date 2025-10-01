import { apiUrl } from "@/constants";
import { instance } from ".";
import { MenuItem, UserDataType } from "../redux/types";

export const appAPI = {
  async getUserData(isProjectOkk: boolean): Promise<UserDataType> {
    return await instance()
      .get(isProjectOkk ? "/common/user_info/read/" : "user-info/")
      .then((res) => res?.data);
  },
  async getMenu(): Promise<{ data: MenuItem[] }> {
    return await instance()
      .get("/mobile/menu/")
      .then((res) => res?.data);
  },
  async deletePushToken(body: {
    mobile_token: string;
  }): Promise<{ data: boolean }> {
    return await instance(true, { showSnackbar: false })
      .post("/auth/mobile_token/delete/", body)
      .then((res) => res?.data);
  },
  async getAppLastVersion(): Promise<{ data: { version_name: string } }> {
    return await instance(false, { showSnackbar: false }, apiUrl)
      .get("/partner/commons/mobile_app/version/get/")
      .then((res) => res?.data);
  },
};
