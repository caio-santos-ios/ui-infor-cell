import PageBreadcrumb from "@/components/pageBreadcrumb/PageBreadcrumb";
import ModelTable from "@/components/product/model/ModelTable";
import Button from "@/components/ui/button/Button";
import { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Telemovvi | Grupos de Produtos",
  description:
    "This is Next.js Form Elements page for TailAdmin - Next.js Tailwind CSS Admin Dashboard Template",
};

export default function Models() {
  return (
    <div>
      <PageBreadcrumb pageIcon="RiFolderListLine" pageTitle="Grupos de Produtos" pageSubTitle="Gestão de Produtos" />
      <div className="flex justify-end mb-2">
        <Link href="models/create">
          <Button type="submit" className="" size="sm">Adicionar</Button>
        </Link>
      </div>
      <ModelTable />
    </div>
  );
}