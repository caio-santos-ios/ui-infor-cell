"use client";

import Autocomplete from "@/components/form/Autocomplete";
import Label from "@/components/form/Label";
import Button from "@/components/ui/button/Button";
import { Modal } from "@/components/ui/modal";
import { paginationAtom } from "@/jotai/global/pagination.jotai";
import { serviceOrderModalSearchAtom, serviceOrderSearchAtom } from "@/jotai/serviceOrder/manege.jotai";
import { api } from "@/service/api.service";
import { configApi, resolveParamsRequest, resolveResponse } from "@/service/config.service";
import { TStore } from "@/types/master-data/store/store.type";
import { ResetServiceOrderSearch, TServiceOrderSearch } from "@/types/order-service/order-service.type";
import { useAtom } from "jotai";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";

const statusOptions = [
    { value: "", label: "Todos os status" },
    { value: "open", label: "Aberta" },
    { value: "analysis", label: "Em Análise" },
    { value: "waiting_approval", label: "Aguardando Aprovação" },
    { value: "waiting_part", label: "Aguardando Peça" },
    { value: "in_repair", label: "Em Reparo" },
    { value: "ready", label: "Pronta p/ Retirada" },
    { value: "closed", label: "Encerrada" },
    { value: "cancelled", label: "Cancelada" },
];

