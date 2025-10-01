import { instance } from "@/services/api";
import { NotificationsResponse } from ".";

export const notificationsAPI = {
  async getList(
    signal?: AbortSignal
  ): Promise<{ data: NotificationsResponse[] }> {
    return await instance()
      .get("mobile/notify/", { signal })
      .then((res) => res?.data);
  },
};
