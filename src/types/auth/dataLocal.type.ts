export type TDataLocal = {
    token: string;
    refreshToken: string;
    name: string;
    email: string;
    admin: string;
    photo: string;
    logoCompany: string;
    nameCompany: string;
    nameStore: string;
    modules: any[];
    typeUser: string;
}

export const ResetDataLocal: TDataLocal = {
    token: "",
    refreshToken: "",
    name: "",
    email: "",
    admin: "",
    photo: "",
    logoCompany: "",
    nameCompany: "",
    nameStore: "",
    modules: [],
    typeUser: "",
} 