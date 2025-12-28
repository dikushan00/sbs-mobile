import { CompleteWorkSetBodyType, DocumentTypeType, FloorMapWorkSetsResponseType, FloorSchemaResponseType, FloorSchemaResRefactorType, MaterialRequestType, MaterialType, PlacementType, ProjectDocumentType, ProjectEntranceAllInfoType, ProjectFiltersType, ProjectFloorOkkType, ProjectFloorType, ProjectInfoResponseType, ProjectMainDocumentType, ProjectTypeType, ResidentType, SimpleFloorType, Tabulation, WorkSetFloorParamsResponseType, WorkSetFloorParamType, WorkSetsMaterialsResponseType, ProjectPaymentType, ProjectPaymentsFiltersType, ProjectStagesFiltersType, ProjectStageType, ProjectStagesChecksParamsType, ProjectWorkSetType, FloorCheckPoint, FloorCheckPointInfo } from "../types";
import { residentialSettingsAPI } from "./api";
import { ProjectCheckType } from "../types";

export const residentSettingsBlockNames = {
  M__ProjectFormInfoTab: "residentInfo",
  EntranceSchema: "EntranceSchema",
  M__ProjectFormWorkTab: "ResidentialEntranceWorkSets",
  M__ProjectFormMaterialTab: "MaterialRequests",
  M__ProjectFormRemontCostTab: "ResidentialPayments",
  M__ProjectFormDocumentTab: "EntranceDocuments",
  M__ProjectFormStagesTab: "Stages",
};

export const getDocuments = async (project_id: number): Promise<ProjectDocumentType[] | undefined> => {
  try {
    const res = await residentialSettingsAPI.getDocuments(project_id);
    if (res?.status && res?.data) {
      return res.data;
    }
    return res?.data || [];
  } catch (e) {}
};
export const signDocument = async (body: {project_agreement_id: number}):Promise<{redirect_url: string} | undefined> => {
  try {
    const res = await residentialSettingsAPI.signDocument(body);
    return res?.data
  } catch (e) {
  }
};
export const getResidentList = async (): Promise<ResidentType[] | undefined> => {
  try {
    const res = await residentialSettingsAPI.getResidentials();
    return res?.data || [];
  } catch (e) {}
};
export const getProjectTypes = async (resident_id: number): Promise<ProjectTypeType[] | undefined> => {
  const params = { resident_id };
  try {
    const res = await residentialSettingsAPI.getProjectTypes(params);
    return res?.data || [];
  } catch (e) {}
};
export const getResidentialEntrances = async (params: ProjectFiltersType): Promise<ProjectEntranceAllInfoType[] | undefined> => {
  try {
    const res = await residentialSettingsAPI.getEntrances(params);
    return (
      res?.data?.map((item) => ({
        ...item,
        entrance_name: `Подъезд: ${item.entrance}${
          item.block_name ? ` Б-${item.block_name}` : ""
        }`,
        entrance_full_name: `Подъезд ${item.entrance}${
          item.block_name ? `, Блок-${item.block_name}` : ""
        }${item.contractor_name ? `, ${item.contractor_name}` : ""} (${
          item.entrance_percent || 0
        }%)`,
      })) || []
    );
  } catch (e) {}
};
export const getProjectEntrances = async (project_id: number): Promise<ProjectEntranceAllInfoType[] | undefined> => {
  try {
    const res = await residentialSettingsAPI.getProjectEntrances(project_id);
    console.log('res', res)
    return (
      res?.data?.map((item) => ({
        ...item,
        entrance_name: `Подъезд: ${item.entrance}${
          item.block_name ? ` Б-${item.block_name}` : ""
        }`,
        entrance_full_name: `Подъезд ${item.entrance}${
          item.block_name ? `, Блок-${item.block_name}` : ""
        }${item.contractor_name ? `, ${item.contractor_name}` : ""} (${
          item.entrance_percent || 0
        }%)`,
      })) || []
    );
  } catch (e) {}
};
export const getEntranceApartments = async (params: ProjectFiltersType): Promise<ProjectFloorType[] | undefined> => {
  try {
    const res = await residentialSettingsAPI.getEntranceApartments(params);
    if (!res) return;
    return res?.data || []
  } catch (e) {}
};
export const getEntranceFloors = async (project_entrance_id: number): Promise<ProjectFloorOkkType[] | undefined> => {
  try {
    const res = await residentialSettingsAPI.getEntranceFloors(project_entrance_id);
    if (!res) return;
    return res?.data || []
  } catch (e) {}
};
export const getEntranceWorkSets = async (params: ProjectFiltersType): Promise<ProjectWorkSetType[] | undefined> => {
  try {
    const res = await residentialSettingsAPI.getEntranceWorkSets(params);
    if (!res) return;
    return res?.data?.map((type) => {
      return {
        ...type,
        percent: type.placement_percent,
        label: `${type.placement_type_name} (${type.placement_percent || 0}%)`,
        children: type.work_set_check_groups?.map((group) => {
          return {
            ...group,
            percent: group.work_set_check_group_percent,
            label: `${group.work_set_check_group_name} (${
              group.work_set_check_group_percent || 0
            }%)`,
          };
        }),
      };
    });
  } catch (e) {}
};
export const getFloorTabs = async (): Promise<Tabulation[] | undefined> => {
  let tabs: Tabulation[] = [];
  try {
    const res = await residentialSettingsAPI.getFloorTabs();
    tabs = res?.tabulations || [];
    if(!tabs?.length) return []
    return [{ grant_id: 0, grant_code: 'CallOKK', grant_name: 'Вызок ОКК', blocks: [] }, tabs[0],{ grant_id: 0, grant_code: 'Agreements', grant_name: 'Договор', blocks: [] }, { grant_id: 0, grant_code: 'EntranceSchema', grant_name: 'Схема этажа', blocks: [] }, ...tabs.slice(1)]
  } catch (e) {
    return tabs
  }
};
export const getProjectInfo = async (projectId: number, params = {}): Promise<ProjectInfoResponseType | undefined> => {
  try {
    const res = await residentialSettingsAPI.getProjectInfo(
      projectId,
      params
    );
    return res;
  } catch (e) {}
};
export const sendAgreementTo1C = async (projectId: number):Promise<ProjectDocumentType[] | undefined> => {
  try {
    const res = await residentialSettingsAPI.sendAgreementTo1C(projectId);
    return res?.data;
  } catch (e) {}
};
export const sendAvrTo1C = async (floor_map_document_id: number, params = {}) => {
  try {
    const res = await residentialSettingsAPI.sendAvrTo1C(
      floor_map_document_id,
      params
    );
    return res?.data;
  } catch (e) {}
};
export const getIsProjectSBS = async (projectId: number): Promise<{is_sbs: boolean} | undefined> => {
  try {
    const res = await residentialSettingsAPI.getIsProjectSBS(projectId);
    return res;
  } catch (e) {}
};

