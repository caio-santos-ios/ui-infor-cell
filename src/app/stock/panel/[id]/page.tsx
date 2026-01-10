import CompanyForm from "@/components/master-data/company/CompanyForm";
import PageBreadcrumb from "@/components/pageBreadcrumb/PageBreadcrumb";
import Button from "@/components/ui/button/Button";
import { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Telemovvi | Transferências",
  description:
    "This is Next.js Form Elements page for TailAdmin - Next.js Tailwind CSS Admin Dashboard Template",
};

export default async function PanelDetail({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  return (
    <div>
      <PageBreadcrumb pageIcon="FaExchangeAlt" pageTitle="Transferências" pageSubTitle="Estoque" />
      <div className="flex justify-end mb-2">
        <Link href="/stock/panel">
          <Button type="submit" variant="outline" size="sm">Voltar</Button>
        </Link>
      </div>
      <CompanyForm id={id} />
    </div>
  );
}