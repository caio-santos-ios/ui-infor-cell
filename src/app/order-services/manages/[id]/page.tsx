import PageBreadcrumb from "@/components/pageBreadcrumb/PageBreadcrumb";
import ServiceOrderForm from "@/components/pages/service-order/manage/ServiceOrderForm";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Telemovvi | Ordem de Serviço",
  description: "Cadastro de Ordem de Serviço",
};

export default async function ServiceOrderDetails({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  return (
    <div>
      <PageBreadcrumb
        pageIcon="MdBuild"
        pageTitle="Gerencia O.S."
        pageSubTitle="Ordens de Serviços"
      />
      <ServiceOrderForm id={id} />
    </div>
  );
}
