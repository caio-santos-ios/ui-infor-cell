export type TAddress = {
    id?: string;
    street: string;
    number: string;
    complement: string;
    neighborhood: string;
    city: string;
    state: string;
    zipCode: string;
    parent: string;
    parentId: string;
}

export const ResetAddress: TAddress = {
    id: "",
    street: "",
    number: "",
    complement: "",
    neighborhood: "",
    city: "",
    state: "",
    zipCode: "",
    parent: "",
    parentId: ""
}