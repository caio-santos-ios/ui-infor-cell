"use client";

import Label from "@/components/form/Label";
import Button from "@/components/ui/button/Button";
import { Modal } from "@/components/ui/modal";
import { customerAtom, customerModalCreateAtom } from "@/jotai/masterData/customer.jotai";
import { api } from "@/service/api.service";
import { configApi, resolveResponse } from "@/service/config.service";
import { ResetCustomer, TCustomer } from "@/types/master-data/customer/customer.type";
import { maskCNPJ, maskCPF, maskPhone } from "@/utils/mask.util";
import { useAtom } from "jotai";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";

export default function CustomerModalCreate() {
    const [_, setLoading] = useState(false);
    const [modalCreate, setModalCreate] = useAtom(customerModalCreateAtom);
    const [customer, setCustomer] = useAtom(customerAtom);

    const { register, getValues, reset, watch } = useForm<TCustomer>();

    const create = async () => {
        try {
            setLoading(true);
            const {data} = await api.post(`/customers/minimal`, {...getValues()}, configApi());
            const result = data.result;
            setCustomer(result.data);
            setModalCreate(false);
            resolveResponse({status: 201, message: result.message});
        } catch (error) {
            resolveResponse(error);
        } finally {
            setLoading(false);
        }
    };

    const update = async () => {
        try {
            setLoading(true);
            const {data} = await api.put(`/customers`, {...getValues()}, configApi());
            const result = data.result;
            setCustomer(result.data);
            setModalCreate(false);
            resolveResponse({status: 200, message: result.message});
        } catch (error) {
            resolveResponse(error);
        } finally {
            setLoading(false);
        }
    };

    const getById = async (id: string) => {
        try {
            setLoading(true);
            const {data} = await api.get(`/customers/${id}`, configApi());
            const result = data.result.data;
            reset(result);
        } catch (error) {
            resolveResponse(error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if(modalCreate) {
            reset(ResetCustomer);
            
            if(customer.id) {
                getById(customer.id);
            };
        };
    }, [modalCreate])

    return (
        <Modal isOpen={modalCreate} onClose={() => setModalCreate(false)} className={`m-4 w-[80dvw] max-w-160`}>
            <div className={`no-scrollbar relative overflow-y-auto rounded-3xl bg-white p-4 dark:bg-gray-900 lg:p-11`}>
                <div className="px-2 pr-14">
                    <h4 className="mb-2 text-2xl font-semibold text-gray-800 dark:text-white/90">Cliente</h4>
                </div>
        
                <form className="flex flex-col">
                    <div className={`max-h-[70dvh] custom-scrollbar overflow-y-auto px-2 pb-3`}>
                        <div className="grid grid-cols-6 gap-4">
                            <div className="col-span-6 lg:col-span-2">
                                <Label title="Tipo"/>
                                <select {...register("type")} className="h-11 w-full appearance-none rounded-lg border border-gray-300 bg-transparent px-4 py-2.5 pr-11 text-sm shadow-theme-xs placeholder:text-gray-400 focus:border-brand-300 focus:outline-hidden focus:ring-3 focus:ring-brand-500/10 dark:border-gray-700 dark:bg-gray-900 dark:text-white/90 dark:placeholder:text-white/30 dark:focus:border-brand-800 text-gray-800 dark:bg-dark-900">
                                    <option value="F" className="text-gray-700 dark:bg-gray-900 dark:text-gray-400">Pessoa Fisica</option>
                                    <option value="J" className="text-gray-700 dark:bg-gray-900 dark:text-gray-400">Pessoa Juridica</option>
                                </select>
                            </div>  

                            <div className="col-span-6 lg:col-span-4">
                                <Label title={`${watch("type") == "F" ? "Nome" : "Razão Social"}`}/>
                                <input placeholder={`${watch("type") == "F" ? "Nome" : "Razão Social"}`} {...register("corporateName")} type="text" className="input-erp-primary input-erp-default"/>
                            </div>

                            {
                                watch("type") == "J" &&
                                <div className="col-span-6">
                                    <Label title="Nome Fantasia" required={false}/>
                                    <input placeholder="Nome Fantasia" {...register("tradeName")} type="text" className="input-erp-primary input-erp-default"/>
                                </div>
                            }

                            {
                                watch("type") == "J" ?
                                <div className="col-span-6 lg:col-span-3">
                                    <Label title="CNPJ" required={false}/>
                                    <input placeholder="CNPJ" onInput={(e: React.ChangeEvent<HTMLInputElement>) => maskCNPJ(e)} {...register("document")} type="text" className="input-erp-primary input-erp-default"/>
                                </div>
                                :
                                <div className="col-span-6 lg:col-span-3">
                                    <Label title="CPF" required={false}/>
                                    <input placeholder="CPF" onInput={(e: React.ChangeEvent<HTMLInputElement>) => maskCPF(e)} {...register("document")} type="text" className="input-erp-primary input-erp-default"/>
                                </div>
                            }

                            <div className="col-span-6 lg:col-span-3">
                                <Label title="Telefone" required={false}/>
                                <input placeholder="Telefone" onInput={(e: React.ChangeEvent<HTMLInputElement>) => maskPhone(e)} {...register("phone")} type="text" className="input-erp-primary input-erp-default"/>
                            </div>
                            
                            <div className="col-span-6">
                                <Label title="E-mail" required={false}/>
                                <input placeholder="E-mail" {...register("email")} type="email" className="input-erp-primary input-erp-default"/>
                            </div>          
                        </div>
                    </div>
                    
                    <div className="flex items-center gap-3 px-2 mt-6 lg:justify-end">
                        <Button size="sm" variant="outline" onClick={() => {
                            reset(ResetCustomer);
                            setModalCreate(false);
                        }}>Cancelar</Button>
                        {
                            customer.id ? 
                            (
                                <Button size="sm" variant="primary" onClick={() => update()}>Salvar</Button>
                            ) :
                            (
                                <Button size="sm" variant="primary" onClick={() => create()}>Adicionar</Button>
                            )
                        }
                    </div>
                </form>
            </div>
        </Modal> 
    );
}