const floorSchemaDataRefactor = (res: FloorSchemaResponseType): FloorSchemaResRefactorType => {
  const flatColors: Record<number, string> = {};
  if (res?.data?.length)
    res.data?.forEach((item) => {
      if (!flatColors[item.floor_flat_id]) {
        const flatColorsLength = Object.keys(flatColors).length;
        flatColors[item.floor_flat_id] = borderColors[flatColorsLength];
      }
    });
  const lines = res?.data?.filter((item) => item.coord_type !== "POINT");
  const circles = res?.data?.filter((item) => item.coord_type === "POINT");
  const texts = res?.data?.filter(
    (item) => !!item.frame_name && item.center_point
  );
  return {
    ...res,
    flatColors,
    lines,
    circles,
    texts,
  };
};
export const getFloorSchema = async (floor_map_id: number): Promise<FloorSchemaResRefactorType | undefined> => {
  if(!floor_map_id) return;
  try {
    const res = await residentialSettingsAPI.getFloorSchema(floor_map_id);
    if (!res) return;
    return floorSchemaDataRefactor(res);
  } catch (e) {}
};
export const getFloorMaterials = async (floor_map_id: number): Promise<WorkSetsMaterialsResponseType | undefined> => {
  try {
    const res = await residentialSettingsAPI.getFloorMaterials(floor_map_id);
    return res;
  } catch (e) {}
};
export const getSchemaObjectInfo = async (floor_param_id: number, project_type_id: number) => {
  if (!floor_param_id) return;
  const params = { floor_param_id, project_type_id };
  try {
    const res = await residentialSettingsAPI.getObjectInfo(params);
    return res || null;
  } catch (e) {}
};
export const getFloorParamTypes = async () => {
  try {
    const res = await residentialSettingsAPI.getFloorParamTypes();
    return res?.data;
  } catch (e) {}
};
export const getFloorWorkSets = async (floor_map_id: number): Promise<FloorMapWorkSetsResponseType | undefined> => {
  try {
    const res = await residentialSettingsAPI.getFloorWorkSets(floor_map_id);
    return res;
  } catch (e) {}
};
export const getFloorWorkSetParams = async (floor_map_id: number, work_set_id: number): Promise<WorkSetFloorParamType[] | undefined> => {
  try {
    const res = await residentialSettingsAPI.getFloorWorkSetParams(
      floor_map_id,
      work_set_id
    );
    return res?.data;
  } catch (e) {}
};
export const completeWorkSet = async (floor_map_id: number, body: CompleteWorkSetBodyType) => {
  try {
    const res = await residentialSettingsAPI.completeWorkSet(
      floor_map_id,
      body
    );
    return res;
  } catch (e) {}
};
export const callOKK = async (floor_map_id: number, body: {placement_type_id: number, work_set_check_group_id: number}) => {
  try {
    const res = await residentialSettingsAPI.callOKK(floor_map_id, body);
    return res;
  } catch (e) {}
};

