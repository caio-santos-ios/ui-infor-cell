import { TSituation } from "@/types/order-service/situation.type";
import { atom } from "jotai";

export const situationModalAtom = atom<boolean>(false);
export const situationIdAtom = atom<string>("");
export const situationsAtom = atom<TSituation[]>([]);