import { TSerial } from "@/types/product/serial/serial.type";

export type TVariationPurchaseOrderItem = {
    code: string;
    barcode: string;
    variationId: string;
    variationItemId: string;
    stock: number;
    value: string;
    serials: TSerial[]
}

export const ResetVariationPurchaseOrderItem: TVariationPurchaseOrderItem = {
    code: "",
    barcode: "",
    variationId: "",
    variationItemId: "",
    stock: 0,
    value: "",
    serials: []
}

export type TPurchaseOrderItem = {
    id: string;
    purchaseOrderId: string;
    productId: string;
    cost: number;
    costDiscount: number;
    price: number;
    priceDiscount: number;
    margin: number;
    netProfit: number;
    quantity: number;
    supplierId: string;
    moveStock: string;
    hasProductSerial: string;
    variations: TVariationPurchaseOrderItem[]
    variationsCode: string[];
}

export const ResetPurchaseOrderItem: TPurchaseOrderItem = {
    id: "",
    productId: "",
    purchaseOrderId: "",
    cost: 0,
    costDiscount: 0,
    price: 0,
    priceDiscount: 0,
    margin: 0,
    netProfit: 0,
    quantity: 0,
    supplierId: "",
    moveStock: "yes",
    variations: [],
    variationsCode: [],
    hasProductSerial: "yes"
}

export type TPurchaseOrder = {
    id: string;
    code: string;
    store: string;
    status: string;
    date: any;
    updatedAt: any;
    total: number;
    discount: number;
    quantity: number;
    notes: string;
    userApproval: string;
}
export const ResetPurchaseOrder: TPurchaseOrder = {
    id: "",
    code: "",
    store: "",
    status: "",
    date: new Date().toISOString().split('T')[0],
    updatedAt: "",
    total: 0,
    discount: 0,
    quantity: 0,
    notes: "",
    userApproval: "",
}