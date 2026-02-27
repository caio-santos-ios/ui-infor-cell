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
import { adjustmentIdAtom, adjustmentModalAtom } from "@/jotai/stock/adjustment";
import { exchangeModalAtom } from "@/jotai/stock/exchange.jotai";
import { api } from "@/service/api.service";
import { configApi, resolveResponse } from "@/service/config.service";
import { TSerial } from "@/types/product/serial/serial.type";
import { ResetAdjustment, TAdjustment } from "@/types/stock/adjustment/adjustment.type";
import { useAtom } from "jotai";
import { useEffect, useState } from "react";
import { Controller, useForm } from "react-hook-form";
import { NumericFormat } from "react-number-format";
import { toast } from "react-toastify";

export const AdjustmentModal = () => {
    const [_, setIsLoading] = useAtom(loadingAtom);
    const [modal, setModal] = useAtom(adjustmentModalAtom);
    const [adjuntmentId, setAdjuntmentId] = useAtom(adjustmentIdAtom);
    const [stocks, setStock] = useState<any[]>([]);
    const [quantity, setQuantity] = useState<string[]>([]);
    const [products, setProducts] = useState<any[]>([]);

    
    const { register, setValue, getValues, reset, watch, control } = useForm<TAdjustment>({
        defaultValues: ResetAdjustment
    });

    const isVariation = watch("hasProductVariations") == "yes";

    const confirm = async (body: any) => {        
        if(body.hasProductVariations == "yes" || body.hasProductSerial == "yes") {
            if(body.hasProductSerial == "yes") {
                let cost = 0;
                let price = 0;
                let totalSerials = 0;

                body.variations.forEach((v: any) => {
                    body.quantity += v.stock;
                    cost += v.serials.reduce((value: number, serial: any) => value + parseFloat(serial.cost), 0);
                    price += v.serials.reduce((value: number, serial: any) => value + parseFloat(serial.price), 0);
                    totalSerials += v.serials.length;
                });

                body.cost = cost / totalSerials;
                body.price = price / totalSerials;
            } else {
                const codes = quantity.filter((_, index) => index < parseFloat(body.code));
                body.codes = codes;
                body.quantity = body.variations.reduce((acc: number, item: any) => acc + item.stock, 0);
            };
        };

        const form = {...getValues(), ...body};
        form.origin = `adjustment`;
        await create(form);
    };

    const create = async (body: any) => {
        try {
            setIsLoading(true);
            const {data} = await api.post(`/adjustments`, body, configApi());
            const result = data.result;
            resolveResponse({status: 201, message: result.message});
            setAdjuntmentId("");
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
            const {data} = await api.put(`/adjustments`, body, configApi());
            const result = data.result;
            resolveResponse({status: 201, message: result.message});
            setAdjuntmentId("");
            setModal(false);
        } catch (error) {
            resolveResponse(error);
        } finally {
            setIsLoading(false);
        }
    };

    const getById = async (id: string) => {
        try {
            const {data} = await api.get(`/adjustments/${id}`, configApi());
            const result = data.result;
            reset(result.data);
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

    const close = () => {
        reset(ResetAdjustment);
        setModal(false);
        setAdjuntmentId("");
    };

    useEffect(() => {
        if(watch("codeVariation")) {
            const variation = stocks.find((_, index) => index.toString() == watch("codeVariation"));
            if(variation) {
                setQuantity(variation.codes);
            };
        };
    }, [watch("codeVariation")]);

    useEffect(() => {
        const initial = async () => {
            reset(ResetAdjustment);

            if(adjuntmentId) {
                getById(adjuntmentId);
            };
        };
        initial();
    }, [modal]);

    return (
        <Modal isOpen={modal} onClose={close} className={`w-[90dvw] ${isVariation ? 'max-w-7xl' : 'max-w-180'} m-4`}>
            <div className="no-scrollbar relative overflow-y-auto rounded-3xl bg-white p-4 dark:bg-gray-900 lg:p-11">
                <div className="mb-8 px-2 pr-14">
                    <h4 className="mb-2 text-2xl font-semibold text-gray-800 dark:text-white/90">Ajustes</h4>
                </div>

                <div className="custom-scrollbar max-h-[calc(100dvh-15rem)] min-h-52 overflow-y-auto px-2 pb-3">
                    <div className="grid grid-cols-12 gap-4">
                        <div className="col-span-12 md:col-span-4">
                            <Label title="Movimentação" />
                            <select {...register("type")} className="h-11 w-full appearance-none rounded-lg border border-gray-300 bg-transparent px-4 py-2.5 pr-11 text-sm shadow-theme-xs placeholder:text-gray-400 focus:border-brand-300 focus:outline-hidden focus:ring-3 focus:ring-brand-500/10 dark:border-gray-700 dark:bg-gray-900 dark:text-white/90 dark:placeholder:text-white/30 dark:focus:border-brand-800 text-gray-800 dark:bg-dark-900">
                                <option value="Entrada" className="text-gray-700 dark:bg-gray-900 dark:text-gray-400">Entrada</option>
                                <option value="Saída" className="text-gray-700 dark:bg-gray-900 dark:text-gray-400">Saída</option>
                            </select>
                        </div>
                        <div className="col-span-12 md:col-span-8">
                            <Label title="Produto"/>
                            <Autocomplete placeholder="Buscar produto..." defaultValue={watch("productName")} objKey="id" objValue="productName" onSearch={(value: string) => getAutocompleProduct(value)} onSelect={(opt) => {
                                if(opt.stock) {
                                    const listStock = opt.stock.filter((x: any) => x.quantity > 0);

                                    const newList: any[] = [];
                                    listStock.forEach((x: any) => {
                                        let description = "";
                                        
                                        x.variations.forEach((v: any) => {
                                            description = v.attributes.map((a: any) => (`${a.key}: ${a.value}`)).join("/");
                                            const existedIndex = newList.findIndex(n => n.description == description);
                                            
                                            if(existedIndex >= 0) {
                                                newList[existedIndex].stock += parseFloat(v.stock);
                                                newList[existedIndex].codes.push(v.code);
                                            } else {
                                                newList.push({
                                                    stock: parseFloat(v.stock),
                                                    description,
                                                    codes: [
                                                        v.code
                                                    ]
                                                });
                                            };
                                        })

                                    });
                                    
                                    setStock(newList);
                                };

                                setValue("hasProductVariations", opt.hasVariations);
                                setValue("variationsCode", opt.variationsCode);
                                setValue("hasProductSerial", opt.hasSerial);
                                setValue("variations", opt.variations);
                                setValue("productId", opt.id);
                            }} options={products}/>
                        </div> 

                        {
                            watch("productId") && watch("hasProductVariations") == "yes" && watch("type") == "Entrada" &&
                            <div className="col-span-12">
                            <VariationsForm typeBtnSave="button" btnAddSerial={watch("hasProductSerial") == "yes"} sendBody={(body) => {
                                setValue("variations", body.variations);
                                setValue("variationsCode", body.variationsCode);
                                confirm({...getValues()});
                            }} sendCancel={() => {
                                setModal(false);
                                reset(ResetAdjustment);
                            }} variations={watch("variations")} variationsCode={watch("variationsCode")} />
                            </div>  
                        } 

                        {
                            watch("productId") && watch("hasProductVariations") == "yes" && watch("type") == "Saída" && (
                                <>
                                    <div className="col-span-12 md:col-span-4">
                                        <Label title="Variação" />
                                        <select {...register("codeVariation")} className="h-11 w-full appearance-none rounded-lg border border-gray-300 bg-transparent px-4 py-2.5 pr-11 text-sm shadow-theme-xs placeholder:text-gray-400 focus:border-brand-300 focus:outline-hidden focus:ring-3 focus:ring-brand-500/10 dark:border-gray-700 dark:bg-gray-900 dark:text-white/90 dark:placeholder:text-white/30 dark:focus:border-brand-800 text-gray-800 dark:bg-dark-900">
                                            {
                                                stocks.map((stock: any, index: number) => {
                                                    return <option key={index} value={index} className="text-gray-700 dark:bg-gray-900 dark:text-gray-400">{stock.description}</option>
                                                })
                                            }
                                        </select>
                                    </div>
                                    <div className="col-span-12 md:col-span-4">
                                        <Label title="Quantidade" />
                                        <select {...register("code")} className="h-11 w-full appearance-none rounded-lg border border-gray-300 bg-transparent px-4 py-2.5 pr-11 text-sm shadow-theme-xs placeholder:text-gray-400 focus:border-brand-300 focus:outline-hidden focus:ring-3 focus:ring-brand-500/10 dark:border-gray-700 dark:bg-gray-900 dark:text-white/90 dark:placeholder:text-white/30 dark:focus:border-brand-800 text-gray-800 dark:bg-dark-900">
                                            {
                                                quantity.map((code: string, index: number) => {
                                                    return <option key={code} value={index + 1} className="text-gray-700 dark:bg-gray-900 dark:text-gray-400">{index + 1 }</option>
                                                })
                                            }
                                        </select>
                                    </div>
                                    <div className="col-span-12 flex justify-end">
                                        <Button onClick={close} type="button" variant="outline" size="sm" className="mr-2">Cancelar</Button>
                                        <Button onClick={() => confirm({...getValues()})} type="button" className="w-full md:max-w-20" size="sm">Salvar</Button>
                                    </div> 
                                </>
                            )
                        }

                        {
                            watch("hasProductVariations") == "no" &&
                            <>
                                {
                                    watch("type") == "Entrada" &&
                                    <div className="col-span-12 md:col-span-6 lg:col-span-3">
                                        <Label title="Custo Unitário"/>
                                        <Controller
                                            name="cost"
                                            control={control}
                                            defaultValue={0}
                                            render={({ field: { onChange, value } }) => (
                                                <NumericFormat
                                                className="input-erp-primary input-erp-default" 
                                                value={value}
                                                onValueChange={(values) => {
                                                    setValue("cost", values.floatValue ? values.floatValue : 0);
                                                }}
                                                thousandSeparator="."
                                                decimalSeparator=","
                                                prefix="R$ "
                                                decimalScale={2}
                                                fixedDecimalScale
                                                allowNegative={false}
                                                placeholder="Valor Unitário"
                                                />
                                            )}
                                        />
                                    </div>
                                }
                                <div className="col-span-12 md:col-span-6 lg:col-span-3">
                                    <Label title="Quantidade" />
                                    <input placeholder="Quantidade" {...register("quantity")} type="number" className="input-erp-primary input-erp-default no-spinner"/>
                                </div>      
                                {
                                    watch("type") == "Entrada" &&
                                    <>
                                        <div className="col-span-12 md:col-span-6 xl:col-span-3">
                                            <Label title="Preço de Venda" required={false}/>
                                            <Controller
                                                name="price"
                                                control={control}
                                                defaultValue={0}
                                                render={({ field: { onChange, value } }) => (
                                                <NumericFormat
                                                    className="input-erp-primary input-erp-default" 
                                                    value={value}
                                                    onValueChange={(values) => {
                                                    setValue("price", values.floatValue ? values.floatValue : 0);
                                                    }}
                                                    thousandSeparator="."
                                                    decimalSeparator=","
                                                    prefix="R$ "
                                                    decimalScale={2}
                                                    fixedDecimalScale
                                                    allowNegative={false}
                                                    placeholder="Preço de Venda"
                                                />
                                                )}
                                            />
                                        </div>          
                                        {/* <div className="col-span-12 md:col-span-6 lg:col-span-3">
                                            <Label title="Desconto de Venda" required={false}/>
                                            <Controller
                                                name="priceDiscount"
                                                control={control}
                                                defaultValue={0}
                                                render={({ field: { onChange, value } }) => (
                                                <NumericFormat
                                                    className="input-erp-primary input-erp-default" 
                                                    value={value}
                                                    onValueChange={(values) => {
                                                    setValue("priceDiscount", values.floatValue ? values.floatValue : 0);
                                                    }}
                                                    thousandSeparator="."
                                                    decimalSeparator=","
                                                    prefix="R$ "
                                                    decimalScale={2}
                                                    fixedDecimalScale
                                                    allowNegative={false}
                                                    placeholder="Desconto de Venda"
                                                />
                                                )}
                                            />
                                        </div> */}
                                        <div className="col-span-12">
                                            <Button className="me-2" size="sm" variant="outline" onClick={close}>Cancelar</Button>
                                            <Button size="sm" variant="primary" onClick={() => confirm({...getValues()})}>Salvar</Button>
                                        </div>
                                    </>
                                }  
                            </>
                        }
                    </div>
                </div>
            </div>
        </Modal>
    )
}