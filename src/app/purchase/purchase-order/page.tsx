import PageBreadcrumb from "@/components/pageBreadcrumb/PageBreadcrumb";
import PurchaseOrderTable from "@/components/purchase/purchase-order/PurchaseOrderTable";
import Button from "@/components/ui/button/Button";
import { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Telemovvi | Pedidos de Compra",
  description:
    "This is Next.js Form Elements page for TailAdmin - Next.js Tailwind CSS Admin Dashboard Template",
};

export default function PurchaseOrder() {
  return (
    <div>
      <PageBreadcrumb pageIcon="MdOutlineShoppingCart" pageTitle="Pedidos de Compra" pageSubTitle="Compras" />
      <div className="flex justify-end mb-2">
        <Link href="purchase-order/create">
          <Button type="submit" className="" size="sm">Adicionar</Button>
        </Link>
      </div>
      <PurchaseOrderTable />
    </div>
  );
}