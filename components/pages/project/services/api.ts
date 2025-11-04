import { instance } from "@/services/api"
import { ReqResponse } from "@/services/types"
import { ProjectInfoDataType, ProjectType } from "./types"

export const projectAPI = {
  async getProjects():Promise<ReqResponse<ProjectType[] | undefined>> {
    return instance().get(`mobile/projects/`).then(res => res.data)
  },
  async getProjectInfo(projectId:number):Promise<ReqResponse<ProjectInfoDataType>> {
    return instance().get(`mobile/tabulation/project_id/${projectId}/`).then(res => res.data)
  },
}