export const getEntranceMaterials = async (params: ProjectFiltersType): Promise<MaterialType[] | undefined> => {
  try {
    const res = await residentialSettingsAPI.getEntranceMaterials(params);
    return res?.data;
  } catch (e) {}
};
export const getEntranceMaterialRequests = async (params: ProjectFiltersType): Promise<MaterialRequestType[] | undefined> => {
  try {
    const res = await residentialSettingsAPI.getEntranceMaterialRequests(
      params
    );
    return res?.data;
  } catch (e) {}
};
export const createEntranceMaterialRequest = async (body: {
  material_id: number | null, qty_sell: number | null, date_shipping: string
}, params: ProjectFiltersType) => {
  try {
    const res = await residentialSettingsAPI.createEntranceMaterialRequest(
      body,
      params
    );
    return res?.data;
  } catch (e) {}
};
export const deleteEntranceMaterialRequest = async (
  filters: ProjectFiltersType,
  provider_request_item_id: number
):Promise<MaterialRequestType[] | undefined> => {
  const params = { ...filters, provider_request_item_id };
  try {
    const res = await residentialSettingsAPI.deleteEntranceMaterialRequest(
      params
    );
    return res?.data;
  } catch (e) {}
};
export const getEntrancePayments = async (params: ProjectPaymentsFiltersType): Promise<ProjectPaymentType[] | undefined> => {
  try {
    const res = await residentialSettingsAPI.getEntrancePayments(params);
    return res?.data;
  } catch (e) {}
};
export const getEntranceStages = async (params: ProjectStagesFiltersType): Promise<ProjectStageType[] | undefined> => {
  try {
    const res = await residentialSettingsAPI.getEntranceStages(params);
    return res?.data;
  } catch (e) {}
};
export const getEntranceDocumentFloors = async (params: ProjectFiltersType): Promise<SimpleFloorType[] | undefined> => {
  try {
    const res = await residentialSettingsAPI.getEntranceDocumentFloors(params);
    return (
      res?.data?.map((item) => ({
        ...item,
        floor_name: `Этаж ${item.floor}`,
      })) || []
    );
  } catch (e) {}
};
export const getEntranceDocumentTypes = async (): Promise<DocumentTypeType[] | undefined> => {
  try {
    const res = await residentialSettingsAPI.getEntranceDocumentTypes();
    return res?.data;
  } catch (e) {}
};
export const getPlacementTypes = async (): Promise<PlacementType[] | undefined>  => {
  try {
    const res = await residentialSettingsAPI.getPlacementTypes();
    return res?.data || [];
  } catch (e) {}
};
export const getEntranceDocuments = async (params: ProjectFiltersType): Promise<ProjectMainDocumentType[] | undefined> => {
  try {
    const res = await residentialSettingsAPI.getEntranceDocuments(params);
    return res?.data?.map((item) => ({
      ...item,
      _showSigns: !item.is_signed,
    }));
  } catch (e) {}
};
export const changeDateEntranceDocument = async (body: {floor_map_document_id: number, date_begin: string, date_end: string}, params: ProjectFiltersType) => {
  try {
    const res = await residentialSettingsAPI.changeDateEntranceDocument(
      body,
      params
    );
    return res?.data;
  } catch (e) {}
};
export const signEntranceDocument = async (body: {floor_map_document_id: number}, params: ProjectFiltersType) => {
  try {
    const res = await residentialSettingsAPI.signEntranceDocument(body, params);
    return res?.data;
  } catch (e) {}
};
export const getFloorMapPoints = async (floor_map_id: number, params: any):Promise<FloorCheckPoint[] | undefined> => {
  try {
    const res = await residentialSettingsAPI.getFloorMapPoints(
      floor_map_id,
      params
    );
    return res?.data;
  } catch (e) {}
};
export const getFloorMapPointInfo = async (
  floor_map_id: number,
  call_check_list_point_id: number
):Promise<FloorCheckPointInfo | undefined> => {
  try {
    const res = await residentialSettingsAPI.getFloorMapPointInfo(
      floor_map_id,
      call_check_list_point_id
    );
    return res?.data;
  } catch (e) {}
};
export const getFloorMapChecks = async (floor_map_id: number, params: ProjectStagesChecksParamsType): Promise<ProjectCheckType[] | undefined> => {
  try {
    const res = await residentialSettingsAPI.getFloorMapChecks(
      floor_map_id,
      params
    );
    return res?.data?.map((item, i) => ({ ...item, index: i + 1 }));
  } catch (e) {}
};

export const borderColors = [
  "#FF5733",
  "#33FF57",
  "#3357FF",
  "#FF33A1",
  "#A133FF",
  "#33FFF5",
  "#F5FF33",
  "#FF8C33",
  "#33FF8C",
  "#8C33FF",
  "#FF3333",
  "#33FF33",
  "#3333FF",
  "#FF33FF",
  "#33FFFF",
  "#FF9933",
  "#33FF99",
  "#9933FF",
  "#FF3399",
  "#3399FF",
];
