export type TAccountPayable = {
    id: string;
    code: string;
    originId: string;
    originType: string;
    supplierId: string;
    supplierName: string;
    description: string;
    paymentMethodId: string;
    paymentMethodName: string;
    amount: number;
    amountPaid: number;
    installmentNumber: number;
    totalInstallments: number;
    dueDate: string;
    paidAt: string;
    status: string;
    notes: string;
};

export const ResetAccountPayable: TAccountPayable = {
    id: "",
    code: "",
    originId: "",
    originType: "manual",
    supplierId: "",
    supplierName: "",
    description: "",
    paymentMethodId: "",
    paymentMethodName: "",
    amount: 0,
    amountPaid: 0,
    installmentNumber: 1,
    totalInstallments: 1,
    dueDate: "",
    paidAt: "",
    status: "open",
    notes: "",
};

export type TPayAccountPayable = {
    id: string;
    amountPaid: number;
    paidAt: string;
    status: string;
};

export const ResetPayAccountPayable: TPayAccountPayable = {
    id: "",
    amountPaid: 0,
    paidAt: new Date().toISOString().split("T")[0],
    status: "paid",
};

export const statusLabelPayable: Record<string, { label: string; color: string }> = {
    open:      { label: "Em aberto",  color: "text-blue-700 bg-blue-100"   },
    paid:      { label: "Pago",       color: "text-green-700 bg-green-100" },
    partial:   { label: "Parcial",    color: "text-yellow-700 bg-yellow-100" },
    overdue:   { label: "Vencido",    color: "text-red-700 bg-red-100"     },
    cancelled: { label: "Cancelado",  color: "text-gray-600 bg-gray-100"   },
};
