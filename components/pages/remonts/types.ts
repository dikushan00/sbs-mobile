import { OkkStatusKeyType } from "../okk/services";
import {
  DetailRemontResponse,
  WorkHistoryStatusKeys,
  WorkStatusesKeyType,
} from "./services";

export interface RemontType {
  remont_id: number;
  project_remont_url: string;
  navigator_url: string;
  end_date?: string;
  begin_date?: string;
  date_begin_plan: string;
  date_begin_fact: string;
  date_end_plan: string;
  date_end_fact: string;
  work_status: string;
  okk_status?: string;
  price: string;
  intercom: string;
  dgis_url: string;
  address: string;
  resident_address: string;
  resident_name: string;
  is_active: boolean;
  isOfflineData?: boolean;
  key_type: number;
  key_code: string;
  team_masters: MasterType[];
  okk_num?: {
    all: number;
    done: number;
  } | null;
  work_num: {
    all: number;
    done: number;
  } | null;
  remont_key_request: {
    remont_key_id: number | null;
    is_accept: boolean;
  } | null;
  work_set_info: WorkType[] | null;
  info?: DetailRemontResponse;
}
export interface RoomMediaType extends RoomType {
  media_url_list: string[];
}
export type WorkSetFileType = {
  url: string;
  id: number;
  checked: boolean;
  desc?: string;
};
export type WorkSetMediaType = {
  id: string;
  master_work_set_media_type_id: number | string;
  master_work_set_media_type_name: string;
  master_work_set_media_type_code: WorkHistoryStatusKeys;
  is_allow: boolean;
  media_url_list: string[];
  files?: WorkSetFileType[];
  rooms: RoomMediaType[];
  comment: string | null;
  date: string;
  isOfflineData?: boolean;
};
export interface WorkType {
  work_set_id: number;
  work_set_name: string;
  work_set_price_info: string;
  date_begin_plan: string | null;
  date_begin_fact: string | null;
  date_end_plan: string | null;
  date_end_fact: string | null;
  end_date?: string | null;
  work_status: WorkStatusesKeyType;
  check_status_code: OkkStatusKeyType;
  phone_number?: string | null;
  team_master_id?: number;
  team_master_fio?: string;
  work_amount?: string;
  rooms: RoomType[];
  media: WorkSetMediaType[] | null | undefined;
  isOfflineData?: boolean;
  remont_id?: number;
}
export interface SpecialityType {
  speciality_id: number;
  speciality_name: string;
  speciality_code: string;
}
export interface MasterType {
  team_master_id: number;
  team_master_fio: string;
}
export interface RoomType {
  room_id: number;
  room_name: string;
}

export type FileType = {
  uri: string;
  name: string;
  type: string;
  desc?: string;
  room_id?: number;
  checked?: boolean;
  deletable?: boolean;
  file?: Blob | undefined | null;
};
