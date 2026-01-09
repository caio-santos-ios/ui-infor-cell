import EmployeeTable from "@/components/master-data/employee/EmployeeTable";
import PageBreadcrumb from "@/components/pageBreadcrumb/PageBreadcrumb";
import Button from "@/components/ui/button/Button";
import { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Telemovvi | Profissionais",
  description:
    "This is Next.js Form Elements page for TailAdmin - Next.js Tailwind CSS Admin Dashboard Template",
};

export default function Employee() {
  return (
    <div>
      <PageBreadcrumb pageIcon="HiOutlineUserGroup" pageTitle="Profissionais" pageSubTitle="Cadastros" />
      <div className="flex justify-end mb-2">
        <Link href="employees/create">
          <Button type="submit" className="" size="sm">Adicionar</Button>
        </Link>
      </div>
      <EmployeeTable />
    </div>
  );
}