import StoreForm from "@/components/master-data/store/StoreForm";
import PageBreadcrumb from "@/components/pageBreadcrumb/PageBreadcrumb";
import Button from "@/components/ui/button/Button";
import { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "ERP Mais | Lojas",
  description:
    "This is Next.js Form Elements page for TailAdmin - Next.js Tailwind CSS Admin Dashboard Template",
};

export default async function StoreDetail({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  return (
    <div>
      <PageBreadcrumb pageTitle="Lojas" pageSubTitle="Cadastros" />
      <div className="flex justify-end mb-2">
        <Link href="/master-data/stores">
          <Button type="submit" variant="outline" size="sm">Voltar</Button>
        </Link>
      </div>
      <StoreForm id={id} />
    </div>
  );
}