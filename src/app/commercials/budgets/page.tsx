import PageBreadcrumb from "@/components/pageBreadcrumb/PageBreadcrumb";
import { Metadata } from "next";
import BudgetTable from "@/components/pages/commercial/budget/BudgetTable";
import { BudgetButtonCreate } from "@/components/pages/commercial/budget/BudgetButtonCreate";

export const metadata: Metadata = {
    title: "Telemovvi | Orçamentos",
    description: "Gestão de Orçamentos",
};

export default function Budgets() {
    return (
        <div>
            <PageBreadcrumb pageIcon="RiFileList3Line" pageTitle="Orçamentos" pageSubTitle="Comercial" />
            <div className="flex justify-end mb-2">
                <BudgetButtonCreate />
            </div>
            <BudgetTable />
        </div>
    );
}
