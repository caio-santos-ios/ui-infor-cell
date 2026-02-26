"use client";

import Autocomplete from "@/components/form/Autocomplete";
import Label from "@/components/form/Label";
import Button from "@/components/ui/button/Button";
import { Modal } from "@/components/ui/modal";
import { paginationAtom } from "@/jotai/global/pagination.jotai";
import { serviceOrderIdAtom, serviceOrderModalViewAtom, serviceOrderSearchAtom } from "@/jotai/serviceOrder/manege.jotai";
import { api } from "@/service/api.service";
import { configApi, resolveParamsRequest, resolveResponse } from "@/service/config.service";
import { TStore } from "@/types/master-data/store/store.type";
import { ResetServiceOrderSearch, TServiceOrder, TServiceOrderItem, TServiceOrderSearch } from "@/types/order-service/order-service.type";
import { formattedMoney } from "@/utils/mask.util";
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

export default function ServiceOrderModalView() {
    const [_, setLoading] = useState(false);
    const [modalView, setModalView] = useAtom(serviceOrderModalViewAtom);
    const [serviceOrderId, setServiceOrderId] = useAtom(serviceOrderIdAtom);
    const [items, setItems] = useState<TServiceOrderItem[]>([]);
    const [customers] = useState<any[]>([]);
    const [brands, setBrands] = useState<any[]>([]);

    const { register, setValue, reset, watch } = useForm<TServiceOrder>();

    const fetchItems = async () => {
        try {
            setLoading(true);
            const { data } = await api.get(`/serviceOrderItems?deleted=false&serviceOrderId=${serviceOrderId}&pageSize=50&pageNumber=1`, configApi());
            const result = data.result;
            setItems(result.data || []);
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

    const getById = async (id: string) => {
        try {
            setLoading(true);
            const { data } = await api.get(`/serviceOrders/${id}`, configApi());
            const result = data.result.data;
            reset(result);
        } catch (error) {
            resolveResponse(error);
        } finally {
            setLoading(false);
        }
    };


    useEffect(() => {
        getById(serviceOrderId);
        fetchItems();
    }, [modalView]);

    return (
        <Modal isOpen={modalView} onClose={() => {
            setModalView(false);
        }} className={`m-4 w-[80dvw] max-w-200`}>
            <div className={`no-scrollbar relative overflow-y-auto rounded-3xl bg-white p-4 dark:bg-gray-900 lg:p-11`}>
                <div className="px-2 pr-14">
                    <h4 className="mb-2 text-2xl font-semibold text-gray-800 dark:text-white/90">Detalhes da O.S. - {watch("code")}</h4>
                </div>
        
                <form className="flex flex-col">
                    <div className={`max-h-[70dvh] custom-scrollbar overflow-y-auto px-2 pb-3`}>
                        <div className="grid grid-cols-6 gap-4">
                            {items.length > 0 && (
                                <div className="col-span-6 mt-2 rounded-xl border border-gray-200 dark:border-white/5 overflow-hidden mb-4">
                                    <table className="w-full text-sm">
                                    <thead className="bg-gray-50 dark:bg-white/3">
                                        <tr>
                                        {["Tipo", "Descrição", "Qtd", "Valor Unit.", "Total", "Técnico"].map((h) => (
                                            <th key={h} className="px-4 py-3 text-left font-medium text-gray-500 dark:text-gray-400 text-xs">{h}</th>
                                        ))}
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-100 dark:divide-white/5">
                                        {items.map((item) => (
                                        <tr key={item.id} className="hover:bg-gray-50 dark:hover:bg-white/3">
                                            <td className="px-4 py-3">
                                            <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${item.itemType === "service" ? "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400" : "bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400"}`}>
                                                {item.itemType === "service" ? "Serviço" : "Peça"}
                                            </span>
                                            </td>
                                            <td className="px-4 py-3 text-gray-700 dark:text-gray-300">{item.description}</td>
                                            <td className="px-4 py-3 text-gray-600 dark:text-gray-400">{item.quantity}</td>
                                            <td className="px-4 py-3 text-gray-600 dark:text-gray-400">{formattedMoney(item.price)}</td>
                                            <td className="px-4 py-3 font-medium text-gray-800 dark:text-white/90">{formattedMoney(item.quantity * item.price)}</td>
                                            <td className="px-4 py-3 text-gray-600 dark:text-gray-400">{item.technicianName}</td>
                                        </tr>
                                        ))}
                                    </tbody>
                                    </table>
                                </div>
                                )}
                            <div className="col-span-6 md:col-span-2">
                                <Label title="Situação" required={false}/>
                                <input disabled placeholder="Digite" {...register("statusName")} type="text" className="input-erp-primary input-erp-default"/>
                            </div>                            
                            <div className="col-span-6 md:col-span-4">
                                <Label title="IMEI" required={false}/>
                                <input disabled placeholder="Digite" {...register("device.serialImei")} type="text" className="input-erp-primary input-erp-default"/>
                            </div>        
                            <div className="col-span-6">
                                <Label title="Cliente" required={false}/>
                                <Autocomplete disabled placeholder="Buscar cliente..." defaultValue={watch("customerName")} objKey="id" objValue="tradeName" onSearch={(value: string) => {}} onSelect={(opt) => {
                                    setValue("customerId", opt.id);
                                }} options={customers}/>
                            </div>
                            <div className="col-span-12 xl:col-span-3">
                                <Label title="Marca" required={false}/>
                                <select disabled value={watch("device.brandId")} className="h-11 w-full appearance-none rounded-lg border border-gray-300 bg-transparent px-4 py-2.5 pr-11 text-sm dark:border-gray-700 dark:bg-gray-900 dark:text-white/90 text-gray-800">
                                    <option value="">Selecione</option>
                                    {brands.map((b: any) => <option key={b.id} value={b.id} className="dark:bg-gray-900">{b.name}</option>)}
                                </select>
                            </div>
                            <div className="col-span-12 xl:col-span-3">
                                <Label title="Modelo" required={false} />
                                <input disabled {...register("device.modelName")} placeholder="Digite" type="text" className="input-erp-primary input-erp-default" />
                            </div>                           
                        </div>
                    </div>
                    
                    <div className="flex items-center gap-3 px-2 mt-6 lg:justify-end">
                        <Button size="sm" variant="outline" onClick={() => {
                            reset(ResetServiceOrderSearch);
                            setModalView(false);
                            setServiceOrderId("");
                        }}>Fechar</Button>
                    </div>
                </form>
            </div>
        </Modal> 
    );
}