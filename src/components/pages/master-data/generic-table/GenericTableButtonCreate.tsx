"use client";

import Button from "@/components/ui/button/Button"
import { genericTableModalCreateAtom } from "@/jotai/masterData/genericTable.jotai";
import { useAtom } from "jotai";

type TProp = {
    children?: React.ReactNode;
};

export const GenericTableButtonCreate = ({children}: TProp) => {
    const [_, setModal] = useAtom(genericTableModalCreateAtom);

    return (
        <Button onClick={() => setModal(true)} type="submit" className="" size="sm">{children}</Button>
    )
}