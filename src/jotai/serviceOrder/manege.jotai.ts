import { atom } from "jotai";

export const serviceOrderModalSearchAtom = atom<boolean>(false);
export const serviceOrderModalViewAtom = atom<boolean>(false);
export const serviceOrderSearchAtom = atom<boolean>(false);
export const serviceOrderIdAtom = atom<string>("");
export const currentMomentServiceOrderAtom = atom<"start" | "quite" | "end">("start");