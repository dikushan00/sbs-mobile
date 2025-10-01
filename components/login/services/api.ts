import {
  AuthLoginData,
  AuthRegisterData,
  LoginResponseType,
} from "@/services/types";
import { instance } from "../../../services/api";
import { MASTER_API } from "@/constants";

export const loginAPI = {
  async login(
    body: AuthLoginData,
    isProjectOkk: boolean,
    options: { showSnackbar?: boolean; throwError?: boolean } = {}
  ): Promise<LoginResponseType> {
    return await instance(false, options, isProjectOkk ? MASTER_API : null)
      .post("auth/login/", body)
      .then((res) => res?.data);
  },
  async register(body: AuthRegisterData) {
    return await instance(false)
      .post("auth/signup/", body)
      .then((res) => res?.data);
  },
  async requestNewPassword(body: { email: string }, isProjectOkk: boolean) {
    return await instance(false, {}, isProjectOkk ? MASTER_API : null)
      .post(`auth/${isProjectOkk ? 'reset_password' : 'password_reset'}/`, body)
      .then((res) => res?.data);
  },
  async checkAuth(body: { token: string }) {
    return await instance(false, { showSnackbar: false })
      .post("auth/api/token/verify/", body)
      .then((res) => res?.data);
  },
};
