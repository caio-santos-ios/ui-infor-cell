"use client";

import Button from "@/components/ui/button/Button";
import { budgetModalAtom } from "@/jotai/commercial/budget/budget.jotai";
import { useAtom } from "jotai";

export const BudgetButtonCreate = () => {
    const [_, setModal] = useAtom(budgetModalAtom);

    return (
        <Button onClick={() => setModal(true)} type="submit" size="sm">Adicionar</Button>
    );
};
