import CompanyTable from "@/components/master-data/company/CompanyTable";
import PageBreadcrumb from "@/components/pageBreadcrumb/PageBreadcrumb";
import Button from "@/components/ui/button/Button";
import { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Telemovvi | Gerência",
  description:
    "This is Next.js Form Elements page for TailAdmin - Next.js Tailwind CSS Admin Dashboard Template",
};

export default function Manages() {
  return (
    <div>
      <PageBreadcrumb pageIcon="MdOutlineManageAccounts" pageTitle="Gerência" pageSubTitle="Ordem de Serviço" />
      <div className="flex justify-end mb-2">
        <Link href="manages/create">
          <Button type="submit" className="" size="sm">Adicionar</Button>
        </Link>
      </div>
      <CompanyTable />
    </div>
  );
}