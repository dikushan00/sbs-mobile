import { instance } from "@/services/api";
import { ProjectDocumentType, ProjectEntranceType, ProjectFiltersType, ProjectFloorType, ProjectInfoResponseType, ProjectTypeType, ResidentType, Tabulation, WorkSetFloorParamsResponseType, CompleteWorkSetBodyType, MaterialRequestType, MaterialType, ProjectMainDocumentType, SimpleFloorType, PlacementType, DocumentTypeType, ProjectPaymentType, ProjectPaymentsFiltersType, ProjectCheckType, ProjectStagesChecksParamsType } from "../types";
import { ReqResponse } from "@/services/types";
import { ProjectStageType, ProjectWorkSetType } from "../types";
import { ProjectStagesFiltersType } from "../types";
import { arrayBufferToBase64 } from "@/services";
export const residentialSettingsAPI = {
  async getDocuments(project_id: number): Promise<ReqResponse<ProjectDocumentType[] | undefined>> {
    return await instance()
      .get(`/project/agreement/project_id/${project_id}/`)
      .then((res) => res?.data);
  },
  async signDocument(body = {}) {
    return await instance()
      .post(`/project/agreement/sign/`, body)
      .then((res) => res?.data);
  },
  async downloadDocumentPDF(body = {}) {
    return await instance()
      .post(`/project/agreement/sign/download/`, body, {responseType: 'arraybuffer'})
      .then((res) => res);
  },
  async getResidentials(): Promise<ReqResponse<ResidentType[]>> {
    return await instance()
      .get("/project/resident/read/")
      .then((res) => res?.data);
  },
  async getProjectTypes(params: { resident_id: number }): Promise<ReqResponse<ProjectTypeType[]>> {
    return await instance()
      .get("/project/project_types/read/", { params })
      .then((res) => res?.data);
  },
  async getEntrances(params: ProjectFiltersType): Promise<ReqResponse<ProjectEntranceType[] | undefined>> {
    return await instance()
      .get(`/project/entrances/read/`, { params })
      .then((res) => res?.data);
  },
  async getEntranceApartments(params: ProjectFiltersType): Promise<ReqResponse<ProjectFloorType[] | undefined>> {
    return await instance()
      .get(`/project/flats/read/`, { params })
      .then((res) => res?.data);
  },
  async getEntranceWorkSets(params: ProjectFiltersType): Promise<ReqResponse<ProjectWorkSetType[] | undefined>> {
    return await instance()
      .get(`/project/work_sets/read/`, { params })
      .then((res) => res?.data);
  },
  async getFloorTabs(params = {}): Promise<{tabulations: Tabulation[]} | undefined> {
    return await instance()
      .get("/project/common/tabulation/read/", { params })
      .then((res) => res?.data);
  },
  async sendAvrTo1C(remont_costs_id: number, params = {}) {
    return await instance()
      .post(
        `/project/remont_costs/${remont_costs_id}/avr/send/`,
        {},
        { params }
      )
      .then((res) => res?.data);
  },
  async getProjectInfo(project_id: number, params = {}): Promise<ProjectInfoResponseType | undefined> {
    return await instance()
      .get(`/project/${project_id}/info/`, { params })
      .then((res) => res?.data);
  },
  async sendAgreementTo1C(project_id: number) {
    return await instance()
      .post(`/project/${project_id}/agreement/send/`)
      .then((res) => res?.data);
  },
  async getIsProjectSBS(project_id: number) {
    return await instance()
      .get(`/project/${project_id}/is_sbs/`)
      .then((res) => res?.data);
  },
  async getFloorSchema(floor_map_id: number, params = {}) {
    return await instance()
      .get(`/project/floor_map/${floor_map_id}/info/`, { params })
      .then((res) => res?.data);
  },
  async getFloorMaterials(floor_map_id: number, params = {}) {
    return await instance()
      .get(`/project/floor_map/${floor_map_id}/materials/read/`, { params })
      .then((res) => res?.data);
  },
  async getObjectInfo(params = {}) {
    return await instance()
      .get("/floor_map/floor_params/details/read/", { params })
      .then((res) => res?.data);
  },
  async getFloorParamTypes() {
    return await instance()
      .get("/floor_map/floor_params/param_types/all/read/")
      .then((res) => res?.data);
  },
  async updateFloorParam(body = {}, params = {}) {
    return await instance()
      .put("/floor_map/floor_params/update/", body, { params })
      .then((res) => res?.data);
  },
  async getFloorWorkSets(floor_map_id: number, params = {}) {
    return await instance()
      .get(`/project/floor_map/${floor_map_id}/work_set/read/`, { params })
      .then((res) => res?.data);
  },
  async getFloorWorkSetParams(floor_map_id: number, work_set_id: number, params = {}): Promise<WorkSetFloorParamsResponseType | undefined> {
    return await instance()
      .get(
        `/project/floor_map/${floor_map_id}/work_set/${work_set_id}/floor_param/read/`,
        {
          params,
        }
      )
      .then((res) => res?.data);
  },
  async completeWorkSet(floor_map_id: number, body: CompleteWorkSetBodyType) {
    return await instance()
      .post(`/project/floor_map/${floor_map_id}/work_set/complete/`, body)
      .then((res) => res?.data);
  },
  async callOKK(floor_map_id: number, body: {placement_type_id: number, work_set_check_group_id: number}) {
    return await instance()
      .post(`/project/floor_map/${floor_map_id}/work_set/call/`, body)
      .then((res) => res?.data);
  },
  async getEntranceMaterials(params: ProjectFiltersType): Promise<ReqResponse<MaterialType[] | undefined>> {
    return await instance()
      .get(`/project/materials/read/`, { params })
      .then((res) => res?.data);
  },
  async getEntranceMaterialRequests(params: ProjectFiltersType): Promise<ReqResponse<MaterialRequestType[] | undefined>> {
    return await instance()
      .get(`/project/provider_requests/read/`, { params })
      .then((res) => res?.data);
  },
  async createEntranceMaterialRequest(body: {
    material_id: number | null, qty_sell: number | null, date_shipping: string
  }, params: ProjectFiltersType) {
    return await instance()
      .post(`/project/provider_requests/create/`, body, { params })
      .then((res) => res?.data);
  },
  async deleteEntranceMaterialRequest(params = {}) {
    return await instance()
      .delete(`/project/provider_requests/delete/`, { params })
      .then((res) => res?.data);
  },
  async getEntrancePayments(params: ProjectPaymentsFiltersType): Promise<ReqResponse<ProjectPaymentType[] | undefined>> {
    return await instance()
      .get(`/project/remont_costs/read/`, { params })
      .then((res) => res?.data);
  },
  async getEntranceStages(params: ProjectStagesFiltersType): Promise<ReqResponse<ProjectStageType[] | undefined>> {
    return await instance()
      .get(`/project/stages/read/`, { params })
      .then((res) => res?.data);
  },
  async getEntranceDocumentFloors(params: ProjectFiltersType): Promise<ReqResponse<SimpleFloorType[] | undefined>> {
    return await instance()
      .get(`/project/documents/floors/read/`, { params })
      .then((res) => res?.data);
  },
  async getEntranceDocumentTypes(): Promise<ReqResponse<DocumentTypeType[] | undefined>> {
    return await instance()
      .get(`/project/common/document_types/read/`)
      .then((res) => res?.data);
  },
  async getPlacementTypes(): Promise<ReqResponse<PlacementType[] | undefined>> {
    return await instance()
      .get(`/project/common/placement_types/read/`)
      .then((res) => res?.data);
  },
  async getEntranceDocuments(params: ProjectFiltersType): Promise<ReqResponse<ProjectMainDocumentType[] | undefined>> {
    return await instance()
      .get(`/project/documents/read/`, { params })
      .then((res) => res?.data);
  },
  async changeDateEntranceDocument(body, params) {
    return await instance()
      .put(`/project/documents/change_date/`, body, { params })
      .then((res) => res?.data);
  },
  async signEntranceDocument(body, params) {
    return await instance()
      .post(`/project/documents/sign/`, body, { params })
      .then((res) => res?.data);
  },
  async getFloorMapPoints(floor_map_id: number, params = {}) {
    return await instance()
      .get(`/project/floor_map/${floor_map_id}/check_points/read/`, { params })
      .then((res) => res?.data);
  },
  async getFloorMapPointInfo(floor_map_id: number, call_check_list_point_id: number) {
    return await instance()
      .get(
        `/project/floor_map/${floor_map_id}/check_points/${call_check_list_point_id}/info/`
      )
      .then((res) => res?.data);
  },
  async getFloorMapChecks(floor_map_id: number, params:ProjectStagesChecksParamsType): Promise<ReqResponse<ProjectCheckType[] | undefined>> {
    return await instance()
      .get(`/project/floor_map/${floor_map_id}/checks/read/`, { params })
      .then((res) => res?.data);
  },
  async getFloorOpenspace(floor_map_id: number) {
    return await instance()
      .get(`/project/floor_map/${floor_map_id}/openspace/read/`)
      .then((res) => res?.data);
  },
};
