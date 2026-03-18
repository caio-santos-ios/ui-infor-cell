import { atom } from "jotai";

export const paymentMethodModalAtom = atom<boolean>(false);
export const paymentMethodIdAtom = atom<string>("");