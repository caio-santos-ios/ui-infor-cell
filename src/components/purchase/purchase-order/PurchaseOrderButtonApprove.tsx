"use client";

import Button from "@/components/ui/button/Button"
import { purchaseOrderIdAtom, purchaseOrderModalAtom, purchaseOrderStatusAtom } from "@/jotai/purchaseOrder/purchaseOrder.jotai";
import { purchaseOrderItemsAtom } from "@/jotai/purchaseOrder/purchaseOrderItem.jotai";
import { useAtom } from "jotai";

export const PurchaseOrderButtonApprove = () => {
    const [_, setModal] = useAtom(purchaseOrderModalAtom);
    const [status] = useAtom(purchaseOrderStatusAtom);
    const [items] = useAtom(purchaseOrderItemsAtom);

    return (
        <>
            {
                status == "Rascunho" && items.length > 0 &&
                <Button onClick={() => setModal(true)} type="submit" className="" size="sm">Aprovar</Button>
            }
        </>
    )
}