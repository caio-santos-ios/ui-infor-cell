import PageBreadcrumb from "@/components/pageBreadcrumb/PageBreadcrumb";
import TransferTable from "@/components/stock/transfer/TransferTable";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Telemovvi | Histórico Transferências",
  description:
    "This is Next.js Form Elements page for TailAdmin - Next.js Tailwind CSS Admin Dashboard Template",
};

export default function Panel() {
  return (
    <div>
      <PageBreadcrumb pageIcon="FaExchangeAlt" pageTitle="Histórico Transferências" pageSubTitle="Estoque" />
      <TransferTable />
    </div>
  );
}