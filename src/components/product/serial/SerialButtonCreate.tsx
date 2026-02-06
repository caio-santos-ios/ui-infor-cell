"use client";

import Button from "@/components/ui/button/Button"
import { paymentMethodModalAtom } from "@/jotai/financial/payment-methods/paymentMethod.jotai";
import { useAtom } from "jotai";

export const PaymentMethodButtonCreate = () => {
    const [_, setModal] = useAtom(paymentMethodModalAtom);

    return (
        <Button onClick={() => setModal(true)} type="submit" className="" size="sm">Adicionar</Button>
    )
}