"use client";
import Button from "@/components/ui/button/Button";
import { chartOfAccountModalAtom } from "@/jotai/financial/chart-of-account.jotai";
import { useAtom } from "jotai";

export function ChartOfAccountsButtonCreate() {
  const [_, setModal] = useAtom(chartOfAccountModalAtom);

  return (
    <Button onClick={() => setModal(true)} type="submit" size="sm">Adicionar</Button>
  );
}