export default function ServiceOrderModalSearch() {
    const [_, setLoading] = useState(false);
    const [modalSearch, setModalSearch] = useAtom(serviceOrderModalSearchAtom);
    const [__, setPagination] = useAtom(paginationAtom);
    const [___, setSearch] = useAtom(serviceOrderSearchAtom);
    const [customers, setCustomers] = useState<any[]>([]);
    const [stores, setStore] = useState<TStore[]>([]);
    const [brands, setBrands] = useState<any[]>([]);

    const { register, getValues, setValue, reset, watch } = useForm<TServiceOrderSearch>();

    const getAll = async (page: number) => {
        try {
            const filter = resolveParamsRequest({...getValues()});

            const { data } = await api.get(`/serviceOrders?deleted=false${filter}&orderBy=createdAt&sort=desc&pageSize=10&pageNumber=${page}`, configApi());
            const result = data.result;
            
            setPagination({
                currentPage: result.currentPage,
                data: result.data,
                sizePage: result.pageSize,
                totalPages: result.totalPages,
                totalCount: result.totalCount,
            });

            setModalSearch(false);
            setSearch(true);
        } catch (error) {
            resolveResponse(error);
        } finally {
            setLoading(false);
        }
    };

    const getAutocompleCustomer = async (value: string) => {
        try {
        if(!value) return setCustomers([]);
        const {data} = await api.get(`/customers?deleted=false&orderBy=tradeName&sort=desc&pageSize=10&pageNumber=1&regex$or$tradeName=${value}&regex$or$corporateName=${value}&regex$or$document=${value}&regex$or$phone=${value}`, configApi());
        const result = data.result;
        setCustomers(result.data);
        } catch (error) {
        resolveResponse(error);
        }
    };

    const getSelectStore = async () => {
        try {
            setLoading(true);
            const {data} = await api.get(`/stores/select?deleted=false`, configApi());
            const result = data.result.data;
            setStore(result);
        } catch (error) {
            resolveResponse(error);
        } finally {
            setLoading(false);
        }
    };

    const fetchBrands = async () => {
        try {
            const { data } = await api.get("/brands?deleted=false&pageSize=100&pageNumber=1", configApi());
            setBrands(data.result.data || []);
        } catch {}
    };
    
    useEffect(() => { fetchBrands(); }, []);

    useEffect(() => {
        getSelectStore();

        if(watch("customerId")) {
            const customer = customers.find((c) => c.id === watch("customerId"));
            if(customer) {
                setValue("customerName", customer.tradeName);
            };
        };
    }, [modalSearch]);

    return (
        <Modal isOpen={modalSearch} onClose={() => {
            setModalSearch(false);
        }} className={`m-4 w-[80dvw] max-w-160`}>
            <div className={`no-scrollbar relative overflow-y-auto rounded-3xl bg-white p-4 dark:bg-gray-900 lg:p-11`}>
                <div className="px-2 pr-14">
                    <h4 className="mb-2 text-2xl font-semibold text-gray-800 dark:text-white/90">Filtros O.S</h4>
                </div>
        
                <form className="flex flex-col">
                    <div className={`max-h-[70dvh] custom-scrollbar overflow-y-auto px-2 pb-3`}>
                        <div className="grid grid-cols-6 gap-4">
                            <div className="col-span-6 md:col-span-4">
                                <Label title="Loja" required={false}/>
                                <select {...register("store")} className="h-11 w-full appearance-none rounded-lg border border-gray-300 bg-transparent px-4 py-2.5 pr-11 text-sm shadow-theme-xs placeholder:text-gray-400 focus:border-brand-300 focus:outline-hidden focus:ring-3 focus:ring-brand-500/10 dark:border-gray-700 dark:bg-gray-900 dark:text-white/90 dark:placeholder:text-white/30 dark:focus:border-brand-800 text-gray-800 dark:bg-dark-900">
                                    <option value="" className="text-gray-700 dark:bg-gray-900 dark:text-gray-400">Todas</option>
                                    {stores.map((s) => (
                                        <option key={s.id} value={s.tradeName} className="text-gray-700 dark:bg-gray-900 dark:text-gray-400">{s.tradeName}</option>
                                    ))}
                                </select>
                            </div>

                            <div className="col-span-6 md:col-span-2">
                                <Label title="Data de Abertura" required={false}/>
                                <input placeholder="Data de Abertura" type="date" className="input-erp-primary input-erp-default"/>
                            </div>
                            
                            <div className="col-span-6 md:col-span-4">
                                <Label title="IMEI" required={false}/>
                                <input placeholder="Digite" {...register("device.serialImei")} type="text" className="input-erp-primary input-erp-default"/>
                            </div>

                            <div className="col-span-6 md:col-span-2">
                                <Label title="Nº O.S" required={false}/>
                                <input maxLength={6} placeholder="Digite" {...register("code")} type="text" className="input-erp-primary input-erp-default"/>
                            </div>
        
                            <div className="col-span-6">
                                <Label title="Cliente" required={false}/>
                                <Autocomplete placeholder="Buscar cliente..." defaultValue={watch("customerName")} objKey="id" objValue="tradeName" onSearch={(value: string) => getAutocompleCustomer(value)} onSelect={(opt) => {
                                    setValue("customerId", opt.id);
                                }} options={customers}/>
                            </div>

                            <div className="col-span-12 xl:col-span-3">
                                <Label title="Marca" required={false}/>
                                <select value={watch("device.brandId")} className="h-11 w-full appearance-none rounded-lg border border-gray-300 bg-transparent px-4 py-2.5 pr-11 text-sm dark:border-gray-700 dark:bg-gray-900 dark:text-white/90 text-gray-800">
                                    <option value="">Selecione</option>
                                    {brands.map((b: any) => <option key={b.id} value={b.id} className="dark:bg-gray-900">{b.name}</option>)}
                                </select>
                            </div>

                            <div className="col-span-12 xl:col-span-3">
                                <Label title="Modelo" required={false} />
                                <input {...register("device.modelName")} placeholder="Digite" type="text" className="input-erp-primary input-erp-default" />
                            </div>
                            
                            <div className="col-span-6 md:col-span-3">
                                <Label title="Status" required={false}/>
                                <select {...register("status")} className="h-11 w-full appearance-none rounded-lg border border-gray-300 bg-transparent px-4 py-2.5 pr-11 text-sm shadow-theme-xs placeholder:text-gray-400 focus:border-brand-300 focus:outline-hidden focus:ring-3 focus:ring-brand-500/10 dark:border-gray-700 dark:bg-gray-900 dark:text-white/90 dark:placeholder:text-white/30 dark:focus:border-brand-800 text-gray-800 dark:bg-dark-900">
                                    <option value="" className="text-gray-700 dark:bg-gray-900 dark:text-gray-400">Todos</option>
                                    {statusOptions.map((o) => (
                                        <option key={o.value} value={o.value} className="text-gray-700 dark:bg-gray-900 dark:text-gray-400">{o.label}</option>
                                    ))}
                                </select>
                            </div>
                        </div>
                    </div>
                    
                    <div className="flex items-center gap-3 px-2 mt-6 lg:justify-end">
                        <Button size="sm" variant="outline" onClick={() => {
                            reset(ResetServiceOrderSearch);
                            setModalSearch(false);
                            setSearch(false);
                            getAll(1);
                        }}>Limpar Filtros</Button>
                        <Button size="sm" variant="primary" onClick={() => getAll(1)}>Buscar</Button>
                    </div>
                </form>
            </div>
        </Modal> 
    );
}