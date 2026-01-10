import CompanyTable from "@/components/master-data/company/CompanyTable";
import PageBreadcrumb from "@/components/pageBreadcrumb/PageBreadcrumb";
import Button from "@/components/ui/button/Button";
import { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Telemovvi | Produtos",
  description:
    "This is Next.js Form Elements page for TailAdmin - Next.js Tailwind CSS Admin Dashboard Template",
};

export default function Products() {
  return (
    <div>
      <PageBreadcrumb pageIcon="MdOutlineInventory" pageTitle="Produtos" pageSubTitle="Gestão de Produtos" />
      <div className="flex justify-end mb-2">
        <Link href="products/create">
          <Button type="submit" className="" size="sm">Adicionar</Button>
        </Link>
      </div>
      <CompanyTable />
    </div>
  );
}