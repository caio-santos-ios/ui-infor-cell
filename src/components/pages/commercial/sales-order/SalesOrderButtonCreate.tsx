"use client";

import Button from "@/components/ui/button/Button"
import { salesOrderModalAtom } from "@/jotai/commercial/sales-order/salesOrder.jotai";
import { useAtom } from "jotai";

export const SalesOrderButtonCreate = () => {
    const [_, setModal] = useAtom(salesOrderModalAtom);

    return (
        <Button onClick={() => setModal(true)} type="submit" className="" size="sm">Adicionar</Button>
    )
}