export type TTransfer = {
    purchaseOrderItemId: string;
    storeOriginId: string;
    storeDestinationId: string;
    stockId: string;
    quantity: number;
}
export const ResetTransfer: TTransfer = {
    purchaseOrderItemId: "",
    storeOriginId: "",
    storeDestinationId: "",
    stockId: "",
    quantity: 1
}