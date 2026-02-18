import PageBreadcrumb from "@/components/pageBreadcrumb/PageBreadcrumb";
import DreReport from "@/components/pages/dre/DreReport";
import { Metadata } from "next";

export const metadata: Metadata = {
    title: "Telemovvi | DRE",
    description: "Demonstração do Resultado do Exercício",
};

export default function DrePage() {
    return (
        <div>
            <PageBreadcrumb pageIcon="MdAssessment" pageTitle="DRE - Demonstração de Resultados" pageSubTitle="Financeiro"/>
            <DreReport />
        </div>
    );
}