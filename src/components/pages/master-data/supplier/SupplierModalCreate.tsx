"use client";

import Label from "@/components/form/Label";
import Button from "@/components/ui/button/Button";
import { Modal } from "@/components/ui/modal";
import { supplierAtom, supplierModalCreateAtom } from "@/jotai/masterData/supplier.jotai";
import { api } from "@/service/api.service";
import { configApi, resolveResponse } from "@/service/config.service";
import { useAtom } from "jotai";
import { useState } from "react";
import { useForm } from "react-hook-form";

export default function SupplierModalCreate() {
    const [_, setLoading] = useState(false);
    const [modalCreate, setModalCreate] = useAtom(supplierModalCreateAtom);
    const [__, setSupplier] = useAtom(supplierAtom);

    const { register, getValues, reset } = useForm<{ name: string }>();

    const create = async () => {
        try {
            setLoading(true);
            const {data} = await api.post(`/suppliers/minimal`, {...getValues()}, configApi());
            const result = data.result;
            setSupplier(result.data);
            setModalCreate(false);
            resolveResponse({status: 201, message: result.message});
        } catch (error) {
            resolveResponse(error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <Modal isOpen={modalCreate} onClose={() => setModalCreate(false)} className={`m-4 w-[80dvw] max-w-160`}>
            <div className={`no-scrollbar relative overflow-y-auto rounded-3xl bg-white p-4 dark:bg-gray-900 lg:p-11`}>
                <div className="px-2 pr-14">
                    <h4 className="mb-2 text-2xl font-semibold text-gray-800 dark:text-white/90">Fornecedor</h4>
                </div>
        
                <form className="flex flex-col">
                    <div className={`max-h-[70dvh] custom-scrollbar overflow-y-auto px-2 pb-3`}>
                    <div className="grid grid-cols-6 gap-4">
                        <div className="col-span-6">
                            <Label title="Nome" />
                            <input maxLength={50} placeholder="Nome" {...register("name")} type="text" className="input-erp-primary input-erp-default"/>
                        </div>
                    </div>
                    </div>
                    
                    <div className="flex items-center gap-3 px-2 mt-6 lg:justify-end">
                        <Button size="sm" variant="outline" onClick={() => {
                            reset({name: ""});
                            setModalCreate(false);
                        }}>Cancelar</Button>
                        <Button size="sm" variant="primary" onClick={() => create()}>Adicionar</Button>
                    </div>
                </form>
            </div>
        </Modal> 
    );
}