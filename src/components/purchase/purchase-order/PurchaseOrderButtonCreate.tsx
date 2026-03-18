"use client";

import Button from "@/components/ui/button/Button"
import { api } from "@/service/api.service";
import { configApi, resolveResponse } from "@/service/config.service";
import { useRouter } from "next/navigation";

export const PurchaseOrderButtonCreate = () => {
    const router = useRouter();  
    
    const create = async () => {
        try {
            const {data} = await api.post(`/purchase-orders`, {date: new Date()}, configApi());
            const result = data.result;
            router.push(`/purchase/purchase-order/${result.data.id}`)
        } catch (error) {
            resolveResponse(error);
        }
    };

    return (
        <Button onClick={create} type="submit" className="" size="sm">Adicionar</Button>
    )
}