import { TPurchaseOrderItem } from "@/types/purchase/purchase-order/purchase-order.type";
import { atom } from "jotai";

export const purchaseOrderItemsAtom = atom<TPurchaseOrderItem[]>([]);