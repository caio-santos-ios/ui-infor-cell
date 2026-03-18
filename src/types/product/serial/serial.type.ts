export type TSerial = {
    code: string;
    cost: number;
    price: number;
    hasAvailable: boolean;
}  
export const ResetSerial: TSerial = {
    code: "",
    cost: 0,
    price: 0,
    hasAvailable: true
}