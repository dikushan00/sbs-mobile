import { apiUrl } from "@/constants";
import { instance } from ".";
import { MenuItem, UserDataType } from "../redux/types";
import { CityType, ReqResponse } from "../types";

export const appAPI = {
  async getUserData(): Promise<{ user_info: UserDataType }> {
    return await instance()
      .get("/common/user_info/")
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
  async addPushToken(body: {
    mobile_token: string;
  }): Promise<{ data: boolean }> {
    return await instance(true, { showSnackbar: false })
      .post("/auth/mobile_token/add/", body)
      .then((res) => res?.data);
  },
  async getAppLastVersion(): Promise<{ data: { version_name: string } }> {
    return await instance(false, { showSnackbar: false }, apiUrl)
      .get("/common/mobile_app/version/get/")
      .then((res) => res?.data);
  },
  async getCities(): Promise<ReqResponse<CityType[] | undefined>> {
    return await instance()
      .get("/common/cities/read/")
      .then((res) => res?.data);
  },
  async chooseCity(city_id: number) {
    return await instance()
      .post("/common/cities/choose/", {city_id})
      .then((res) => res?.data);
  },
  async deleteAccount(): Promise<{ status: boolean }> {
    return await instance()
      .delete("/mobile/user_delete/")
      .then((res) => res?.data);
  },
};
