"use client";

import Autocomplete from "@/components/form/Autocomplete";
import Label from "@/components/form/Label";
import VariationForm from "@/components/product/product/VariationForm";
import VariationsForm from "@/components/product/product/VariationsForm";
import Button from "@/components/ui/button/Button";
import { Modal } from "@/components/ui/modal";
import { Table, TableBody, TableCell, TableHeader, TableRow } from "@/components/ui/table";
import { salesOrderCodeAtom } from "@/jotai/commercial/sales-order/salesOrder.jotai";
import { salesOrderItemAtom, salesOrderItemIdAtom } from "@/jotai/commercial/sales-order/salesOrderItem.jotai";
import { loadingAtom } from "@/jotai/global/loading.jotai";
import { productAtom } from "@/jotai/product/product.jotai";
import { exchangeIdAtom, exchangeModalAtom, exchangeReturnModalAtom, exchangeTypeAtom } from "@/jotai/stock/exchange.jotai";
import { api } from "@/service/api.service";
import { configApi, resolveResponse } from "@/service/config.service";
import { ResetProduct } from "@/types/product/product/product.type";
import { TSerial } from "@/types/product/serial/serial.type";
import { ResetExchange, TExchange } from "@/types/stock/exchange/exchange.type";
import { formattedMoney } from "@/utils/mask.util";
import { permissionUpdate } from "@/utils/permission.util";
import { useAtom } from "jotai";
import { useEffect, useState } from "react";
import { Controller, useForm } from "react-hook-form";
import { MdAutorenew, MdSwapHoriz } from "react-icons/md";
import { NumericFormat } from "react-number-format";
import { toast } from "react-toastify";
import { ExchangeReturn } from "./ExchangeReturn";
import { FaUndo } from "react-icons/fa";

