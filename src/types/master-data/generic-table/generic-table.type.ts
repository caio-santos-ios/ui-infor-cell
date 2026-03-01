export type TGenericTable = {
    id: string;
    name: string;
    description: string;
    active: boolean;
    codeAutomatic: boolean;
}

export const ResetGenericTable: TGenericTable = {
    id: "",
    name: "",
    description: "",
    active: true,
    codeAutomatic: false
}