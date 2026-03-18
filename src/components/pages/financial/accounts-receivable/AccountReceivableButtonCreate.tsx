"use client";

import Button from "@/components/ui/button/Button";
import { accountReceivableModalAtom } from "@/jotai/financial/accounts-receivable/accountsReceivable.jotai";
import { useAtom } from "jotai";

export const AccountReceivableButtonCreate = () => {
    const [_, setModal] = useAtom(accountReceivableModalAtom);

    return (
        <Button onClick={() => setModal(true)} type="submit" size="sm">Adicionar</Button>
    );
};
