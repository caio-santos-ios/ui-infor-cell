"use client";

import Autocomplete from "@/components/form/Autocomplete";
import Label from "@/components/form/Label";
import VariationForm from "@/components/product/product/VariationForm";
import VariationsForm from "@/components/product/product/VariationsForm";
import Button from "@/components/ui/button/Button";
import { Modal } from "@/components/ui/modal";
import { salesOrderCodeAtom } from "@/jotai/commercial/sales-order/salesOrder.jotai";
import { salesOrderItemIdAtom } from "@/jotai/commercial/sales-order/salesOrderItem.jotai";
import { loadingAtom } from "@/jotai/global/loading.jotai";
import { productAtom } from "@/jotai/product/product.jotai";
import { exchangeModalAtom } from "@/jotai/stock/exchange/exchange.jotai";
import { api } from "@/service/api.service";
import { configApi, resolveResponse } from "@/service/config.service";
import { TSerial } from "@/types/product/serial/serial.type";
import { ResetExchange, TExchange } from "@/types/stock/exchange/exchange.type";
import { useAtom } from "jotai";
import { useEffect, useState } from "react";
import { Controller, useForm } from "react-hook-form";
import { NumericFormat } from "react-number-format";
import { toast } from "react-toastify";

export const ExchangeModal = () => {
    const [_, setIsLoading] = useAtom(loadingAtom);
    const [modal, setModal] = useAtom(exchangeModalAtom);
    const [product, setProduct] = useAtom(productAtom);
    const [products, setProducts] = useState<any[]>([]);
    const [hasSerial, setHasSerial] = useState<boolean>(false);
    const [hasVariations, setHasVariations] = useState<boolean>(false);
    const [salesOrderCode] = useAtom(salesOrderCodeAtom);
    const [salesOrderItemId] = useAtom(salesOrderItemIdAtom);

    const { register, setValue, getValues, reset, watch, control } = useForm<TExchange>({
        defaultValues: ResetExchange
    });

    const confirm = async (body: any) => {
        if(watch("cost") == 0) return toast.warn("Custo é obrigatório", {theme: 'colored'});
        if(hasSerial && !watch("serial")) return toast.warn("Serial é obrigatório", {theme: 'colored'});
        
        if(hasVariations && hasSerial) {
            body.variations[0].serials = [{
                code: watch("serial"),
                cost: watch("cost"),
                price: 0,
                hasAvailable: watch("forSale") == "yes"
            }];
        };

        const form = {...getValues(), ...body};
        form.origin = `sales-order`;
        form.originDescription = `Troca no PV - nº ${salesOrderCode}`;
        form.salesOrderItemId = salesOrderItemId;

        if(!form.id) {
            await create(form);
        } else {
            await update(form);
        };
    };

    const create = async (body: any) => {
        try {
            setIsLoading(true);
            const {data} = await api.post(`/exchanges`, body, configApi());
            const result = data.result;
            resolveResponse({status: 201, message: result.message});
            setModal(false);
        } catch (error) {
            resolveResponse(error);
        } finally {
            setIsLoading(false);
        }
    };

    const update = async (body: any) => {
        try {
            setIsLoading(true);
            const {data} = await api.put(`/exchanges`, body, configApi());
            const result = data.result;
            resolveResponse({status: 201, message: result.message});
            setModal(false);
        } catch (error) {
            resolveResponse(error);
        } finally {
            setIsLoading(false);
        }
    };

    const getBySalesOrderItemId = async (salesOrderItemId: string) => {
        try {
            const {data} = await api.get(`/exchanges/sales-orders-items/${salesOrderItemId}`, configApi());
            const result = data.result;
            if(result.data.length > 0) {
                reset(result.data[0]);
                console.log(result.data[0].id)
                if(result.data[0].variations.length > 0) {
                    const variation = result.data[0].variations[0];

                    if(variation.serials.length > 0) {
                        const serial: TSerial = variation.serials[0];
                        setValue("serial", serial.code);
                        setValue("cost", serial.cost);
                    };
                };
            } else {
                reset(ResetExchange);
            }
        } catch (error) {
            resolveResponse(error);
        }
    };

    const getAutocompleProduct = async (value: string) => {
        try {
            if(!value) return setProducts([]);
        
            const {data} = await api.get(`/products/autocomplete?deleted=false&orderBy=name&sort=desc&pageSize=10&pageNumber=1&regex$or$name=${value}&regex$or$code=${value}`, configApi());
            const result = data.result;
            setProducts(result.data);
        } catch (error) {
            resolveResponse(error);
        }
    };

    useEffect(() => {
        const initial = async () => {
            if(product) {
                setValue("cost", product.averageCost);
            }

            if(salesOrderItemId) {
                getBySalesOrderItemId(salesOrderItemId)
            };
        };
        initial();
    }, [modal]);

    return (
        <Modal isOpen={modal} onClose={() => setModal(false)} className="w-[80dvw] max-w-240 m-4">
            <div className="no-scrollbar relative overflow-y-auto rounded-3xl bg-white p-4 dark:bg-gray-900 lg:p-11">
                <div className="px-2 pr-14">
                    <h4 className="mb-2 text-2xl font-semibold text-gray-800 dark:text-white/90">Troca de Produto</h4>
                </div>

                <form className="flex flex-col">
                    <div className="custom-scrollbar max-h-[calc(100dvh-15rem)] overflow-y-auto px-2 pb-3">
                        <div className="grid grid-cols-9 gap-4">
                            <div className="col-span-9">
                                <Label title="Produto" />
                                <Autocomplete defaultValue={watch("productName")} objKey="id" objValue="productName" onSearch={(value: string) => getAutocompleProduct(value)} onSelect={(opt) => { 
                                    console.log(opt)
                                    setValue("productId", opt.id);
                                    setHasSerial(opt.hasSerial == "yes");
                                    setHasVariations(opt.hasVariations == "yes");
                                }} options={products}/>
                            </div>

                            <div className="col-span-9 xl:col-span-3">
                                <Label title="Custo" />
                                <Controller
                                    name="cost"
                                    control={control}
                                    defaultValue={0}
                                    render={({ field: { onChange, value } }) => (
                                        <NumericFormat
                                        className="input-erp-primary input-erp-default" 
                                        value={value}
                                        onValueChange={(values) => {
                                            const val = values.floatValue ?? 0;
                                            onChange(val);
                                        }}
                                        thousandSeparator="."
                                        decimalSeparator=","
                                        prefix="R$ "
                                        decimalScale={2}
                                        fixedDecimalScale
                                        allowNegative={false}
                                        placeholder="Custo"
                                        />
                                    )}
                                />
                            </div>

                            <div className="col-span-9 xl:col-span-2">
                                <Label title="Pronto pra venda?" />
                                <select {...register("forSale")} className="h-11 w-full appearance-none rounded-lg border border-gray-300 bg-transparent px-4 py-2.5 pr-11 text-sm shadow-theme-xs placeholder:text-gray-400 focus:border-brand-300 focus:outline-hidden focus:ring-3 focus:ring-brand-500/10 dark:border-gray-700 dark:bg-gray-900 dark:text-white/90 dark:placeholder:text-white/30 dark:focus:border-brand-800 text-gray-800 dark:bg-dark-900">
                                    <option value="yes" className="text-gray-700 dark:bg-gray-900 dark:text-gray-400">Sim</option>
                                    <option value="no" className="text-gray-700 dark:bg-gray-900 dark:text-gray-400">Não</option>
                                </select>
                            </div>
                            
                            {
                                hasSerial &&
                                <div className="col-span-9 lg:col-span-4">
                                    <Label title="Serial" />
                                    <input {...register("serial")} maxLength={50} placeholder="Digite" type="text" className="input-erp-primary input-erp-default"/>
                                </div>
                            }
                            {
                                hasVariations &&
                                <div className="col-span-9">
                                    <VariationsForm variations={watch("variations")} variationsCode={watch("variationsCode")} productId="" sendBody={(body) => {
                                        confirm(body);
                                    }} btnAdd={false} btnDelete={false} btnEdit={false} btnSave={true} lineDefault={1} qtdStock={1} stockDisabled={true} typeBtnSave="button"/>
                                </div>
                            }
                            {
                                !hasVariations &&
                                <div className="col-span-9">
                                    <Button className="me-2" size="sm" variant="outline" onClick={() => {
                                        setModal(true);
                                    }}>Cancelar</Button>
                                    <Button size="sm" variant="primary" onClick={() => confirm({...getValues()})}>Salvar</Button>
                                </div>
                            }
                        </div>
                    </div>
                </form>
            </div>
        </Modal>
    )
}