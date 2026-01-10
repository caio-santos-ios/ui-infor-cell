import PageBreadcrumb from "@/components/pageBreadcrumb/PageBreadcrumb";
import ModelForm from "@/components/product/model/ModelForm";
import Button from "@/components/ui/button/Button";
import { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Telemovvi | Modelos",
  description:
    "This is Next.js Form Elements page for TailAdmin - Next.js Tailwind CSS Admin Dashboard Template",
};

export default async function ModelDetail({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  return (
    <div>
      <PageBreadcrumb pageIcon="MdOutlineViewQuilt" pageTitle="Modelos" pageSubTitle="Gestão de Produtos" />
      <div className="flex justify-end mb-2">
        <Link href="/product/models">
          <Button type="submit" variant="outline" size="sm">Voltar</Button>
        </Link>
      </div>
      <ModelForm id={id} />
    </div>
  );
}