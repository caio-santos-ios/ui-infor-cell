import PageBreadcrumb from "@/components/common/PageBreadCrumb";
import CompanyTable from "@/components/master-data/company/CompanyTable";
import Button from "@/components/ui/button/Button";
import { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "ERP Mais | Empresas",
  description:
    "This is Next.js Form Elements page for TailAdmin - Next.js Tailwind CSS Admin Dashboard Template",
};

export default function Company() {
  return (
    <div>
      {/* <PageBreadcrumb pageTitle="Empresas" pageSubTitle="Cadastros" /> */}
      <div className="flex justify-end mb-2">
        <Link href="companies/create">
          <Button type="submit" className="" size="sm">Adicionar</Button>
        </Link>
      </div>
      <CompanyTable />
    </div>
  );
}