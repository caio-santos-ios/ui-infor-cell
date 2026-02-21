export type TServiceOrderDevice = {
  type: string;
  brandId: string;
  brandName: string;
  modelId: string;
  modelName: string;
  color: string;
  serialImei: string;
  customerReportedIssue: string;
  unlockPassword: string;
  accessories: string;
  physicalCondition: string;
};

export type TServiceOrderPayment = {
  paymentMethodId: string;
  paymentMethodName: string;
  numberOfInstallments: number;
  paidAt?: string;
  paidByUserId: string;
};

export type TServiceOrderLaudo = {
  technicalReport: string;
  testsPerformed: string;
  repairStatus: string;
};

export type TServiceOrder = {
  id: string;
  code: string;
  customerId: string;
  customerName: string;
  customerPhone: string;
  customerEmail: string;
  openedByUserId: string;
  openedAt: string;
  closedAt?: string;
  closedByUserId: string;
  status: string;
  isWarrantyInternal: boolean;
  warrantyUntil?: string;
  warrantyDays: number;
  totalAmount: number;
  discountValue: number;
  discountType: string;
  notes: string;
  cancelReason: string;
  warrantyOverrideReason: string;
  device: TServiceOrderDevice;
  payment: TServiceOrderPayment;
  laudo: TServiceOrderLaudo;
  createdAt: string;
  updatedAt: string;
  store: string;
  company: string;
  priority: string;
  model: string;
};

export type TServiceOrderItem = {
  id: string;
  serviceOrderId: string;
  itemType: string; // service | part
  description: string;
  productId: string;
  isManual: boolean;
  quantity: number;
  price: number;
  cost: number;
  total: number;
  supplierId: string;
  supplierName: string;
  technicianId: string;
  technicianName: string;
  commission: number;
  commissionType: string;
  createdAt: string;
  createdBy: string;
};

export const ResetServiceOrderDevice: TServiceOrderDevice = {
  type: "",
  brandId: "",
  brandName: "",
  modelId: "",
  modelName: "",
  color: "",
  serialImei: "",
  customerReportedIssue: "",
  unlockPassword: "",
  accessories: "",
  physicalCondition: "novo",
};

export const ResetServiceOrder: TServiceOrder = {
  id: "",
  code: "",
  customerId: "",
  openedByUserId: "",
  openedAt: "",
  closedByUserId: "",
  status: "open",
  isWarrantyInternal: false,
  warrantyDays: 90,
  totalAmount: 0,
  discountValue: 0,
  discountType: "",
  notes: "",
  cancelReason: "",
  warrantyOverrideReason: "",
  device: ResetServiceOrderDevice,
  payment: { paymentMethodId: "", paymentMethodName: "", numberOfInstallments: 1, paidByUserId: "" },
  laudo: { technicalReport: "", testsPerformed: "", repairStatus: "" },
  createdAt: "",
  updatedAt: "",
  store: "",
  company: "",
  customerName: "",
  customerPhone: "",
  customerEmail: "",
  priority: "baixa",
  model: ""
};

export const ResetServiceOrderItem: TServiceOrderItem = {
  id: "",
  serviceOrderId: "",
  itemType: "service",
  description: "",
  productId: "",
  isManual: true,
  quantity: 1,
  price: 0,
  cost: 0,
  total: 0,
  supplierId: "",
  supplierName: "",
  technicianId: "",
  technicianName: "",
  commission: 0,
  commissionType: "percent",
  createdAt: "",
  createdBy: "",
};

export const STATUS_LABELS: Record<string, { label: string; color: string }> = {
  open: { label: "Aberta", color: "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400" },
  analysis: { label: "Em Análise", color: "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400" },
  waiting_approval: { label: "Aguardando Aprovação", color: "bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400" },
  waiting_part: { label: "Aguardando Peça", color: "bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400" },
  in_repair: { label: "Em Reparo", color: "bg-indigo-100 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-400" },
  ready: { label: "Pronta p/ Retirada", color: "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400" },
  closed: { label: "Encerrada", color: "bg-gray-100 text-gray-600 dark:bg-gray-700/50 dark:text-gray-400" },
  cancelled: { label: "Cancelada", color: "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400" },
};

export type TServiceOrderSearch = {
  code: "",
  gte$openedAt: any;
  lte$openedAt: any;
  device: {
    serialImei: string;
    brandId: string;
    modelName: string;
  },
  status: string;
  customerId: string;
  customerName: string;
  store: string;
};

export const ResetServiceOrderSearch: TServiceOrderSearch = {
  code: "",
  gte$openedAt: null,
  lte$openedAt: null,
  device: {
    serialImei: "",
    brandId: "",
    modelName: ""
  },
  status: "",
  customerName: "",
  customerId: "",
  store: ""
};