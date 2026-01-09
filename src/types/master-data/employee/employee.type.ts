import { ResetAddress, TAddress } from "../address/address";

export type TEmployeeCalendar = {
    monday : string[];
    tuesday : string[];
    wednesday : string[];
    thursday : string[];
    friday : string[];
    saturday : string[];
    sunday : string[];
}

export const ResetEmployeeCalendar: TEmployeeCalendar = {
    monday : [],
    tuesday : [],
    wednesday : [],
    thursday : [],
    friday : [],
    saturday : [],
    sunday : []
}

export type TEmployee = {
    id?: string;
    cpf: string;
    rg: string;
    name: string;
    email: string;
    phone: string;
    whatsapp: string;
    photo: string;
    type: string;
    dateOfBirth: any | null;
    createdAt: any;
    address: TAddress;
    modules: TModule[];
    calendar: TEmployeeCalendar;
}

export const ResetEmployee: TEmployee = {
    id: "",
    cpf: "",
    rg: "",
    name: "",
    email: "",
    phone: "",
    whatsapp: "",
    photo: "",
    type: "technical",
    dateOfBirth: null,
    createdAt: "",
    address: ResetAddress,
    modules: [],
    calendar: ResetEmployeeCalendar
}

export type TRoutine = {
    module: string;
    code: string;
    description: string;
    permissions: {
        create: boolean;
        update: boolean;
        read: boolean;
        delete: boolean;
    }
}

export type TModule = {
    id: string;
    code: string;
    description: string;
    routines: TRoutine[]
}

export const ResetModule: TModule = {
    id: "",
    code: "",
    description: "",
    routines: []
}