import { Gallery } from "./modals/Gallery";
import { SyncData } from "./modals/SyncData";
import { ExitConfirm } from "./modals/ExitConfirm";

export const MODAL_NAMES = {
  gallery: "gallery",
  syncData: "syncData",
  exitConfirm: "exitConfirm",
} as const;

export const ModalContent = {
  [MODAL_NAMES.gallery]: Gallery,
  [MODAL_NAMES.syncData]: SyncData,
  [MODAL_NAMES.exitConfirm]: ExitConfirm,
};
