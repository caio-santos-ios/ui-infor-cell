export type TTransfer = {
    purchaseOrderItemId: string;
    storeOriginId: string;
    storeDestinationId: string;
    stockId: string;
    quantity: number;
    variationId: string;
    barcode: string;
    productHasSerial: string;
    productHasVariations: string;
    serial: string;
}
export const ResetTransfer: TTransfer = {
    purchaseOrderItemId: "",
    storeOriginId: "",
    storeDestinationId: "",
    stockId: "",
    quantity: 1,
    variationId: "",
    barcode: "",
    productHasSerial: "no",
    productHasVariations: "no",
    serial: ""
}