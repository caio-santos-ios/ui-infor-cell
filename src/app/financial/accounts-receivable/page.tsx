import PageBreadcrumb from "@/components/pageBreadcrumb/PageBreadcrumb";
import { AccountReceivableButtonCreate } from "@/components/pages/financial/accounts-receivable/AccountReceivableButtonCreate";
import AccountReceivableTable from "@/components/pages/financial/accounts-receivable/AccountReceivableTable";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Telemovvi | Contas a Receber",
  description: "Gestão de contas a receber",
};

export default function AccountsReceivablePage() {
  return (
    <div>
      <PageBreadcrumb pageIcon="MdAttachMoney" pageTitle="Contas a Receber" pageSubTitle="Financeiro" />
      <div className="flex justify-end mb-2">
        <AccountReceivableButtonCreate />
      </div>
      <AccountReceivableTable />
    </div>
  );
}
