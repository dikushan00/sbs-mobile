import { MODAL_NAMES } from "./services";

export type ModalKeys = keyof typeof MODAL_NAMES;

export type ModalDataType = {
  show: boolean;
  data: any;
  type: ModalKeys | null;
};
export type GalleryType = {
  activeIndex?: number;
  files: {
    file_url: string | null;
  }[];
};
type ModalPayloadMap = {
  [MODAL_NAMES.gallery]: GalleryType;
  [MODAL_NAMES.syncData]: { close?: boolean };
  [MODAL_NAMES.exitConfirm]: { close?: boolean };
};

export type ModalPayload<T extends ModalKeys | null> = {
  type: T;
  data: T extends keyof ModalPayloadMap ? ModalPayloadMap[T] : never;
};
