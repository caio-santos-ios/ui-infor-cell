import CompanyTable from "@/components/master-data/company/CompanyTable";
import PageBreadcrumb from "@/components/pageBreadcrumb/PageBreadcrumb";
import Button from "@/components/ui/button/Button";
import { Metadata } from "next";
import Link from "next/link";

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
        <Link href="sales-orders/create">
          <Button type="submit" className="" size="sm">Adicionar</Button>
        </Link>
      </div>
      <CompanyTable />
    </div>
  );
}