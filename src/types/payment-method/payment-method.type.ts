export type TPaymentMethod = {
    id: string;
    code: string;
    name: string;
    type: string;
    numberOfInstallments: number;
    interest: {installment: number; value: number}[]
}  
export const ResetPaymentMethod: TPaymentMethod = {
    id: "",
    code: "",
    name: "",
    type: "all",
    numberOfInstallments: 12,
    interest: [
        {installment: 1, value: 0},
        {installment: 2, value: 0},
        {installment: 3, value: 0},
        {installment: 4, value: 0},
        {installment: 5, value: 0},
        {installment: 6, value: 0},
        {installment: 7, value: 0},
        {installment: 8, value: 0},
        {installment: 9, value: 0},
        {installment: 10, value: 0},
        {installment: 11, value: 0},
        {installment: 12, value: 0},
    ]
}