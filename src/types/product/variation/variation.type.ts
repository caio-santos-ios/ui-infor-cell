export type TVariationItem = {
    sequence: number; 
    key: string; 
    value: string;
    active: boolean;
    serial: {value: ''}[]
}

export const ResetVariationItem: TVariationItem = {
    sequence: 1, 
    key: "", 
    value: "",
    active: true,
    serial: [{value: ''}]
}

export type TVariation = {
    name: string;
    serial: string;
    serialAction: string;
    items: TVariationItem[]
}

export const ResetVariation: TVariation = {
    name: "",
    serial: "",
    serialAction: "",
    items: [{key: '', value: '', active: true, sequence: 1, serial: [{value: ''}]}]
}