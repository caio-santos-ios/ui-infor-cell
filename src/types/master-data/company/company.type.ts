import { ResetAddress, TAddress } from "../address/address";

export type TCompany = {
    id?: string;
    document: string;
    corporateName: string;
    tradeName: string;
    stateRegistration: string;
    municipalRegistration: string;
    email: string;
    phone: string;
    whatsapp: string;
    photo: string;
    website: string;
    createdAt: any;

    address: TAddress;
}

export const ResetCompany: TCompany = {
    id: "",
    document: "",
    corporateName: "",
    tradeName: "",
    stateRegistration: "",
    municipalRegistration: "",
    email: "",
    phone: "",
    whatsapp: "",
    photo: "",
    website: "",
    createdAt: "",

    address: ResetAddress
}