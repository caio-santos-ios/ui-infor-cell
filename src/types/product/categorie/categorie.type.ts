export type TSubCategory = {
    code: string;
    name: string;
};

export const ResetSubCategory: TSubCategory = {
    code: "",
    name: ""
};

export type TCategorie = {
    id?: string;
    code: string;
    name: string;
    description: string;
    subcategories: TSubCategory[];
}
export const ResetCategorie: TCategorie = {
    id: "",
    code: "",
    name: "",
    description: "",
    subcategories: []
}