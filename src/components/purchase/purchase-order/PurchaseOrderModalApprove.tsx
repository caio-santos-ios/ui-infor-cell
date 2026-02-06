"use client";

import Button from "@/components/ui/button/Button"
import { Modal } from "@/components/ui/modal";
import { loadingAtom } from "@/jotai/global/loading.jotai";
import { purchaseOrderIdAtom, purchaseOrderModalAtom, purchaseOrderStatusAtom } from "@/jotai/purchaseOrder/purchaseOrder.jotai";
import { api } from "@/service/api.service";
import { configApi, resolveResponse } from "@/service/config.service";
import { useAtom } from "jotai";
import { GoAlert } from "react-icons/go";

export const PurchaseOrderModalApprove = () => {
    const [_, setLoading] = useAtom(loadingAtom);
    const [modal, setModal] = useAtom(purchaseOrderModalAtom);
    const [id, setId] = useAtom(purchaseOrderIdAtom);
    const [__, setStatus] = useAtom(purchaseOrderStatusAtom);

    const approval = async () => {
        try {
            setLoading(true);
            await api.put(`/purchase-orders/approval`, {id}, configApi());
            resolveResponse({status: 200, message: "Aprovado com sucesso"});
            setModal(false);
            setId("");
            setStatus("Finalizado")
        } catch (error) {
            resolveResponse(error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <Modal isOpen={modal} onClose={() => setModal(false)} className="max-w-[500px] m-4">
            <div className="no-scrollbar relative w-full max-w-[500px] overflow-y-auto rounded-3xl bg-white p-4 dark:bg-gray-900 lg:p-11">
                <div className="px-2 pr-14">
                    <h4 className="mb-2 text-2xl font-semibold text-gray-800 dark:text-white/90">Aprovar Pedido de Compra</h4>
                </div>

                <form className="flex flex-col">
                    <div className="custom-scrollbar h-[150px] overflow-y-auto px-2 pb-3">
                        <div className="mt-7">
                            <div className="grid grid-cols-1 gap-x-6 gap-y-5">
                                <div className="h-full flex col-span-1 justify-center items-center flex-col">
                                <GoAlert className="text-red-600" size={80} />
                                <h1 className="font-semibold text-lg text-gray-800 dark:text-white/90">Deseja aprovar o pedido de compra?</h1>
                                </div>
                            </div>
                        </div>
                    </div>
                    <div className="flex items-center gap-3 px-2 mt-6 lg:justify-end">
                        <Button size="sm" variant="outline" onClick={() => {
                            setModal(false);
                            setId("");
                        }}>Cancelar</Button>
                        <Button size="sm" variant="primary" onClick={approval}>Confirmar</Button>
                    </div>
                </form>
            </div>
        </Modal> 
    )
}