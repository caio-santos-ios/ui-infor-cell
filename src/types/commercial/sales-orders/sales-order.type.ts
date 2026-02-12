export type TSalesOrder = {
    id: string;
    code: string;
    itemId: string;
    sellerId: string;
    sellerName: string;
    customerId: string;
    customerName: string;
    productId: string;
    productName: string;
    barcode: string;
    image: string;
    value: number;
    total: number;
    discountValue: number;
    discountType: string;
    variationId: string;
    quantity: number;
    createItem: boolean;
    productHasSerial: string;
    productHasVariations: string;
    serial: string;
    stockId: string;
}
export const ResetSalesOrder: TSalesOrder = {
    id: "",
    code: "",
    itemId: "",
    sellerId: "",
    sellerName: "",
    customerId: "",
    customerName: "Ao consumidor",
    productId: "",
    productName: "",
    barcode: "",
    image: "",
    value: 0,
    total: 0,
    discountValue: 0,
    discountType: "money",
    quantity: 1,
    createItem: true,
    variationId: "",
    productHasSerial: "no",
    productHasVariations: "no",
    serial: "",
    stockId: ""
}

export type TSalesOrderFinish = {
    id: string;
    paymentMethodId: string;
    numberOfInstallments: number;
    discountValue: number;
    discountType: string;
    freight: number;
    currier: string;
}
export const ResetSalesOrderFinish: TSalesOrderFinish = {
    id: "",
    paymentMethodId: "",
    numberOfInstallments: 1,
    discountValue: 0,
    discountType: "money",
    freight: 0,
    currier: ""
}