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
	material_id: number
	material_name: string
	material_sum: number
	material_price: number
	material_amount: number
	sell_unit_name: string
	unit_name: string
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

export type SimpleFloorType = {
	floor: number;
  floor_name: string;
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

export interface SelectedDataType {
	block_name: string;
	contractor_name: string;
	entrance: number;
	entrance_full_name: string;
	entrance_name: string;
	entrance_percent: number;
	project_entrance_id: number;
	project_id: number;
	project_type_id: number;
	project_type_name: string;
	resident_id: number;
	resident_name: string;
}

export interface FloorMapType {
	floor_map_id: number;
	to_delete__resident_id: number;
	to_delete__entrance_num: number;
	level_num: number;
	image_url: string;
	comments: string | null;
	rowversion: string;
	wall_height: number;
	length_for_scale: number | null;
	length_geom: number | null;
	scale: number;
	window_height: number;
	door_height: number;
	min_x: number;
	min_y: number;
	max_y: number;
	autocad_scale: number;
	code: string;
	slope_width: number;
	floor_map_orig_id: number;
	to_delete__project_id: number;
	autocad_url: string | null;
	project_entrance_id: number;
	script_info: string | null;
	smeta_recalc_date: string;
	smeta_status_code: string;
	smeta_error: string | null;
	can_choose_material: boolean;
}

export interface FlatType {
	flat_id: number;
	area: number;
	room_cnt: number;
	entrance: string;
	floor: string;
	flat_num: string;
	floor_flat_id: number;
	kvlist: string;
}

export interface FloorParamType {
	floor_param_id: number;
	floor_buffer_id: number | null;
	floor_param_type_id: number;
	floor_param_type_name: string;
	floor_param_type_code: string;
	floor_param_type_color: string;
	floor_flat_id: number;
	room_id: number;
	floor_param_type_id_relative: number | null;
	floor_param_type_name_relative: string | null;
	coord_type: string;
	points: number[][];
	center_point: number[];
	frame_name: string | null;
	okk_status_colour: string;
}

export interface FloorSchemaResponseType {
	data: FloorParamType[]
	flat: FlatType[]
	floor_map: FloorMapType
	status: boolean
}

export interface FloorSchemaResRefactorType extends FloorSchemaResponseType {
	flatColors: Record<number, string>
	lines: FloorParamType[]
	circles: FloorParamType[]
	texts: FloorParamType[]
}

export interface WorkSetType {
	work_set_id: number;
	work_set_name: string;
	to_disable: boolean;
	is_ready_for_work_set: string;
	done: number;
	num: number;
	unit_name: string;
	work_set_amount: number;
	total_sum: number;
}

export interface WorkSetMaterialType {
	work_set_id: number;
	work_set_name: string;
	material_id: number;
	material_name: string;
	unit_name: string;
	material_amount: number;
	material_sum: number;
}

export interface WorkSetCheckGroupType {
	work_set_check_group_id: number;
	work_set_check_group_name: string;
	checked_status: string | null;
	checked_status_code: string | null;
	checked_status_colour: string | null;
	to_disable: boolean;
	is_defect_exist: boolean;
	work_sets: WorkSetType[];
	total_sum: number;
	is_ready_for_work_set_check_group: string;
}

export interface WorkSetCheckGroupWithMaterialsType {
	work_set_check_group_id: number;
	work_set_check_group_name: string;
	work_sets: WorkSetMaterialType[];
}

export interface FloorMapWorkSetType {
	placement_type_id: number;
	placement_type_name: string;
	placement_percent: number;
	placement_okk_status_colours: string[] | null;
	total_sum: number;
	is_defect_exist: boolean;
	work_set_check_groups: WorkSetCheckGroupType[];
}

export interface FloorMapWorkSetWithMaterialsType {
	placement_type_id: number;
	placement_type_name: string;
	work_set_check_groups: WorkSetCheckGroupWithMaterialsType[];
}

export interface FloorMapWorkSetsResponseType {
	data: FloorMapWorkSetType[]
	is_defect_exist: boolean
}

export interface WorkSetFloorParamType {
	floor_param_id: number;
	floor_flat_id: number;
	planirovka_room_id: number | null;
	floor_param_type_id: number;
	param_geom: string;
	rowversion: string;
	param_height: number | null;
	room_id: number;
	floor_param_type_id2: number | null;
	floor_buffer_id: number | null;
	frame_id: number | null;
	floor_param_type_id3: number | null;
	script_comment: string | null;
	floor_param_orig_id: number | null;
}

export interface WorkSetFloorParamsResponseType {
	data: WorkSetFloorParamType[]
}

export interface WorkSetsMaterialsResponseType {
	materials_ws: FloorMapWorkSetWithMaterialsType[]
	materials: MaterialType[]
}

export type CompleteWorkSetBodyType = {
	is_ready: boolean;
	work_set_id: number | null;
	placement_type_id: number;
	work_set_check_group_id: number | null;
}

export type ProviderRequestStatusCodeType = 'BRING_TO_CONTRACTOR' | 'SHIP' | 'AVAIL' | 'CREATE';

export interface MaterialRequestType {
	material_name: string;
	qty_atom: number;
	date_shipping: string;
	provider_request_status_name: string;
	atom_unit_name: string;
	price: number;
	material_sum: number;
	material_cnt: number;
	sell_unit_name: string;
	provider_request_id: number;
	provider_request_item_id: number;
	provider_request_status_code: ProviderRequestStatusCodeType;
	date_create: string;
	expeditor_file_url: string | null;
}

export interface ProjectMainDocumentType {
    floor_map_document_id: number;
    date_begin: string;
    date_end: string;
    date_create: string;
    rowversion: string;
    floor_map_document_type_name: string;
    master_url: string;
    work_set_check_group_name: string;
    placement_type_name: string;
    is_signed: boolean;
    floor: string;
    block_name: string;
    file_ext: string;
    assign_signs: ProjectMainAssignSignType[];
    is_avr_sent_bi: boolean;
    avr_code: string | null;
    avr_sum: number | null;
    guid: string | null;
    esf_status: string | null;
    can_sent_1c: boolean;
}

export interface ProjectMainAssignSignType {
    phone: string;
    can_sign: boolean;
    is_signed: boolean;
    sign_date: string | null;
    employee_fio: string;
    assign_type_id: number;
    assign_type_name: string;
}