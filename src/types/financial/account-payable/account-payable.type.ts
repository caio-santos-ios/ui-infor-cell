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
    chartOfAccountId: string;
    issueDate: any;
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
    chartOfAccountId: "",
    issueDate: new Date().toISOString().split("T")[0],
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
    open:      { label: "Em aberto",  color: "bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300"   },
    paid:      { label: "Pago",       color: "bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300 text-green-700" },
    partial:   { label: "Parcial",    color: "bg-yellow-100 text-yellow-700 dark:bg-yellow-900 dark:text-yellow-300 text-yellow-700" },
    overdue:   { label: "Vencido",    color: "bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300 text-red-700"     },
    cancelled: { label: "Cancelado",  color: "bg-gray-100 text-gray-700 dark:bg-gray-900 dark:text-gray-300 text-gray-600"   },
};
