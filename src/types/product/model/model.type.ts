export type TModel = {
    id?: string;
    brandId: string;
    categoryId: string;
    code: string;
    name: string;
    description: string;
}
export const ResetModel: TModel = {
    id: "",
    brandId: "",
    categoryId: "",
    code: "",
    name: "",
    description: ""
}