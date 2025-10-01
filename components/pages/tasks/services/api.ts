import { WorkStatusesKeyType } from "./../../remonts/services/index";
import { instance } from "@/services/api";
import { WorkType } from "../../remonts/types";

export const tasksAPI = {
  async getWorkSets(
    status: WorkStatusesKeyType,
    signal?: AbortSignal
  ): Promise<{ data: WorkType[] }> {
    return await instance()
      .get(`mobile/work_sets/`, { params: { work_status: status }, signal })
      .then((res) => res?.data);
  },
};
