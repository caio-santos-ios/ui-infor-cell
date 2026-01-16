export type TProduct = {
    id?: string;
    code: string;
    name: string;
    description: string;
    categoryId: string;
    imei: string;
    modelId: string;
    moveStock: boolean;
    quantityStock: number;
    price: number;
    priceDiscount: number;
    priceTotal: number;
    costPrice?: number;
    expenseCostPrice?: number;
    variations: {sequence: number, key: string; value: string}[]
}
export const ResetProduct: TProduct = {
    id: "",
    code: "",
    name: "",
    description: "",
    categoryId: "",
    modelId: "",
    imei: "",
    moveStock: true,
    quantityStock: 0,
    price: 0,
    priceDiscount: 0,
    priceTotal: 0,
    costPrice: 0,
    expenseCostPrice: 0,
    variations: [{sequence: 1, key: "", value: ""}]
}