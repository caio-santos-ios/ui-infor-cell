import PageBreadcrumb from "@/components/pageBreadcrumb/PageBreadcrumb";
import { AdjustmentButtonCreate } from "@/components/stock/adjustment/AdjustmentButtonCreate";
import AdjustmentTable from "@/components/stock/adjustment/AdjustmentTable";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Telemovvi | Ajustes",
  description:
    "This is Next.js Form Elements page for TailAdmin - Next.js Tailwind CSS Admin Dashboard Template",
};

export default function Exchanges() {
  return (
    <div>
      <PageBreadcrumb pageIcon="FaTools" pageTitle="Ajustes" pageSubTitle="Estoque" />
      <div className="flex justify-end mb-2">
        <AdjustmentButtonCreate />
      </div>
      <AdjustmentTable />
    </div>
  );
}