import { ResetAddress, TAddress } from "../address/address";

export type TCustomerCashback = {
    responsible: string;
    description: string;
    originDescription: string;
    origin: string;
    originId: string;
    value: number;
    currentValue: number;
    available: boolean;
    date: any;
};

export const ResetCustomerCashback: TCustomerCashback = {
    responsible: "",
    description: "",
    originDescription: "",
    origin: "",
    originId: "",
    value: 0,
    currentValue: 0,
    available: true,
    date: new Date()
};

export type TCustomer = {
    id?: string;
    document: string;
    corporateName: string;
    tradeName: string;
    email: string;
    phone: string;
    whatsapp: string;
    type: string;
    createdAt: any;
    address: TAddress;
    cashbacks: TCustomerCashback[]
}

export const ResetCustomer: TCustomer = {
    id: "",
    document: "",
    corporateName: "",
    tradeName: "",
    email: "",
    phone: "",
    whatsapp: "",
    type: "F",
    createdAt: "",
    address: ResetAddress,
    cashbacks: []
}