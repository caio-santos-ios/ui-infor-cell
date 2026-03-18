"use client";

import Button from "@/components/ui/button/Button"
import { variationModalAtom } from "@/jotai/product/variation/variation.jotai";
import { useAtom } from "jotai";

export default function VariationButtonCreate() {
    const [_, setModal] = useAtom(variationModalAtom);

    return (
        <Button onClick={() => setModal(true)} type="submit" className="" size="sm">Adicionar</Button>
    )
}