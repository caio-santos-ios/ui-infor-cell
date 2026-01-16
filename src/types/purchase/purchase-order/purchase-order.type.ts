export type TPurchaseOrderItem = {
    id: string;
    purchaseOrderId: string;
    productId: string;
    cost: number;
    costDiscount: number;
    price: number;
    priceDiscount: number;
    quantity: number;
    supplierId: string;
    moveStock: string;
    variations: {sequence: number, key: string; value: string}[]
}
export const ResetPurchaseOrderItem: TPurchaseOrderItem = {
    id: "",
    productId: "",
    purchaseOrderId: "",
    cost: 0,
    costDiscount: 0,
    price: 0,
    priceDiscount: 0,
    quantity: 0,
    supplierId: "",
    moveStock: "yes",
    variations: []
}

export type TPurchaseOrder = {
    id: string;
    code: string;
    date: any;
    total: number;
    discount: number;
    notes: string;
}
export const ResetPurchaseOrder: TPurchaseOrder = {
    id: "",
    code: "",
    date: new Date().toISOString().split('T')[0],
    total: 0,
    discount: 0,
    notes: ""
}