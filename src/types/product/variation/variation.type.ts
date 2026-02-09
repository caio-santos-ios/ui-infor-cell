import { TSerial } from "../serial/serial.type";

export type TVariationItem = {
    code: string; 
    key: string; 
    value: string;
    active: boolean;
    deleted: boolean;
    serial: {value: ''}[]
}

export const ResetVariationItem: TVariationItem = {
    code: "", 
    key: "", 
    value: "",
    active: true,
    deleted: false,
    serial: [{value: ''}]
}

export type TVariation = {
    id: string;
    barcode: string;
    name: string;
    code: string;
    serial: string;
    serialAction: string;
    variationId: string;
    stock: number;
    items: TVariationItem[]
    serials: TSerial[]
}

export const ResetVariation: TVariation = {
    id: "",
    name: "",
    barcode: "",
    code: "",
    serial: "",
    serialAction: "",
    variationId: "",
    stock: 0,
    items: [{key: '', value: '', active: true, deleted: false, code: "000001", serial: [{value: ''}]}],
    serials: []
}