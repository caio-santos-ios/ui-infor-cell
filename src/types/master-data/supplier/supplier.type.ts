import { ResetAddress, TAddress } from "../address/address";

export type TSupplier = {
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
}

export const ResetSupplier: TSupplier = {
    id: "",
    document: "",
    corporateName: "",
    tradeName: "",
    email: "",
    phone: "",
    whatsapp: "",
    type: "F",
    createdAt: "",
    address: ResetAddress
}