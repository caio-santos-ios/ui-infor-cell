import PageBreadcrumb from "@/components/common/PageBreadCrumb";
import CompanyTable from "@/components/master-data/company/CompanyTable";
import CompanyForm from "@/components/master-data/company/CompanyForm";
import Button from "@/components/ui/button/Button";
import { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "ERP Mais | Empresas",
  description:
    "This is Next.js Form Elements page for TailAdmin - Next.js Tailwind CSS Admin Dashboard Template",
};

export default async function CompanyDetail({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  return (
    <div>
      <PageBreadcrumb pageTitle="Empresas" pageSubTitle="Cadastros" />
      <div className="flex justify-end mb-2">
        <Link href="/master-data/companies">
          <Button type="submit" variant="outline" size="sm">Voltar</Button>
        </Link>
      </div>
      <CompanyForm id={id} />
    </div>
  );
}