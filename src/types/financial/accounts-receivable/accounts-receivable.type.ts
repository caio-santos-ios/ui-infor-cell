export type TAccountReceivable = {
    id: string;
    companyId: string;
    storeId: string;
    originId: string;
    originType: string;
    customerId: string;
    customerName: string;
    description: string;
    paymentMethodId: string;
    paymentMethodName: string;
    amount: number;
    amountPaid: number;
    installmentNumber: number;
    totalInstallments: number;
    dueDate: string;
    paidAt: string | null;
    status: string; // "open" | "paid" | "partial" | "overdue" | "cancelled"
    notes: string;
    createdAt: string;
}

export const ResetAccountReceivable: TAccountReceivable = {
    id: "",
    companyId: "",
    storeId: "",
    originId: "",
    originType: "manual",
    customerId: "",
    customerName: "",
    description: "",
    paymentMethodId: "",
    paymentMethodName: "",
    amount: 0,
    amountPaid: 0,
    installmentNumber: 1,
    totalInstallments: 1,
    dueDate: "",
    paidAt: null,
    status: "open",
    notes: "",
    createdAt: ""
}

export type TPayAccountReceivable = {
    id: string;
    amountPaid: number;
    paidAt: string;
    status: string;
}

export const statusLabel: Record<string, { label: string; color: string }> = {
    open:      { label: "Em Aberto",  color: "bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300" },
    paid:      { label: "Recebido",   color: "bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300" },
    partial:   { label: "Parcial",    color: "bg-yellow-100 text-yellow-700 dark:bg-yellow-900 dark:text-yellow-300" },
    overdue:   { label: "Vencido",    color: "bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300" },
    cancelled: { label: "Cancelado",  color: "bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300" },
}