export const ExchangeModal = () => {
    const [_, setIsLoading] = useAtom(loadingAtom);
    const [modal, setModal] = useAtom(exchangeModalAtom);
    const [___, setExchangeReturnModal] = useAtom(exchangeReturnModalAtom);
    const [__, setExchangeType] = useAtom(exchangeTypeAtom);
    const [product, setProduct] = useAtom(productAtom);
    const [hasSerial] = useState<boolean>(false);
    const [hasVariations] = useState<boolean>(false);
    const [salesOrderCode] = useAtom(salesOrderCodeAtom);
    const [salesOrderItemId, setSalesOrderItemId] = useAtom(salesOrderItemIdAtom);
    const [salesOrderItem, setSalesOrderItem] = useAtom(salesOrderItemAtom);
    const [salesOrderItems, setSalesOrderItems] = useState<any[]>([]);

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
            const {data} = await api.get(`/sales-orders-items?salesOrderId=${salesOrderItemId}&deleted=false`, configApi());
            const result = data.result;
            setSalesOrderItems(result.data);
        } catch (error) {
            resolveResponse(error);
        }
    };

    const close = () => {
        setSalesOrderItemId("");
        reset(ResetExchange);
        setModal(false);
    };

    const getObj = async (obj: any, action: string) => {
        if(action == "exchange") {
            setExchangeType("exchange");
            setExchangeReturnModal(true);
            setSalesOrderItem(obj);
            console.log(obj)
            setProduct({...ResetProduct, id: obj.productId, name: obj.productName, hasVariations: obj.productHasVariations, hasSerial: obj.productHasSerial});
        };
        
        if(action == "return") {
            setExchangeType("return");
            setExchangeReturnModal(true);
            setSalesOrderItem(obj);
            setProduct({...ResetProduct, id: obj.productId, name: obj.productName, hasVariations: obj.productHasVariations, hasSerial: obj.productHasSerial});
        };
    };

    useEffect(() => {
        const initial = async () => {
            if(salesOrderItemId) {
                await getBySalesOrderItemId(salesOrderItemId);
            }
        };
        initial();
    }, [modal]);

    return (
        <Modal isOpen={modal} onClose={close} className="w-[80dvw] max-w-240 m-4">
            <div className="no-scrollbar relative overflow-y-auto rounded-3xl bg-white p-4 dark:bg-gray-900 lg:p-11">
                <div className="px-2 pr-14">
                    <h4 className="mb-2 text-2xl font-semibold text-gray-800 dark:text-white/90">Troca/Devolução de Produto</h4>
                </div>

                <form className="flex flex-col">
                    <div className="custom-scrollbar max-h-[calc(100dvh-15rem)] overflow-y-auto px-2 pb-3">
                        <div className="grid grid-cols-9 gap-4">
                            <div className="col-span-9 max-h-[calc(100dvh-25rem)] overflow-y-auto rounded-xl border border-gray-200 bg-white dark:border-white/5 dark:bg-white/3 mb-3">
                                <div className="max-w-full overflow-x-auto tele-container-table">
                                    <div className="min-w-full divide-y">
                                        <Table className="divide-y">
                                            <TableHeader className="border-b border-gray-100 dark:border-white/5 tele-table-thead">
                                                <TableRow>
                                                    <TableCell isHeader className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400">Produto</TableCell>
                                                    <TableCell isHeader className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400">Quantidade</TableCell>
                                                    <TableCell isHeader className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400">Valor Unitário</TableCell>
                                                    <TableCell isHeader className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400">Valor Total</TableCell>
                                                    <TableCell isHeader className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400">Ações</TableCell>
                                                </TableRow>
                                            </TableHeader>

                                            <TableBody className="divide-y divide-gray-100 dark:divide-white/5">
                                                {salesOrderItems.map((x: any) => (
                                                    <TableRow key={x.id}>
                                                        <TableCell className="text-sm px-5 py-4 sm:px-6 text-start text-gray-500 dark:text-gray-400">{x.productName}</TableCell>
                                                        <TableCell className="text-sm px-5 py-4 sm:px-6 text-start text-gray-500 dark:text-gray-400">{x.quantity}</TableCell>
                                                        <TableCell className="text-sm px-5 py-4 sm:px-6 text-start text-gray-500 dark:text-gray-400">{formattedMoney(x.value)}</TableCell>
                                                        <TableCell className="text-sm px-5 py-4 sm:px-6 text-start text-gray-500 dark:text-gray-400">{formattedMoney(x.total)}</TableCell>
                                                        {
                                                            x.exchanges.length > 0 && (
                                                                <TableCell className="text-sm px-5 py-4 sm:px-6 text-start text-gray-500 dark:text-gray-400">{x.status}</TableCell>
                                                            )
                                                        }
                                                        <TableCell className="px-5 py-4 sm:px-6 text-start text-gray-500 dark:text-gray-400">
                                                            <div className="flex gap-2">
                                                                {
                                                                    permissionUpdate("F", "F1") && x.exchanges.length == 0 &&
                                                                    <div title="Trocar o Produto" onClick={() => getObj(x, "exchange")} className="cursor-pointer text-yellow-400 hover:text-yellow-500" >
                                                                        <MdAutorenew size={15} />
                                                                    </div>
                                                                } 
                                                                {
                                                                    permissionUpdate("F", "F1") && x.exchanges.length == 0 &&
                                                                    <div title="Devolver o Produto" onClick={() => getObj(x, "return")} className="cursor-pointer text-blue-400 hover:text-blue-500" >
                                                                        <FaUndo size={13} />
                                                                    </div>
                                                                } 
                                                            </div>
                                                        </TableCell>
                                                    </TableRow>
                                                ))}
                                            </TableBody>
                                        </Table>
                                    </div>
                                </div>
                            </div>

                            {/* <div className="col-span-9">
                                <Label title="Produto" />
                                <Autocomplete disabled defaultValue={watch("productName")} objKey="id" objValue="productName" onSearch={(value: string) => getAutocompleProduct(value)} onSelect={(opt) => { 
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
                            */}
                            <div className="col-span-9">
                                <Button className="me-2" size="sm" variant="outline" onClick={close}>Cancelar</Button>
                            </div>
                        </div>
                    </div>
                </form>
            </div>
        </Modal>
    )
}