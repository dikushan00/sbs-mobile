
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
  project_id: number;
  resident_id: number;
  project_type_id: number;
  project_name: string;
  project_name_info: string;
  project_short_name: string;
  avans: string;
  start_date: string;
  finish_date: string;
  resident_name: string;
  project_type_name: string;
  entrances: number[];
  is_filled: string;
  entrances_info: EntranceInfoType[];
  project_status_code: string;
  project_status_name: string;
  project_timeline_step_code: string;
  is_sbs: boolean;
  doc_info: any | null;
  sbs_project_id: number | null;
  sbs_project_name: string | null;
  is_contractor_nds: boolean;
}

export interface ProjectGroupType {
  resident_id: number;
  resident_name: string;
  project_type_id: number;
  project_type_name: string;
  projects_count: number;
  min_start_date: string;
  max_finish_date: string;
}

export interface ProjectCombinedType extends ProjectType, ProjectGroupType {}