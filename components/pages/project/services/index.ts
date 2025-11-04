import { projectAPI } from "./api"
import { ProjectInfoDataType, ProjectType } from "./types"

export const getProjects = async ():Promise<ProjectType[] | undefined> => {
  try {
    const res = await projectAPI.getProjects()
    return res?.data
  } catch(e){}
}
export const getProjectData = async (projectId:number):Promise<ProjectInfoDataType | undefined> => {
  try {
    const res = await projectAPI.getProjectInfo(projectId)
    return res?.data
  } catch(e) {}
}