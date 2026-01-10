import CompanyTable from "@/components/master-data/company/CompanyTable";
import PageBreadcrumb from "@/components/pageBreadcrumb/PageBreadcrumb";
import Button from "@/components/ui/button/Button";
import { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Telemovvi | Orçamentos",
  description:
    "This is Next.js Form Elements page for TailAdmin - Next.js Tailwind CSS Admin Dashboard Template",
};

export default function Budgets() {
  return (
    <div>
      <PageBreadcrumb pageIcon="RiFileList3Line" pageTitle="Orçamentos" pageSubTitle="Comercial" />
      <div className="flex justify-end mb-2">
        <Link href="budgets/create">
          <Button type="submit" className="" size="sm">Adicionar</Button>
        </Link>
      </div>
      <CompanyTable />
    </div>
  );
}