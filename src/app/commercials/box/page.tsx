import PageBreadcrumb from "@/components/pageBreadcrumb/PageBreadcrumb";
import BoxTable from "@/components/pages/commercial/box/BoxTable";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Telemovvi | Caixas",
  description:
    "This is Next.js Form Elements page for TailAdmin - Next.js Tailwind CSS Admin Dashboard Template",
};

export default function SalesOrders() {
  return (
    <div>
      <PageBreadcrumb pageIcon="MdPointOfSale" pageTitle="Caixas" pageSubTitle="Comercial" />
      <div className="flex justify-end mb-2">
        {/* <SalesOrderButtonCreate /> */}
      </div>
      <BoxTable />
    </div>
  );
}