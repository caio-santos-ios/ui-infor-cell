import { atom } from "jotai";

export const exchangeModalAtom = atom<boolean>(false);
export const exchangeReturnModalAtom = atom<boolean>(false);
export const exchangeIdAtom = atom<string>("");
export const exchangeTypeAtom = atom<string>("excharge");