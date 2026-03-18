export type TFiscalConfig = {
    id: string;
    environment: string;
    seriesNfe: number;
    seriesNfce: number;
    certificateBase64: string;
    certificatePassword: string;
    certificateExpiration: string;
    csc: string;
    cscId: string;
    taxRegime: string;
    defaultCfopInState: string;
    defaultCfopOutState: string;
    defaultCfopService: string;
    street: string;
    addressNumber: string;
    district: string;
    city: string;
    cityCode: string;
    state: string;
    zipCode: string;
    store: string;
    company: string;
    plan: string;
};

export const ResetFiscalConfig: TFiscalConfig = {
    id: "",
    environment: "homologacao",
    seriesNfe: 1,
    seriesNfce: 1,
    certificateBase64: "",
    certificatePassword: "",
    certificateExpiration: "",
    csc: "",
    cscId: "",
    taxRegime: "1",
    defaultCfopInState: "5102",
    defaultCfopOutState: "6102",
    defaultCfopService: "5933",
    street: "",
    addressNumber: "",
    district: "",
    city: "",
    cityCode: "",
    state: "SP",
    zipCode: "",
    store: "",
    company: "",
    plan: "",
};