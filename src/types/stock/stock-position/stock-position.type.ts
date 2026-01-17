export type TStockPosition = {
    id: string;
    store: string;
    purchaseOrderItemId: string;
    quantity: number;
}
export const ResetStockPosition: TStockPosition = {
    id: "",
    store: "",
    purchaseOrderItemId: "",
    quantity: 0,
}