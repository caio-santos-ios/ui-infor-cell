import PageBreadcrumb from "@/components/pageBreadcrumb/PageBreadcrumb";
import FiscalConfigForm from "@/components/pages/settings/fiscal/FiscalConfigForm";
import { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
    title: "Telemovvi | Configuração Fiscal",
    description: "Configuração do módulo fiscal NF-e / NFC-e",
};

export default async function FiscalConfigPage({ params }: { params: Promise<{ storeId: string }> }) {
    const { storeId } = await params;

    return (
        <div>
            <PageBreadcrumb pageIcon="MdReceiptLong" pageTitle="Configuração Fiscal" pageSubTitle="Configurações" />
            <FiscalConfigForm storeId={storeId} />
        </div>
    );
}