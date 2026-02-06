import PageBreadcrumb from "@/components/pageBreadcrumb/PageBreadcrumb";
import { SalesOrderButtonCreate } from "@/components/pages/commercial/sales-order/SalesOrderButtonCreate";
import SalesOrderTable from "@/components/pages/commercial/sales-order/SalesOrderTable";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Telemovvi | Pedidos de Venda",
  description:
    "This is Next.js Form Elements page for TailAdmin - Next.js Tailwind CSS Admin Dashboard Template",
};

export default function SalesOrders() {
  return (
    <div>
      <PageBreadcrumb pageIcon="FaFileInvoice" pageTitle="Pedidos de Venda" pageSubTitle="Comercial" />
      <div className="flex justify-end mb-2">
        <SalesOrderButtonCreate />
      </div>
      <SalesOrderTable />
    </div>
  );
}