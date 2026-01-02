import CorfirmAccountForm from "@/components/auth/CorfirmAccountForm";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "ERP MAIS | Confirmar Conta",
  description: "This is Next.js Signin Page TailAdmin Dashboard Template",
};

export default function ConfirmAccount() {
  return (
    <div className="h-dvh w-dvw flex justify-center items-center">
      <CorfirmAccountForm />
    </div>
  ) 
}