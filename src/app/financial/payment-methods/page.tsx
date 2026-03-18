import PageBreadcrumb from "@/components/pageBreadcrumb/PageBreadcrumb";
import { PaymentMethodButtonCreate } from "@/components/pages/financial/payment-methods/PaymentMethodButtonCreate";
import PaymentMethodTable from "@/components/pages/financial/payment-methods/PaymentMethodTable";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Telemovvi | Formas de Pagamentos",
  description:
    "This is Next.js Form Elements page for TailAdmin - Next.js Tailwind CSS Admin Dashboard Template",
};

export default function SalesOrders() {
  return (
    <div>
      <PageBreadcrumb pageIcon="MdPayment" pageTitle="Formas de Pagamentos" pageSubTitle="Financeiro" />
      <div className="flex justify-end mb-2">
        <PaymentMethodButtonCreate />
      </div>
      <PaymentMethodTable />
    </div>
  );
}