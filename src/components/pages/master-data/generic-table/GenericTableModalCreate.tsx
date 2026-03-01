"use client";

import Label from "@/components/form/Label";
import Button from "@/components/ui/button/Button";
import { Modal } from "@/components/ui/modal";
import { genericTableModalCreateAtom, genericTableTableAtom } from "@/jotai/masterData/genericTable.jotai";
import { api } from "@/service/api.service";
import { configApi, resolveResponse } from "@/service/config.service";
import { ResetGenericTable, TGenericTable } from "@/types/master-data/generic-table/generic-table.type";
import { useAtom } from "jotai";
import { use, useEffect, useState } from "react";
import { useForm } from "react-hook-form";

export const GenericTableModalCreate = () => {
    const [_, setLoading] = useState(false);
    const [modal, setModal] = useAtom(genericTableModalCreateAtom);
    const [table, setTable] = useAtom(genericTableTableAtom);
    // const [tables, setTables] = useState<TGenericTable[]>([]);

    const { getValues, register, reset, watch } = useForm<TGenericTable>({
        defaultValues: ResetGenericTable
    });

    const getGenericTable = async () => {
        try {
            setLoading(true);
            await api.get(`/generic-tables/table/${table}`, configApi());
        } catch (error) {
            resolveResponse(error);
        } finally {
            setLoading(false);
        }
    };

    const create = async () => {
        try {
            setLoading(true);
            const {data} = await api.post(`/generic-tables`, {...getValues(), codeAutomatic: true, table}, configApi());
            resolveResponse({status: 201, message: data.message});
            closed();
        } catch (error) {
            resolveResponse(error);
        } finally {
            setLoading(false);
        }
    };

    const closed = () => {
        setModal(false);
        reset();
    };

    // useEffect(() => {
    //     if(modal && table) getGenericTable();
    // }, [modal]);

    return (
        modal && (
            <Modal isOpen={modal} onClose={closed} className={`m-4 w-[80dvw] max-w-160 bg-red-400`}>
                <div className={`no-scrollbar relative overflow-y-auto rounded-3xl bg-white p-4 dark:bg-gray-900 lg:p-11`}>
                    <div className="px-2 pr-14">
                        <h4 className="mb-2 text-2xl font-semibold text-gray-800 dark:text-white/90">Novo</h4>
                    </div>

                    <form className="flex flex-col">
                        <div className={`max-h-[70dvh] custom-scrollbar overflow-y-auto px-2 pb-3`}>
                            <div className="grid grid-cols-6 gap-4">
                                <div className="col-span-6 lg:col-span-5">
                                    <Label title="Descrição" />
                                    <input maxLength={50} placeholder="Descrição" {...register("description")} type="text" className="input-erp-primary input-erp-default"/>
                                </div>
                                <div className="col-span-1">
                                    <div className="flex items-end justify-end h-full">
                                        {
                                            watch("id") ? (
                                                <Button className="h-11" size="sm" variant="primary" onClick={create}>Salvar</Button>
                                            ) : (
                                                <Button className="h-11" size="sm" variant="primary" onClick={create}>Adicionar</Button>
                                            )
                                        }
                                    </div>
                                </div>
                            </div>
                        </div>
                        
                        <div className="flex items-center gap-3 px-2 mt-6 lg:justify-end">
                            <Button size="sm" variant="outline" onClick={closed}>Cancelar</Button>
                        </div>
                    </form>
                </div>
            </Modal>
        )
    );
};