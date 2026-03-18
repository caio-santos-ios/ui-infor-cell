import CustomerTable from "@/components/pages/master-data/customer/CustomerTable";
import PageBreadcrumb from "@/components/pageBreadcrumb/PageBreadcrumb";
import Button from "@/components/ui/button/Button";
import { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Telemovvi | Clientes",
  description:
    "This is Next.js Form Elements page for TailAdmin - Next.js Tailwind CSS Admin Dashboard Template",
};

export default function Employee() {
  return (
    <div>
      <PageBreadcrumb pageIcon="MdPeople" pageTitle="Clientes" pageSubTitle="Cadastros" />
      <div className="flex justify-end mb-2">
        <Link href="customers/create">
          <Button type="submit" className="" size="sm">Adicionar</Button>
        </Link>
      </div>
      <CustomerTable />
    </div>
  );
}