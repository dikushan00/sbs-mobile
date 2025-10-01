import { instance } from "@/services/api";
import { ReqResponse } from "@/services/types";
import { OkkDataType } from ".";

export const okkAPI = {
  async getOkkData(
    params = {},
    signal?: AbortSignal
  ): Promise<ReqResponse<OkkDataType[]>> {
    return instance()
      .get(`mobile/read/`, { params, signal })
      .then((res) => res?.data);
  },
  async sendCheck(body: any) {
    return instance()
      .post(`mobile/okk_check/`, body, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      })
      .then((res) => res?.data);
  },
};
