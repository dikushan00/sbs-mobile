import { instance } from "@/services/api";
import { NotificationsResponse } from ".";
import { MobileNotifyGroupCodeType } from "@/services/types";

export const notificationsAPI = {
  async getList(
    signal?: AbortSignal
  ): Promise<{ data: NotificationsResponse[] }> {
    return await instance(true, { showSnackbar: false, throwError: false })
      .get("mobile/notify/", { signal })
      .then((res) => res?.data);
  },
  async updateRead(
    group_code: MobileNotifyGroupCodeType
  ): Promise<{ data: NotificationsResponse[] }> {
    return await instance(true, { showSnackbar: false, throwError: false })
      .post(`mobile/notify/update_read/`, { group_code })
      .then((res) => res?.data);
  },
};
