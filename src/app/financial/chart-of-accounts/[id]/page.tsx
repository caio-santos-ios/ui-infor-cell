import PageBreadcrumb from "@/components/pageBreadcrumb/PageBreadcrumb";
import ChartOfAccountsForm from "@/components/pages/financial/chart-of-accounts/ChartOfAccountsFormProps";
import Button from "@/components/ui/button/Button";
import { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
    title: "Telemovvi | Plano de Contas",
    description: "Gestão do Plano de Contas",
};

export default async function ChartOfAccountsNewPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = await params;

    return (
        <div>
            <PageBreadcrumb pageIcon="MdAccountTree" pageTitle="Plano de Contas" pageSubTitle="Financeiro" />
            <ChartOfAccountsForm id={id} />
        </div>
    );
}