import { ResetAddress, TAddress } from "../address/address";

export type TSupplier = {
    id?: string;
    corporateName: string;
    tradeName: string;
    type: string;
    document: string;
    email: string;
    phone: string;
    address: TAddress;

}

export const ResetSupplier:TSupplier = {
    id: "",
    corporateName: "",
    tradeName: "",
    type: "",
    document: "",
    email: "",
    phone: "",
    address: ResetAddress,
}