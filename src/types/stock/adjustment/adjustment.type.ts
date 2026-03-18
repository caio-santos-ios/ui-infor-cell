import { TSerial } from "@/types/product/serial/serial.type";
import { TVariationPurchaseOrderItem } from "@/types/purchase/purchase-order/purchase-order.type";

export type TAdjustment = {
    id?: string;
    type: "Entrada" | "Saída";
    productId: string;
    productName: string;
    cost: number;
    costDiscount: number;
    price: number;
    priceDiscount: number;
    quantity: number;
    hasProductSerial: string;
    hasProductVariations: string;
    variations: TVariationPurchaseOrderItem[]
    variationsCode: string[];
    serials: TSerial[];
    serial: string;
    codeVariation: string;
    code: string;
}

export const ResetAdjustment: TAdjustment = {
    id: "",
    type: "Entrada",
    cost: 0,
    costDiscount: 0,
    price: 0,
    priceDiscount: 0,
    quantity: 0,
    productId: "",
    productName: "",
    codeVariation: "",
    hasProductSerial: "no",
    hasProductVariations: "no",
    variations: [],
    variationsCode: [],
    serials: [],
    serial: "",
    code: "",
}