"use client";

import Button from "@/components/ui/button/Button"
import { situationModalAtom } from "@/jotai/serviceOrder/situation.jotai";
import { useAtom } from "jotai";

export const SituationButtonCreate = () => {
    const [_, setModal] = useAtom(situationModalAtom);

    return (
        <Button onClick={() => setModal(true)} type="submit" className="" size="sm">Adicionar</Button>
    )
}