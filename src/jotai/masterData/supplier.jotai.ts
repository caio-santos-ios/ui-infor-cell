import { ResetCustomer, TCustomer } from "@/types/master-data/customer/customer.type";
import { TSupplier } from "@/types/master-data/supplier/supplier.type";
import { atom } from "jotai";

export const supplierModalCreateAtom = atom<boolean>(false);
export const supplierAtom = atom<TSupplier>(ResetCustomer);