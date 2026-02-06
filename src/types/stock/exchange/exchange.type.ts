import { TSerial } from "@/types/product/serial/serial.type";

export type TVariationExchange = {
    code: string;
    barcode: string;
    variationId: string;
    variationItemId: string;
    stock: number;
    value: string;
    serials: TSerial[]
}

export const ResetVariationExchange: TVariationExchange = {
    code: "",
    barcode: "",
    variationId: "",
    variationItemId: "",
    stock: 0,
    value: "",
    serials: []
}

export type TExchange = {
    salesOrderItemId: string;
    productName: string;
    quantity: number;
    cost: number;
    productHasSerial: string;
    serial: string;
    forSale: string;
    productId: string;
    origin: string;
    variations: TVariationExchange[]
    variationsCode: string[];
}

export const ResetExchange: TExchange = {
    salesOrderItemId: "",
    productName: "",
    quantity: 1,
    cost: 0,
    productHasSerial: "no",
    serial: "",
    forSale: "no",
    productId: "",
    origin: "",
    variations: [],
    variationsCode: []
}