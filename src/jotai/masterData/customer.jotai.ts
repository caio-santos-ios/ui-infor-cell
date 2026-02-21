import { ResetCustomer, TCustomer } from "@/types/master-data/customer/customer.type";
import { atom } from "jotai";

export const customerModalCreateAtom = atom<boolean>(false);
export const customerIdModalAtom = atom<string>("");
export const customerAtom = atom<TCustomer>(ResetCustomer);