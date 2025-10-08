interface ProjectInfoType {
	contractor_contractor_id: number;
	contractor_employee_fio: string;
	contractor_employee_id: number;
	contractor_name: string;
	finish_date: string;
	home_builder_id: number;
	home_builder_name: string;
	is_sbs: boolean;
	okk_contractor_id: number;
	okk_contractor_name: string;
	okk_fio: string;
	okk_id: number;
	project_head_contractor_id: number;
	project_head_contractor_name: string;
	project_head_fio: string;
	project_head_id: number;
	project_id: number;
	project_name: string;
	project_studio_id: number | null;
	project_studio_name: string | null;
	project_type_name: string;
	prorab_contractor_fio: string;
	prorab_contractor_id: number;
	prorab_head_fio: string;
	prorab_head_id: number;
	section_foreman_fio: string;
	section_foreman_id: number;
	start_date: string;
}

export interface ProjectEmployeesType {
	contractor_id: number
	contractor_name: string
	assign_types: {
		assign_type_name: string
		employee_id: number | null
		fio: string | null
	}[]
}

export interface MaterialType {
	material_name: string
	material_id: number
}

export interface ProjectMaterialType extends MaterialType {
	material_cnt: number
	material_sum: number
	sell_unit_name: string
}

export type ProjectMaterialsType = {
	entrance: number
	materials: ProjectMaterialType[]
}

export type ProjectSums = {
	entrance: number
	paid_sum: number
	processing_sum: number
	remaining_sum: number
	total_sum: number
}

export type ProjectInfoResponseType = {
	data: ProjectInfoType
	employees: ProjectEmployeesType[]
	materials: ProjectMaterialsType[]
	sums: ProjectSums[]
}

export interface ProjectPaymentStatusType {
	status_colour: string
	status_percent: number
	status_sum: number
}

export interface ProjectWorkStatusType {
	status_colour: string
	status_percent: number
	status_cnt: number
}

export interface ProjectFloorFlatType {
	area: number
	flat_id: number
	flat_num: string
	has_okk_defect: boolean
	payment_status: ProjectPaymentStatusType[]
	work_status: ProjectWorkStatusType[]
	remont_id: number
	room_cnt: number
}

export interface ProjectFloorType {
	colour_id: number
	flat: ProjectFloorFlatType[]
	floor: string
	floor_map_id: number
	floor_payment_status: ProjectPaymentStatusType[]
	floor_work_status: ProjectWorkStatusType[]
	hex_code: string
	is_selected: boolean
}

export interface ProjectDocumentType {
	project_agreement_id: number
	doc_name: string
	project_head_name: string
	project_head_fio: string
	project_head_is_sign: boolean
	project_head_can_sign: boolean
	project_head_date: string
	contractor_name: string
	contractor_fio: string
	contractor_is_sign: boolean
	contractor_can_sign: boolean
	contractor_date: string
	guid: string
	error: string
}

export type ProjectFiltersType = {
	resident_id: number | null,
	project_type_id: number | null,
	project_entrance_id: number | null,
}

export interface ResidentType {
	resident_id: number
	resident_name: string
}

export interface ProjectTypeType {
	project_type_id: number
	project_type_name: string
}

export interface ProjectEntranceType {
	entrance: number,
	project_id: number,
	entrance_percent: number,
	block_name: string,
	contractor_name: string,
	project_entrance_id: number
}

export interface TabulationBlock {
	grant_id: number;
	grant_name: string;
	grant_code: string;
}

export interface Tabulation {
	grant_id: number;
	grant_code: string;
	grant_name: string;
	blocks: TabulationBlock[];
}
