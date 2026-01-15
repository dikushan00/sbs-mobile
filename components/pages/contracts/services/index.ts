import { agreementsAPI } from "./api";
import { AgreementsResponse, AgreementHistoryResponse } from "./types";

export const getAgreements = async (): Promise<AgreementsResponse | undefined> => {
  try {
    const res = await agreementsAPI.getAgreements();
    return res?.data;
  } catch (e) {}
};

export const getAgreementsHistory = async (): Promise<AgreementHistoryResponse | undefined> => {
  try {
    const res = await agreementsAPI.getAgreementsHistory();
    return res?.data;
  } catch (e) {}
};

