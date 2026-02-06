import { atom } from "jotai";

export const serialModalAtom = atom<boolean>(false);
export const serialModalViewStockAtom = atom<boolean>(false);
export const serialIdAtom = atom<string>("");
export const serialActionAtom = atom<string>("");