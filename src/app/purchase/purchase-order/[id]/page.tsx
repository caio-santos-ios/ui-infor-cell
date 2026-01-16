import PageBreadcrumb from "@/components/pageBreadcrumb/PageBreadcrumb";
import Button from "@/components/ui/button/Button";
import { Metadata } from "next";
import Link from "next/link";
import PurchaseOrderForm from "@/components/purchase/purchase-order/PurchaseOrderForm";

export const metadata: Metadata = {
  title: "Telemovvi | Pedidos de Compra",
  description:
    "This is Next.js Form Elements page for TailAdmin - Next.js Tailwind CSS Admin Dashboard Template",
};

export default async function PurchaseOrderDetail({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  return (
    <div>
      <PageBreadcrumb pageIcon="MdOutlineShoppingCart" pageTitle="Pedidos de Compra" pageSubTitle="Compras" />
      <div className="flex justify-end mb-2">
        <Link href="/purchase/purchase-order">
          <Button type="submit" variant="outline" size="sm">Voltar</Button>
        </Link>
      </div>
      <PurchaseOrderForm id={id} />
    </div>
  );
}