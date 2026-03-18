import { ResetCustomerCashback, TCustomerCashback } from "@/types/master-data/customer/customer.type";
import { atom } from "jotai";

export const customerCashbackModalCreateAtom = atom<boolean>(false);
export const customerCashbackIdModalAtom = atom<string>("");
export const customerCashbackAtom = atom<TCustomerCashback>(ResetCustomerCashback);