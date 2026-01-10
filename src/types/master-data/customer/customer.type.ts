import { ResetAddress, TAddress } from "../address/address";

export type TCustomer = {
    id?: string;
    corporateName: string;
    tradeName: string;
    type: string;
    document: string;
    email: string;
    phone: string;
    address: TAddress;
}

export const ResetCustomer: TCustomer = {
    id: "",
    corporateName: "",
    tradeName: "",
    type: "",
    document: "",
    email: "",
    phone: "",
    address: ResetAddress,
}