"use client";

import ModalV2 from "@/components/ui/modalV2";
import { budgetIdAtom, budgetModalAtom, budgetModalStepAtom } from "@/jotai/commercial/budget/budget.jotai";
import { useAtom } from "jotai";
import { useEffect, useState } from "react";
import { BudgetModalSeller } from "./BudgetModalSeller";
import { BudgetModalItems } from "./BudgetModalItems";

export const BudgetModal = () => {
    const [modalCreate, setModalCreate] = useAtom(budgetModalAtom);
    const [modalStep, setModalStep] = useAtom(budgetModalStepAtom);
    const [sizeModal, setSizeModal] = useState<"sm" | "md" | "lg" | "xl" | "2xl" | "full">("md");
    const [budgetId, setBudgetId] = useAtom(budgetIdAtom);

    const closed = () => {
        setModalCreate(false);
        setSizeModal("md");
        setBudgetId("");
    };

    useEffect(() => {
        if (!budgetId) {
            setModalStep("seller");
            setSizeModal("md");
        } else {
            setModalStep("items");
            setSizeModal("2xl");
        }
    }, [modalCreate]);

    useEffect(() => {
        if (modalStep === "items") {
            setSizeModal("2xl");
        }
        if (modalStep === "seller") {
            setSizeModal("md");
        }
    }, [modalStep]);

    return (
        <ModalV2 isOpen={modalCreate} onClose={closed} size={sizeModal} title="Orçamento">
            <div className="p-6">
                {modalStep === "seller" && <BudgetModalSeller />}
                {modalStep === "items" && <BudgetModalItems />}
            </div>
        </ModalV2>
    );
};
