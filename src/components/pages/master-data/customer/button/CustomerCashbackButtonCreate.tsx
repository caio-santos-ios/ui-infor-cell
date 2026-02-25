"use client";

import Button from "@/components/ui/button/Button"
import { customerCashbackModalCreateAtom } from "@/jotai/masterData/customerCashback.jotai";
import { useAtom } from "jotai";

export const CustomerCashbackButtonCreate = () => {
    const [_, setModal] = useAtom(customerCashbackModalCreateAtom);

    return (
        <Button onClick={() => setModal(true)} type="submit" className="" size="sm">Adicionar</Button>
    )
}