import PageBreadcrumb from "@/components/pageBreadcrumb/PageBreadcrumb";
import StockPositionTable from "@/components/stock/stock-position/StockPositionTable";
import Button from "@/components/ui/button/Button";
import { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Telemovvi | Posição de Estoque",
  description:
    "This is Next.js Form Elements page for TailAdmin - Next.js Tailwind CSS Admin Dashboard Template",
};

export default function StockPosition() {
  return (
    <div>
      <PageBreadcrumb pageIcon="FaBoxes" pageTitle="Posição de Estoque" pageSubTitle="Estoque" />
      <div className="flex justify-end mb-2">
        <Link href="stock-position/create">
          <Button type="submit" className="" size="sm">Adicionar</Button>
        </Link>
      </div>
      <StockPositionTable />
    </div>
  );
}