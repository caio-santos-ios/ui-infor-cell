import PageBreadcrumb from "@/components/pageBreadcrumb/PageBreadcrumb";
import AccountPage from "@/components/pages/settings/account/AccountPage";
import { Metadata } from "next";

export const metadata: Metadata = {
    title: "Telemovvi | Minha Conta",
    description: "Gerencie seu perfil, plano e informações da instalação",
};

export default function Account() {
    return (
        <div>
            <PageBreadcrumb pageIcon="MdPerson" pageTitle="Minha Conta" pageSubTitle="Configurações" />
            <AccountPage />
        </div>
    );
}