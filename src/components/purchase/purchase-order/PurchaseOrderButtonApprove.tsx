"use client";

import Button from "@/components/ui/button/Button"
import { purchaseOrderIdAtom, purchaseOrderModalAtom, purchaseOrderStatusAtom } from "@/jotai/purchaseOrder/purchaseOrder.jotai";
import { useAtom } from "jotai";

export const PurchaseOrderButtonApprove = () => {
    const [_, setModal] = useAtom(purchaseOrderModalAtom);
    const [status] = useAtom(purchaseOrderStatusAtom);

    return (
        <>
            {
                status == "Rascunho" &&
                <Button onClick={() => setModal(true)} type="submit" className="" size="sm">Aprovar</Button>
            }
        </>
    )
}