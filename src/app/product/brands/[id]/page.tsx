import PageBreadcrumb from "@/components/pageBreadcrumb/PageBreadcrumb";
import BrandForm from "@/components/product/brand/BrandForm";
import Button from "@/components/ui/button/Button";
import { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Telemovvi | Marcas",
  description:
    "This is Next.js Form Elements page for TailAdmin - Next.js Tailwind CSS Admin Dashboard Template",
};

export default async function BrandDetail({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  return (
    <div>
      <PageBreadcrumb pageIcon="MdOutlineBrandingWatermark" pageTitle="Marcas" pageSubTitle="Gestão de Produtos" />
      <div className="flex justify-end mb-2">
        <Link href="/product/brands">
          <Button type="submit" variant="outline" size="sm">Voltar</Button>
        </Link>
      </div>
      <BrandForm id={id} />
    </div>
  );
}