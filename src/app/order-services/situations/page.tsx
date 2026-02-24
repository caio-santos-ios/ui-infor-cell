import PageBreadcrumb from "@/components/pageBreadcrumb/PageBreadcrumb";
import { SituationButtonCreate } from "@/components/pages/service-order/situations/SituationButtonCreate";
import SituationTable from "@/components/pages/service-order/situations/SituationTable";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Telemovvi | Situações O.S.",
  description:
    "This is Next.js Form Elements page for TailAdmin - Next.js Tailwind CSS Admin Dashboard Template",
};

export default function Panel() {
  return (
    <div>
      <PageBreadcrumb pageIcon="MdOutlineDashboard" pageTitle="Situações O.S." pageSubTitle="Ordem de Serviço" />
      <div className="flex justify-end mb-2">
        <SituationButtonCreate />
      </div>
      <SituationTable />
    </div>
  );
}