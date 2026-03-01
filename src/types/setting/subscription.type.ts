export type TSubscription = {
    id: string;
    planType: string;
    billingType: string;
    status: string;
    value: number;
    nextDueDate: string | null;
    startDate: string;
    expirationDate: string | null;
    paymentUrl: string;
    asaasSubscriptionId: string;
};

export type TPaymentHistory = {
    id: string;
    status: string;
    value: number;
    dueDate: string;
    paymentDate: string | null;
    billingType: string;
    invoiceUrl: string;
    bankSlipUrl: string;
};

export const ResetSubscription: TSubscription = {
    id: "",
    planType: "",
    billingType: "",
    status: "",
    value: 0,
    nextDueDate: null,
    startDate: "",
    expirationDate: null,
    paymentUrl: "",
    asaasSubscriptionId: "",
};