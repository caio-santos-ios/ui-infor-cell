import { atom } from "jotai";

export const salesOrderModalAtom = atom<boolean>(false);
export const salesOrderIdAtom = atom<string>("");
export const salesOrderCodeAtom = atom<string>("");
export const salesOrderStatusAtom = atom<string>("Rascunho");