import { instance } from "@/services/api";
import { DetailRemontResponse } from ".";
import { RemontType, WorkType } from "../types";

export const remontsAPI = {
  async getRemonts({
    signal,
  }: {
    signal?: AbortSignal;
  }): Promise<{ data: RemontType[] }> {
    return await instance()
      .get("mobile/remonts/", { signal })
      .then((res) => res?.data);
  },
  async getRemontDetail(
    remontId: number,
    { signal }: { signal?: AbortSignal }
  ): Promise<DetailRemontResponse> {
    return await instance()
      .get(`mobile/remonts/${remontId}/`, { signal })
      .then((res) => res?.data);
  },
  async acceptOrRefuseRemont(
    remontId: number,
    body: { is_accepted: boolean }
  ): Promise<DetailRemontResponse> {
    return await instance()
      .put(`mobile/remonts/${remontId}/accept/`, body)
      .then((res) => res?.data);
  },
  async beforeWorkCheck(
    remontId: number,
    body: FormData,
    params = {}
  ): Promise<DetailRemontResponse | WorkType[] | null> {
    return await instance()
      .post(`mobile/remonts/${remontId}/before_work/`, body, {
        params,
        headers: {
          "Content-Type": "multipart/form-data",
        },
      })
      .then((res) => (params ? res?.data?.data : res?.data));
  },
  async submitWork(
    remontId: number,
    body: FormData,
    params = {}
  ): Promise<DetailRemontResponse | WorkType[] | null> {
    return await instance()
      .post(`mobile/remonts/${remontId}/submit_work/`, body, {
        params,
        headers: {
          "Content-Type": "multipart/form-data",
        },
      })
      .then((res) => (params ? res?.data?.data : res?.data));
  },
  async receiveKeys(
    remontId: number,
    body: { remont_key_id: number }
  ): Promise<DetailRemontResponse> {
    return await instance()
      .post(`mobile/remonts/${remontId}/remont_key/accept/`, body)
      .then((res) => res?.data);
  },
  async passKeys(
    remontId: number,
    body: { team_master_id: number }
  ): Promise<DetailRemontResponse> {
    return await instance()
      .post(`mobile/remonts/${remontId}/remont_key/send_request/`, body)
      .then((res) => res?.data);
  },
};
