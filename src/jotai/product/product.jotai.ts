import { ResetProduct, TProduct } from "@/types/product/product/product.type";
import { atom } from "jotai";

export const hasVariationProductAtom = atom<string>("yes");
export const hasMoveStockProductAtom = atom<string>("yes");
export const productAtom = atom<TProduct>(ResetProduct);