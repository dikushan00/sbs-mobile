import { instance } from "@/services/api";

export const okkAPI = {
  async getOkkRemonts(signal?: AbortSignal) {
    return instance()
      .get(`mobile/okk/remonts/`, { signal })
      .then((res) => res?.data);
  },
  async getOkkRemont(remontId: number, signal?: AbortSignal) {
    return instance()
      .get(`mobile/okk/remonts/${remontId}/`, { signal })
      .then((res) => res?.data);
  },
  async okkCheck(remontId: number, body: FormData) {
    return instance()
      .post(`mobile/okk/remonts/${remontId}/okk_check/`, body, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      })
      .then((res) => res?.data);
  },
};
