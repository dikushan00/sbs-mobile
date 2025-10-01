import { MASTER_API } from "@/constants";
import { instance } from "@/services/api";
import { ProjectOkkDataType } from ".";
import { ReqResponse } from "@/services/types";

export const okkAPI = {
  async getOkkData(
    params = {},
    signal?: AbortSignal
  ): Promise<ReqResponse<ProjectOkkDataType[]>> {
    return instance(true, {}, MASTER_API)
      .get(`mobile/read/`, { params, signal })
      .then((res) => res?.data);
  },
  async sendCheck(body: any) {
    return instance(true, {}, MASTER_API)
      .post(`mobile/okk_check/`, body, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      })
      .then((res) => res?.data);
  },
};
