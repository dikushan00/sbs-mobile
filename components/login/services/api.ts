import { AuthLoginData, LoginResponseType, AuthRegisterData } from "@/services/types";
import { instance } from "../../../services/api";

export const loginAPI = {
  async login(
    body: AuthLoginData,
    options: { showSnackbar?: boolean; throwError?: boolean } = {}
  ): Promise<LoginResponseType> {
    return await instance(false, options)
      .post("auth/login/", body)
      .then((res) => res?.data);
  },
  async register(body: AuthRegisterData) {
    return await instance(false)
      .post("auth/signup/", body)
      .then((res) => res?.data);
  },
  async requestNewPassword(body: { email: string }) {
    return await instance(false)
      .post(`auth/reset_password/`, body)
      .then((res) => res?.data);
  },
  async checkAuth(body: { token: string }) {
    return await instance(false, { showSnackbar: false })
      .post("auth/api/token/verify/", body)
      .then((res) => res?.data);
  },
};
