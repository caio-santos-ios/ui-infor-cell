"use client";
import Button from "@/components/ui/button/Button";
import { useRouter } from "next/navigation";

export function ChartOfAccountsButtonCreate() {
  const router = useRouter();

  const handleClick = () => {
    router.push("/financial/chart-of-accounts/new");
  };

  return (
    <Button size="sm" variant="primary" onClick={handleClick}>Adicionar</Button>
  );
}