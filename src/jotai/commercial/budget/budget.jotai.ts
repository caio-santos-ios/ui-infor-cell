import { atom } from "jotai";

export const budgetModalAtom = atom<boolean>(false);
export const budgetModalStepAtom = atom<"seller" | "items">("seller");
export const budgetIdAtom = atom<string>("");
export const budgetCodeAtom = atom<string>("");
export const budgetStatusAtom = atom<string>("Em Aberto");
