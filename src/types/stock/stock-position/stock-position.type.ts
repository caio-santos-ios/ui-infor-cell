export type TStockPosition = {
    id: string;
    store: string;
    purchaseOrderItemId: string;
    quantity: number;
    productId: string;
    productName: string;
}
export const ResetStockPosition: TStockPosition = {
    id: "",
    store: "",
    purchaseOrderItemId: "",
    quantity: 0,
    productId: "",
    productName: "",
}