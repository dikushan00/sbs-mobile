import { CompleteWorkSetBodyType, FloorMapWorkSetsResponseType, FloorSchemaResponseType, FloorSchemaResRefactorType, ProjectDocumentType, ProjectFiltersType, ProjectFloorType, ProjectInfoResponseType, ProjectTypeType, ResidentType, Tabulation, WorkSetFloorParamsResponseType, WorkSetFloorParamType, WorkSetsMaterialsResponseType } from "../types";
import { residentialSettingsAPI } from "./api";

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
export const signDocument = async (body) => {
  try {
    const res = await residentialSettingsAPI.signDocument(body);
    return res?.data || [];
  } catch (e) {}
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
export const getResidentialEntrances = async (params: ProjectFiltersType) => {
  try {
    const res = await residentialSettingsAPI.getEntrances(params);
    return (
      res?.data?.map((item) => ({
        ...item,
        entrance_name: `Подъезд ${item.entrance}${
          item.block_name ? `, Блок №${item.block_name}` : ""
        }`,
        entrance_full_name: `Подъезд ${item.entrance}${
          item.block_name ? `, Блок №${item.block_name}` : ""
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
export const getEntranceWorkSets = async (params) => {
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
  try {
    const res = await residentialSettingsAPI.getFloorTabs();
    const tabs =  res?.tabulations;
    if(!tabs?.length) return []
    return [tabs[0], { grant_id: 0, grant_code: 'EntranceSchema', grant_name: 'Схема этажа', blocks: [] }, ...tabs.slice(1)] || []
  } catch (e) {}
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
export const sendAgreementTo1C = async (projectId: number) => {
  try {
    const res = await residentialSettingsAPI.sendAgreementTo1C(projectId);
    return res?.data;
  } catch (e) {}
};
export const sendAvrTo1C = async (remont_costs_id: number, params = {}) => {
  try {
    const res = await residentialSettingsAPI.sendAvrTo1C(
      remont_costs_id,
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
export const updateFloorParam = async (body, params) => {
  try {
    const res = await residentialSettingsAPI.updateFloorParam(body, params);
    return floorSchemaDataRefactor(res);
  } catch (e) {}
};
export const updateFloorMapLine = async (body) => {
  try {
    const res = await residentialSettingsAPI.updateFloorMapLine(body);
    return res;
  } catch (e) {}
};

export const getEntranceMaterials = async (params) => {
  try {
    const res = await residentialSettingsAPI.getEntranceMaterials(params);
    return res?.data;
  } catch (e) {}
};
export const getEntranceMaterialRequests = async (params) => {
  try {
    const res = await residentialSettingsAPI.getEntranceMaterialRequests(
      params
    );
    return res?.data;
  } catch (e) {}
};
export const deleteEntranceMaterialRequest = async (
  filters,
  provider_request_item_id: number
) => {
  const params = { ...filters, provider_request_item_id };
  try {
    const res = await residentialSettingsAPI.deleteEntranceMaterialRequest(
      params
    );
    return res?.data;
  } catch (e) {}
};
export const getEntrancePayments = async (params) => {
  try {
    const res = await residentialSettingsAPI.getEntrancePayments(params);
    return res?.data;
  } catch (e) {}
};
export const getEntranceStages = async (params = {}) => {
  try {
    const res = await residentialSettingsAPI.getEntranceStages(params);
    return res?.data;
  } catch (e) {}
};
export const getEntranceDocumentFloors = async (params) => {
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
export const getEntranceDocumentTypes = async () => {
  try {
    const res = await residentialSettingsAPI.getEntranceDocumentTypes();
    return res?.data;
  } catch (e) {}
};
export const getPlacementTypes = async () => {
  try {
    const res = await residentialSettingsAPI.getPlacementTypes();
    return res?.data;
  } catch (e) {}
};
export const createEntranceMaterialRequest = async (body, params) => {
  try {
    const res = await residentialSettingsAPI.createEntranceMaterialRequest(
      body,
      params
    );
    return res?.data;
  } catch (e) {}
};
export const getEntranceDocuments = async (params) => {
  try {
    const res = await residentialSettingsAPI.getEntranceDocuments(params);
    return res?.data?.map((item) => ({
      ...item,
      _showSigns: !item.is_signed,
    }));
  } catch (e) {}
};
export const changeDateEntranceDocument = async (body, params) => {
  try {
    const res = await residentialSettingsAPI.changeDateEntranceDocument(
      body,
      params
    );
    return res?.data;
  } catch (e) {}
};
export const signEntranceDocument = async (body, params) => {
  try {
    const res = await residentialSettingsAPI.signEntranceDocument(body, params);
    return res?.data;
  } catch (e) {}
};
export const getFloorMapPoints = async (floor_map_id, params) => {
  try {
    const res = await residentialSettingsAPI.getFloorMapPoints(
      floor_map_id,
      params
    );
    return res?.data;
  } catch (e) {}
};
export const getFloorMapPointInfo = async (
  floor_map_id,
  call_check_list_point_id
) => {
  try {
    const res = await residentialSettingsAPI.getFloorMapPointInfo(
      floor_map_id,
      call_check_list_point_id
    );
    return res?.data;
  } catch (e) {}
};
export const getFloorMapChecks = async (floor_map_id, params) => {
  try {
    const res = await residentialSettingsAPI.getFloorMapChecks(
      floor_map_id,
      params
    );
    return res?.data?.map((item, i) => ({ ...item, index: i + 1 }));
  } catch (e) {}
};
export const getFloorOpenspace = async (floor_map_id) => {
  try {
    const res = await residentialSettingsAPI.getFloorOpenspace(floor_map_id);
    return (
      res?.data?.map((item, i) => ({
        ...item,
        openspace_name: `Openspace ${i + 1}`,
      })) || []
    );
  } catch (e) {}
};

export const flattenPoints = (pointsArray) => {
  return pointsArray.reduce((acc, [x, y]) => {
    acc.push(x, y);
    return acc;
  }, []);
};

export const checkFlatFloor = (floor, apartment, addData, isSubmit = false) => {
  if (Number(addData?.flat_num) === Number(apartment.flat_num))
    return !isSubmit;
  if (floor.is_selected) {
    const floorsOffset = Number(addData?.floor) - Number(floor.floor);
    const direction = floorsOffset > 0 ? 1 : -1;
    const offset = Math.abs(floorsOffset);
    const flatNum =
      direction === 1
        ? Number(addData?.flat_num) - offset * addData?.floorFlatLength
        : Number(addData?.flat_num) + offset * addData?.floorFlatLength;
    if (flatNum === Number(apartment.flat_num)) return true;
  }
  return false;
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

export const onKonvaWheel = (e, stage) => {
  if (!stage) return;
  e.evt.preventDefault();
  // "коэффициент" скорости масштабирования
  const scaleBy = 1.15;

  // Текущий масштаб
  const oldScale = stage.scaleX();

  // Позиция курсора внутри Stage
  const pointer = stage.getPointerPosition();

  // Находим, «куда» будет масштабироваться сцена
  const mousePointTo = {
    x: (pointer.x - stage.x()) / oldScale,
    y: (pointer.y - stage.y()) / oldScale,
  };

  // Определяем направление (deltaY > 0 – отдаление, < 0 – приближение)
  const direction = e.evt.deltaY > 0 ? -1 : 1;

  // Считаем новый масштаб
  const newScale = direction > 0 ? oldScale * scaleBy : oldScale / scaleBy;

  // Устанавливаем масштаб
  stage.scale({ x: newScale, y: newScale });

  // Рассчитываем сдвиг так, чтобы точка под курсором «осталась на месте»
  const newPos = {
    x: pointer.x - mousePointTo.x * newScale,
    y: pointer.y - mousePointTo.y * newScale,
  };
  stage.position(newPos);
  stage.batchDraw();
};

export const frameColumns = [
  {
    name: "frame_param_type_name",
    label: "Параметр",
    field: "frame_param_type_name",
    align: "left",
  },
  {
    name: "param_value",
    label: "Значение",
    field: "param_value",
    align: "right",
  },
];

export const workStatuses = {
  empty: "empty",
  full: "full",
  half: "half",
};

export const materialRequestColumns = [
  {
    name: "material_name",
    label: "Материал",
    field: "material_name",
    align: "left",
  },
  {
    name: "qty_atom",
    label: "Мин. кол-во",
    field: "qty_atom",
    align: "right",
  },
  {
    name: "material_cnt",
    label: "Кол-во в ед.продаж",
    field: "material_cnt",
    align: "right",
  },
  {
    name: "price",
    label: "Цена",
    field: "price",
    align: "right",
  },
  {
    name: "material_sum",
    label: "Сумма",
    field: "material_sum",
    align: "right",
  },
  {
    name: "date_shipping",
    label: "Дата отгрузки",
    field: "date_shipping",
    align: "center",
  },
  {
    name: "date_create",
    label: "Дата заказа",
    field: "date_create",
    align: "center",
  },
  {
    name: "provider_request_status_name",
    label: "Статус",
    field: "provider_request_status_name",
    align: "left",
  },
  {
    name: "download",
    label: "Скачать",
    align: "center",
  },
];
export const materialRequestsColumnsSmall = [
  {
    name: "material_name",
    label: "Материал",
    field: "material_name",
    align: "left",
  },
  {
    name: "material_cnt",
    label: "Кол-во",
    field: "material_cnt",
    align: "right",
  },
  {
    name: "material_sum",
    label: "Сумма, ₸",
    field: "material_sum",
    align: "right",
  },
];
export const materialRequestsSumColumns = [
  {
    name: "total_sum",
    label: "Общая сумма, ₸",
    align: "right",
  },
  {
    name: "paid_sum",
    label: "Оплаченная сумма, ₸",
    align: "right",
  },
  {
    name: "processing_sum",
    label: "Ожидается оплата, ₸",
    align: "right",
  },
  {
    name: "remaining_sum",
    label: "Остаток, ₸",
    align: "right",
  },
];

export const workSetColumns = [
  {
    name: "work_set_name",
    label: "Конструктив",
    field: "work_set_name",
    align: "left",
  },
  {
    name: "material_name",
    label: "Материал",
    field: "material_name",
    align: "left",
  },
  {
    name: "material_amount",
    label: "Кол-во",
    field: "material_amount",
    align: "right",
  },
  {
    name: "material_sum",
    label: "Сумма, ₸",
    field: "material_sum",
    align: "right",
  },
];
export const entrancePaymentColumns = [
  {
    name: "remont_costs_id",
    label: "ID",
    field: "remont_costs_id",
    align: "center",
  },
  {
    name: "contragent",
    label: "Контрагент",
    field: "contragent",
    align: "left",
  },
  {
    name: "work_set_check_group_name",
    label: "Группа работ",
    field: "work_set_check_group_name",
    align: "left",
  },
  {
    name: "placement_type_name",
    label: "Тип",
    field: "placement_type_name",
    align: "left",
  },
  {
    name: "block_name",
    label: "Блок",
    field: "block_name",
    align: "left",
  },
  {
    name: "floor",
    label: "Этаж",
    field: "floor",
    align: "center",
  },
  {
    name: "col_sum",
    label: "Сумма работ, ₸",
    field: "col_sum",
    align: "right",
  },
  {
    name: "payment_amount",
    label: "Сумма платежа, ₸",
    field: "payment_amount",
    align: "right",
  },
  {
    name: "date_create",
    label: "Дата создания",
    field: "date_create",
    align: "center",
  },
  {
    name: "date_payment",
    label: "Дата платежа",
    field: "date_payment",
    align: "center",
  },
  {
    name: "status_name",
    label: "Статус",
    field: "status_name",
    align: "center",
  },
];
export const entrancePaymentColumns1C = [
  ...entrancePaymentColumns,
  { name: "is_sent", label: "1C", align: "center" },
];
export const entranceStagesColumns = [
  {
    name: "floor_map_id",
    label: "",
    align: "center",
  },
  {
    name: "block_name",
    label: "Блок",
    field: "block_name",
    align: "center",
    sortable: true,
  },
  {
    name: "floor",
    label: "Этаж",
    field: "floor",
    align: "center",
    sortable: true,
  },
  {
    name: "placement_type_name",
    label: "Тип",
    field: "placement_type_name",
    align: "left",
    sortable: true,
  },
  {
    name: "work_set_check_group_name",
    label: "Группа работ",
    field: "work_set_check_group_name",
    align: "left",
    sortable: true,
  },
  {
    name: "check_status",
    label: "Статус",
    field: "check_status",
    align: "center",
    sortable: true,
  },
  {
    name: "call_employee_fio",
    label: "Вызвал(а)",
    field: "call_employee_fio",
    align: "left",
    sortable: true,
  },
  {
    name: "call_date",
    label: "Дата вызова",
    field: "call_date",
    align: "center",
  },
  {
    name: "check_employee_fio",
    label: "Принял(а)",
    field: "check_employee_fio",
    align: "left",
    sortable: true,
  },
  {
    name: "check_date",
    label: "Дата принятия",
    field: "check_date",
    align: "center",
  },
];
export const entranceDocumentColumns = [
  {
    name: "floor_map_document_id",
    label: "ID",
    field: "floor_map_document_id",
    align: "center",
  },
  {
    name: "floor_map_document_type_name",
    label: "Тип документа",
    field: "floor_map_document_type_name",
    align: "left",
  },
  {
    name: "work_set_check_group_name",
    label: "Группа работ",
    field: "work_set_check_group_name",
    align: "left",
  },
  {
    name: "placement_type_name",
    label: "Тип",
    field: "placement_type_name",
    align: "left",
  },
  {
    name: "block_name",
    label: "Блок",
    field: "block_name",
    align: "center",
  },
  {
    name: "floor",
    label: "Этаж",
    field: "floor",
    align: "center",
  },
  {
    name: "date_create",
    label: "Дата создания",
    field: "date_create",
    align: "center",
  },
  {
    name: "date_begin",
    label: "Дата начала",
    field: "date_begin",
    align: "center",
  },
  {
    name: "date_end",
    label: "Дата окончания",
    field: "date_end",
    align: "center",
  },
  {
    name: "is_signed",
    label: "Статус",
    field: "is_signed",
    align: "center",
  },
  {
    name: "sign",
    label: "Подписать",
    align: "center",
  },
  {
    name: "download",
    label: "Документ",
    align: "center",
  },
];

export const residentFinanceInfoColumns = [
  {
    name: "entrance",
    label: "Подъезд",
    field: "entrance",
    align: "center",
  },
  {
    name: "total_sum",
    label: "Общая сумма",
    field: "total_sum",
    align: "right",
  },
  {
    name: "paid_sum",
    label: "Оплаченная сумма",
    field: "paid_sum",
    align: "right",
  },
  {
    name: "processing_sum",
    label: "Ожидается оплата",
    field: "processing_sum",
    align: "right",
  },
  {
    name: "remaining_sum",
    label: "Остаток",
    field: "remaining_sum",
    align: "right",
  },
];

export const residentDocumentsInfoColumns = [
  {
    name: "project_agreement_id",
    label: "ID",
    field: "project_agreement_id",
    align: "center",
  },
  {
    name: "doc_name",
    label: "Наименование",
    field: "doc_name",
    align: "left",
  },
  {
    name: "project_head_name",
    label: "Заказчик",
    field: "project_head_name",
    align: "left",
  },
  {
    name: "contractor_name",
    label: "Подрядчик",
    field: "contractor_name",
    align: "left",
  },
  {
    name: "is_signed",
    label: "Документ",
    field: "is_signed",
    align: "center",
  },
];
export const residentDocumentsInfoColumns1C = [
  ...residentDocumentsInfoColumns,
  { name: "is_sent", label: "1C", align: "center" },
];

export const residentResponsibilitiesColumns = [
  {
    name: "contractor_name",
    label: "Организация",
    align: "left",
  },
  {
    name: "assign_type_name",
    label: "Должность",
    align: "left",
  },
  {
    name: "paid_sum",
    label: "ФИО",
    align: "left",
  },
];

export const signersColumns = [
  {
    name: "assign_type_name",
    label: "Должность",
    align: "left",
  },
  {
    name: "fio",
    label: "ФИО",
    align: "left",
  },
  {
    name: "assign_type_name",
    label: "Номер телефона",
    align: "left",
  },
  {
    name: "sign_date",
    label: "Дата подписания",
    align: "center",
  },
  {
    name: "assign_type_name",
    label: "Подписан",
    align: "center",
  },
];

export const getStagesBadgeColor = (code) => {
  switch (code) {
    case "DONE":
      return "green";
    case "DEFECT":
      return "red";
    case "PROCESSING":
      return "primary";
    default:
      return "orange";
  }
};
