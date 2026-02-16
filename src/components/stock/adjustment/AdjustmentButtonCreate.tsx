"use client";

import Button from "@/components/ui/button/Button";
import { adjustmentModalAtom } from "@/jotai/stock/adjustment";
import { useAtom } from "jotai";

export const AdjustmentButtonCreate = () => {
    const [_, setModal] = useAtom(adjustmentModalAtom);

    return (
        <Button onClick={() => setModal(true)} type="button" className="" size="sm">Adicionar</Button>
    )
}