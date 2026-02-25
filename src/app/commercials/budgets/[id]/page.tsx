import CompanyForm from "@/components/pages/master-data/company/CompanyForm";
import PageBreadcrumb from "@/components/pageBreadcrumb/PageBreadcrumb";
import Button from "@/components/ui/button/Button";
import { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Telemovvi | Orçamentos",
  description:
    "This is Next.js Form Elements page for TailAdmin - Next.js Tailwind CSS Admin Dashboard Template",
};

export default async function BudgetDetail({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  return (
    <div>
      <PageBreadcrumb pageIcon="RiFileList3Line" pageTitle="Orçamentos" pageSubTitle="Comercial" />
      <div className="flex justify-end mb-2">
        <Link href="/commercials/budgets">
          <Button type="submit" variant="outline" size="sm">Voltar</Button>
        </Link>
      </div>
      <CompanyForm id={id} />
    </div>
  );
}