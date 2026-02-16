import PageBreadcrumb from "@/components/pageBreadcrumb/PageBreadcrumb";
import VariationButtonCreate from "@/components/product/variation/VariationButtonCreate";
// import { VariationButtonCreate } from "@/components/product/Variation/VariationButtonCreate";
import VariationTable from "@/components/product/variation/VariationTable";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Telemovvi | Variações",
  description:
    "This is Next.js Form Elements page for TailAdmin - Next.js Tailwind CSS Admin Dashboard Template",
};

export default function Variation() {
  return (
    <div>
      <PageBreadcrumb pageIcon="MdCallSplit" pageTitle="Variações" pageSubTitle="Gestão de Produtos" />
      <div className="flex justify-end mb-2">
        <VariationButtonCreate />
      </div>
      <VariationTable />
    </div>
  );
}