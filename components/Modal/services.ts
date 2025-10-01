import { Gallery } from "./modals/Gallery";
import { SyncData } from "./modals/SyncData";

export const MODAL_NAMES = {
  gallery: "gallery",
  syncData: "syncData",
} as const;

export const ModalContent = {
  [MODAL_NAMES.gallery]: Gallery,
  [MODAL_NAMES.syncData]: SyncData,
};
