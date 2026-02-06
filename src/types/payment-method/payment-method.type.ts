export type TPaymentMethod = {
    id: string;
    code: string;
    name: string;
    type: string;
    numberOfInstallments: number;
}  
export const ResetPaymentMethod: TPaymentMethod = {
    id: "",
    code: "",
    name: "",
    type: "all",
    numberOfInstallments: 12
}