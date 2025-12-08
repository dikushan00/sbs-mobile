
export interface ProjectInfoType {
  project_id: number;
  project_name: string;
  start_date: string;
  finish_date: string;
  home_builder_id: number;
  home_builder_name: string;
  project_type_name: string;
  is_sbs: boolean;
  project_head_contractor_id: number | null;
  project_head_contractor_name: string | null;
  project_head_id: number | null;
  project_head_fio: string;
  section_foreman_id: number | null;
  section_foreman_fio: string;
  prorab_head_id: number | null;
  prorab_head_fio: string;
  okk_contractor_id: number | null;
  okk_contractor_name: string | null;
  okk_id: number | null;
  okk_fio: string;
  contractor_contractor_id: number | null;
  contractor_name: string | null;
  contractor_employee_id: number | null;
  contractor_employee_fio: string;
  prorab_contractor_id: number | null;
  prorab_contractor_fio: string;
  project_studio_id: number | null;
  project_studio_name: string | null;
  error: string | null;
  status: boolean;
}

export interface EntranceInfoType {
  color: string;
  entrance: string;
  block_name: string | null;
  description: string;
  entrance_num: number;
  project_entrance_id: number;
}
export interface ProjectType {
  blocks: string;
  can_sign: boolean;
  finish_date: string;
  is_signed: boolean;
  project_id: number;
  project_type_name: string;
  project_type_id: number;
  resident_name: string;
  resident_id: number;
  start_date: string;
}

export interface GrantTabType {
  grant_id: number;
  grant_code: string;
  grant_name: string;
  okk_def?: number;
  okk_call?: number;
  is_signed_cnt?: number;
  not_signed_cnt?: number;
}

export interface ProjectInfoDataType {
  project: ProjectType;
  grant_tabs: GrantTabType[];
}