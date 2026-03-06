import { Modal } from "@/components/ui/modal"
import { salesOrderIdAtom, salesOrderModalAtom, salesOrderModalStepAtom } from "@/jotai/commercial/sales-order/salesOrder.jotai";
import { loadingAtom } from "@/jotai/global/loading.jotai";
import { useAtom } from "jotai";
import { SalesOrderModalSeller } from "./SalesOrderModalSeller";
import { configApi, resolveResponse } from "@/service/config.service";
import { api } from "@/service/api.service";
import { useEffect, useState } from "react";
import ModalV2 from "@/components/ui/modalV2";
import { SalesOrderModalItems } from "./SalesOrderModalItems";
import { SalesOrderModalBox } from "./SalesOrderModalBox";
import { SalesOrderModalPayment } from "./SalesOrderModalPayment";
import { SalesOrderModalItemsView } from "./SalesOrderModalItemsView";

export const SalesOrderModal = () => {
    const [modalCreate, setModalCreate] = useAtom(salesOrderModalAtom);
    const [modalStep, setModalStep] = useAtom(salesOrderModalStepAtom);
    const [sizeModal, setSizeModal] = useState<"sm" | "md" | "lg" | "xl" | "2xl" | "full">("md");
    const [salesOrderId, setSalesOrderId] = useAtom(salesOrderIdAtom);
    const [_, setBoxOpened] = useState<boolean>(false);
    const [__, setModalBoxCreate] = useState<boolean>(false);

    const getBoxByCreatedBy = async () => {
        try {
            const {data} = await api.get(`/boxes/verify`, configApi());
            const result = data.result;

            setBoxOpened(false);
            setModalBoxCreate(false);
            if(result.data == null) {
                setModalBoxCreate(true);
                setModalStep("box");
                setSizeModal("md");
            } else {                
                const createdAt = result.data.createdAt; 
                const [year, month, day] = createdAt.split("T")[0].split("-");
                const dateCreated = new Date(Number(year), Number(month) - 1, Number(day));
                
                const toDay = new Date();
                toDay.setHours(0, 0, 0, 0);
                
                const isOpenedYesterday = dateCreated.getTime() < toDay.getTime();
                
                if (isOpenedYesterday) {
                    setBoxOpened(true);
                    setModalBoxCreate(true);
                    setModalStep("box");
                    setSizeModal("lg");
                } else {
                    if(!salesOrderId) {
                        setModalStep("seller");
                        setSizeModal("md");
                    } else {
                        setModalStep("items");
                        setSizeModal("2xl");
                    }
                }
            };
        } catch (error) {
            resolveResponse(error);
        }
    };

    const closed = () => {
        setModalCreate(false);
        setSizeModal("md");
        setSalesOrderId("");
    };

    useEffect(() => {
        if(!salesOrderId) {
            getBoxByCreatedBy();
        } else {
            getBoxByCreatedBy();
        }
    }, [modalCreate]);

    useEffect(() => {
        if(modalStep == "payment") {
            setSizeModal("lg");
        };

        if(modalStep == "items") {
            setSizeModal("2xl");
        };

        if(["seller", "box"].includes(modalStep)) {
            setSizeModal("md");
        };
    }, [modalStep]);

    return (
        <ModalV2 isOpen={modalCreate} onClose={closed} size={sizeModal} title={modalStep == "box" ? "Caixa" : "Pedido de Venda"}>
            <div className="p-6">
                {
                    modalStep == "seller" &&
                    <SalesOrderModalSeller />
                }
                {
                    modalStep == "box" &&
                    <SalesOrderModalBox />
                }
                {
                    modalStep == "items" &&
                    <SalesOrderModalItems />
                }
                {
                    modalStep == "payment" &&
                    <SalesOrderModalPayment />
                }
                {
                    modalStep == "itemsView" &&
                    <SalesOrderModalItemsView />
                }
            </div>
        </ModalV2>
    )
}