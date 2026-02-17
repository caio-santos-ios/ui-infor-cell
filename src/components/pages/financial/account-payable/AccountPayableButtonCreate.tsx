"use client";

import Button from "@/components/ui/button/Button";
import { accountPayableModalAtom } from "@/jotai/financial/account-payable/accountPayable.jotai";
import { useAtom } from "jotai";

export const AccountPayableButtonCreate = () => {
    const [_, setModal] = useAtom(accountPayableModalAtom);

    return (
        <Button onClick={() => setModal(true)} type="button" size="sm">
            Adicionar
        </Button>
    );
};
