import PageBreadcrumb from "@/components/pageBreadcrumb/PageBreadcrumb";
import ExchangeTable from "@/components/stock/exchanges/ExchangeTable";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Telemovvi | Trocas e Devoluções",
  description:
    "This is Next.js Form Elements page for TailAdmin - Next.js Tailwind CSS Admin Dashboard Template",
};

export default function Exchanges() {
  return (
    <div>
      <PageBreadcrumb pageIcon="MdAutorenew" pageTitle="Trocas e Devoluções" pageSubTitle="Estoque" />
      <div className="flex justify-end mb-2">
        {/* <Link href="exchanges/create">
          <Button type="submit" className="" size="sm">Adicionar</Button>
        </Link> */}
      </div>
      <ExchangeTable />
    </div>
  );
}