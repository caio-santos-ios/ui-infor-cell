import PageBreadcrumb from "@/components/pageBreadcrumb/PageBreadcrumb";
import BrandTable from "@/components/product/brand/BrandTable";
import Button from "@/components/ui/button/Button";
import { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Telemovvi | Marcas",
  description:
    "This is Next.js Form Elements page for TailAdmin - Next.js Tailwind CSS Admin Dashboard Template",
};

export default function Brands() {
  return (
    <div>
      <PageBreadcrumb pageIcon="MdOutlineBrandingWatermark" pageTitle="Marcas" pageSubTitle="Gestão de Produtos" />
      <div className="flex justify-end mb-2">
        <Link href="brands/create">
          <Button type="submit" className="" size="sm">Adicionar</Button>
        </Link>
      </div>
      <BrandTable />
    </div>
  );
}