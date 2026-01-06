import StoreTable from "@/components/master-data/store/StoreTable";
import PageBreadcrumb from "@/components/pageBreadcrumb/PageBreadcrumb";
import Button from "@/components/ui/button/Button";
import { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "ERP Mais | Usuários",
  description:
    "This is Next.js Form Elements page for TailAdmin - Next.js Tailwind CSS Admin Dashboard Template",
};

export default function User() {
  return (
    <div>
      <PageBreadcrumb pageTitle="Usuários" pageSubTitle="Cadastros" />
      <div className="flex justify-end mb-2">
        <Link href="stores/create">
          <Button type="submit" className="" size="sm">Adicionar</Button>
        </Link>
      </div>
      <StoreTable />
    </div>
  );
}