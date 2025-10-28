import { projectAPI } from "./api"
import { ProjectCombinedType, ProjectGroupType, ProjectInfoType, ProjectType } from "./types"

export const getProjectGroups = async ():Promise<ProjectGroupType[] | undefined> => {
  try {
    const res = await projectAPI.getProjectGroups()
    return res?.data
  } catch(e){}
}
export const getProjects = async (params: {resident_id: number, project_type_id: number}):Promise<ProjectType[] | undefined> => {
  try {
    const res = await projectAPI.getProjects(params)
    return res?.data
  } catch(e){}
}
export const getProjectInfo = async (projectId:number):Promise<ProjectInfoType | undefined> => {
  try {
    const res = await projectAPI.getProjectInfo(projectId)
    return res
  } catch(e) {}
}
export const getProjectList = async ():Promise<ProjectCombinedType[] | undefined> => {
  const projectGroups = await getProjectGroups()
  if(!projectGroups) return
  const projects = await Promise.all(projectGroups.map(async (group) => {
    const projects = await getProjects({resident_id: group.resident_id, project_type_id: group.project_type_id})
    if(!projects) return 
    const project = projects[0]
    return {
      ...group,
      ...project
    }
  }))
  return projects.filter((project): project is ProjectCombinedType => !!project)
}