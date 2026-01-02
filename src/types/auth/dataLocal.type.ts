export type TDataLocal = {
    token: string;
    name: string;
    email: string;
    admin: string;
    photo: string;
    logoCompany: string;
    modules: any[];
}

export const ResetDataLocal: TDataLocal = {
    token: "",
    name: "",
    email: "",
    admin: "",
    photo: "",
    logoCompany: "",
    modules: []
} 