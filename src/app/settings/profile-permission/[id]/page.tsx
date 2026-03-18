import EmployeeForm from "@/components/pages/master-data/employee/EmployeeForm";
import PageBreadcrumb from "@/components/pageBreadcrumb/PageBreadcrumb";
import ProfilePermissionTableForm from "@/components/settings/profile-permission/ProfilePermissionForm";
import Button from "@/components/ui/button/Button";
import { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Telemovvi | Perfil de Usuário",
  description:
    "This is Next.js Form Elements page for TailAdmin - Next.js Tailwind CSS Admin Dashboard Template",
};

export default async function ProfilePermissionDetail({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  return (
    <div>
      <PageBreadcrumb pageIcon="MdAdminPanelSettings" pageTitle="Perfil de Usuário" pageSubTitle="Configurações" />
      <div className="flex justify-end mb-2">
        <Link href="/settings/profile-permission">
          <Button type="submit" variant="outline" size="sm">Voltar</Button>
        </Link>
      </div>
      <ProfilePermissionTableForm id={id} />
    </div>
  );
}