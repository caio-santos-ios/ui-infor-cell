export type TVariationProduct = {
    code: string;
    barcode: string;
    variationId: string;
    variationItemId: string;
    stock: number;
}

export const ResetVariationProduct: TVariationProduct = {
    code: "",
    barcode: "",
    variationId: "",
    variationItemId: "",
    stock: 0,
}

export type TProductSerial = {
    serialNumber: string;
    imei1: string;
    imei2: string;
    status: string;
    storeId: string;
    individualCost: number;
    individualPrice: number;
    origin: string;
    originDoc: string;
    warrantyExpiration: any;
    observations: string;
};

export const ResetProductSerial = {
    serialNumber: "",
    imei1: "",
    imei2: "",
    status: "",
    storeId: "",
    individualCost: 0,
    individualPrice: 0,
    origin: "",
    originDoc: "",
    warrantyExpiration: null,
    observations: "",
};

export type TProduct = {
    id?: string;
    code: string;
    name: string;
    description: string;
    categoryId: string;
    imei: string;
    modelId: string;
    moveStock: string;
    quantityStock: number;
    price: number;
    priceDiscount: number;
    priceTotal: number;
    costPrice?: number;
    expenseCostPrice?: number;
    variations: TVariationProduct[];
    sku: string;
    ean: string;
    barcode: string;
    unitOfMeasure: string;
    descriptionComplet: string;
    subCategory: string;
    active: boolean;
    type: string;
    
    minimumStock: number;
    maximumStock: number;
    saleWithoutStock: string;
    hasVariations: string;
    hasSerial: string;
    physicalLocation: string;

    cost: number;
    averageCost: number;
    minimumPrice: number;
    margin: number;
    hasDiscount: string;
    
    ncm: string;
    cest: number;
    cfopIn: number;
    cfopOut: number;
    origin: string;
    cst: number;
    cstIcms: string;
    icms: number;
    cstPis: string;
    pis: number;
    cstCofins: string;
    cofins: number;
    cstIpi: string;
    ipi: number;
    ibpt: number;
    taxGroup: string;

    serials: TProductSerial[]
}

export const ResetProduct: TProduct = {
    id: "",
    code: "",
    name: "",
    description: "",
    categoryId: "",
    modelId: "",
    imei: "",
    moveStock: "yes",
    quantityStock: 0,
    price: 0,
    priceDiscount: 0,
    priceTotal: 0,
    costPrice: 0,
    expenseCostPrice: 0,
    variations: [ResetVariationProduct],
    serials: [ResetProductSerial],
    sku: "",
    ean: "",
    barcode: "",
    unitOfMeasure: "",
    descriptionComplet: "",
    subCategory: "",
    active: true,
    type: "Mercadoria",
    
    minimumStock: 1,
    maximumStock: 1,
    saleWithoutStock: "yes",
    hasVariations: "yes",
    hasSerial: "yes",
    physicalLocation: "",

    cost: 0,
    averageCost: 0,
    minimumPrice: 0,
    margin: 0,
    hasDiscount: "yes",

    ncm: "",
    cest: 0,
    cfopIn: 0,
    cfopOut: 0,
    origin: "",
    cst: 0,
    cstIcms: "",
    icms: 0,
    cstPis: "",
    pis: 0,
    cstCofins: "",
    cofins: 0,
    cstIpi: "",
    ipi: 0,
    ibpt: 0,
    taxGroup: ""
}