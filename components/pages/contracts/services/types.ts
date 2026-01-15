// Договор на подписании
export interface Agreement {
  project_id: number;
  doc_name: string;
  project_agreement_id: number;
  contractor_agreement_list_id: number;
  agreement_sum: number;
  type: string;
  project_head_name: string;
  project_head_fio: string;
  contractor_name: string;
  contractor_fio: string;
  project_head_is_sign: boolean;
  project_head_date: string | null;
  contractor_is_sign: boolean;
  contractor_date: string | null;
  project_head_can_sign: boolean;
  contractor_can_sign: boolean | null;
  is_sent_to_1c: number;
  error: string | null;
}

export type AgreementsResponse = Agreement[];

// Подписанный договор (история)
export interface SignedAgreement {
  project_id: number;
  doc_name: string;
  project_agreement_id: number;
  contractor_agreement_list_id: number;
  agreement_sum: number;
  type: string;
  sign_date: string;
  project_head_name: string;
  project_head_fio: string;
  contractor_name: string;
  contractor_fio: string;
  is_sent_to_1c: number;
  error: string | null;
}

export interface AgreementHistoryItem {
  sign_date: string;
  agreements: SignedAgreement[];
}

export type AgreementHistoryResponse = AgreementHistoryItem[];

