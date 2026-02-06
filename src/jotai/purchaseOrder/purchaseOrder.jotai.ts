import { atom } from "jotai";

export const purchaseOrderModalAtom = atom<boolean>(false);
export const purchaseOrderIdAtom = atom<string>("");
export const purchaseOrderStatusAtom = atom<string>("Rascunho");