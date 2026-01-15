import { instance } from "@/services/api";
import { ReqResponse } from "@/services/types";
import { AgreementHistoryResponse, AgreementsResponse } from "./types";

export const agreementsAPI = {
  async getAgreements(
    signal?: AbortSignal
  ): Promise<ReqResponse<AgreementsResponse>> {
    return instance()
      .get(`mobile/agreement/`, { signal })
      .then((res) => res?.data);
  },
  async getAgreementsHistory(
    signal?: AbortSignal
  ): Promise<ReqResponse<AgreementHistoryResponse>> {
    return instance()
      .get(`mobile/agreement/signed/`, { signal })
      .then((res) => res?.data);
  },
};
