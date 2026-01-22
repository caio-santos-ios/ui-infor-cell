import PageBreadcrumb from "@/components/pageBreadcrumb/PageBreadcrumb";
import VariationForm from "@/components/product/Variation/VariationForm";
import Button from "@/components/ui/button/Button";
import { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Telemovvi | Variações",
  description:
    "This is Next.js Form Elements page for TailAdmin - Next.js Tailwind CSS Admin Dashboard Template",
};

export default async function VariationsDetail({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  return (
    <div>
      <PageBreadcrumb pageIcon="MdCallSplit" pageTitle="Variações" pageSubTitle="Gestão de Produtos" />
      <div className="flex justify-end mb-2">
        <Link href="/product/variations">
          <Button type="submit" variant="outline" size="sm">Voltar</Button>
        </Link>
      </div>
      <VariationForm id={id} />
    </div>
  );
}