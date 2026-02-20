import PageBreadcrumb from "@/components/pageBreadcrumb/PageBreadcrumb";
import ServiceOrderTable from "@/components/pages/service-order/ServiceOrderTable";
import Button from "@/components/ui/button/Button";
import { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Telemovvi | Ordens de Serviço",
  description: "Gerenciamento de Ordens de Serviço",
};

export default function Manages() {
  return (
    <div>
      <PageBreadcrumb pageIcon="MdBuild" pageTitle="Gerencia O.S." pageSubTitle="Ordens de Serviços" />
      <div className="flex justify-end mb-3">
        <Link href="manages/create">
          <Button type="submit" size="sm">Adicionar</Button>
        </Link>
      </div>
      <ServiceOrderTable />
    </div>
  );
}
