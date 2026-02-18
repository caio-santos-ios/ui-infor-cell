import PageBreadcrumb from "@/components/pageBreadcrumb/PageBreadcrumb";
import ChartOfAccountsForm from "@/components/pages/chart-of-accounts/ChartOfAccountsFormProps";
import { Metadata } from "next";

export const metadata: Metadata = {
    title: "Telemovvi | Nova Conta",
    description: "Adicionar conta ao Plano de Contas",
};

export default function ChartOfAccountsNewPage() {
    return (
        <div>
            <PageBreadcrumb pageIcon="MdAccountTree" pageTitle="Nova Conta" pageSubTitle="Plano de Contas" />
            <ChartOfAccountsForm />
        </div>
    );
}