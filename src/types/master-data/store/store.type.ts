import { ResetAddress, TAddress } from "../address/address";

export type TStore = {
    id?: string;
    companyId: string;
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

export const ResetStore: TStore = {
    id: "",
    companyId: "",
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