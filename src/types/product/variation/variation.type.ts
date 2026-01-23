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
    name: string;
    code: string;
    serial: string;
    serialAction: string;
    items: TVariationItem[]
}

export const ResetVariation: TVariation = {
    name: "",
    code: "",
    serial: "",
    serialAction: "",
    items: [{key: '', value: '', active: true, deleted: false, code: "000001", serial: [{value: ''}]}]
}