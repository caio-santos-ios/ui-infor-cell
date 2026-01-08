export type TEmployee = {
    id?: string;
    cpf: string;
    rg: string;
    name: string;
    email: string;
    phone: string;
    whatsapp: string;
    photo: string;
    age: number | null;
    createdAt: any;
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
    age: null,
    createdAt: ""
}