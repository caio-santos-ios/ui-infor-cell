import PageBreadcrumb from "@/components/pageBreadcrumb/PageBreadcrumb";
import { ChartOfAccountsButtonCreate } from "@/components/pages/chart-of-accounts/ChartOfAccountsButtonCreate";
import ChartOfAccountsTable from "@/components/pages/chart-of-accounts/ChartOfAccountsTable";
import { Metadata } from "next";

export const metadata: Metadata = {
    title: "Telemovvi | Plano de Contas",
    description: "Gestão do Plano de Contas",
};

export default function ChartOfAccountsPage() {
    return (
        <div>
            <PageBreadcrumb pageIcon="MdAccountTree" pageTitle="Plano de Contas" pageSubTitle="Financeiro"/>
            <div className="flex justify-end mb-2">
                <ChartOfAccountsButtonCreate />
            </div>
            <ChartOfAccountsTable />
        </div>
    );
}