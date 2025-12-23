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

export const tabNames = {
  okk: 'M__ProjectFormMobileOkk',
  agreement: 'M__ProjectFormMobileAgreement',
  payments: 'M__ProjectFormRemontCostTab',
  documents: 'M__ProjectFormDocumentTab',
  materials: 'M__ProjectFormMaterialTab',
  stages: 'M__ProjectFormStagesTab',
  info: 'M__ProjectFormInfoTab',
  floorMap: 'M__ProjectFormMobileFloorMap',
  work: 'M__ProjectFormWorkTab',
}

export const tabsNames = [
  'M__ProjectFormMobileOkk',
  'M__ProjectFormMobileAgreement',
  'M__ProjectFormRemontCostTab',
  'M__ProjectFormDocumentTab',
  'M__ProjectFormMaterialTab',
  'M__ProjectFormStagesTab',
  'M__ProjectFormInfoTab',
  'M__ProjectFormMobileFloorMap',
  'M__ProjectFormWorkTab',
]