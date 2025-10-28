import { instance } from "@/services/api"
import { ProjectGroupType, ProjectInfoType, ProjectType } from "./types"
import { ReqResponse } from "@/services/types"

export const projectAPI = {
  async getProjectGroups():Promise<ReqResponse<ProjectGroupType[] | undefined>> {
    return instance().get(`project_list/project/groups/read/`).then(res => res.data)
  },
  async getProjects(params: {resident_id: number, project_type_id: number}):Promise<ReqResponse<ProjectType[] | undefined>> {
    return instance().get(`project_list/project/read/`, { params }).then(res => res.data)
  },
  async getProjectInfo(projectId:number):Promise<ProjectInfoType | undefined> {
    return instance().get(`project_list/project/${projectId}/info/`).then(res => res.data)
  },
}