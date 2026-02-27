"use client";

import Autocomplete from "@/components/form/Autocomplete";
import Checkbox from "@/components/form/input/Checkbox";
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

export const ExchangeReturn = () => {
    const [_, setIsLoading] = useAtom(loadingAtom);
    const [modal, setModal] = useAtom(exchangeReturnModalAtom);
    const [products, setProducts] = useState<any[]>([]);
    const [hasSerial, setHasSerial] = useState<boolean>(false);
    const [hasVariations, setHasVariations] = useState<boolean>(false);
    const [salesOrderCode] = useAtom(salesOrderCodeAtom);
    const [salesOrderItem, setSalesOrderItem] = useAtom(salesOrderItemAtom);
    const [product] = useAtom(productAtom);
    const [exchargeType] = useAtom(exchangeTypeAtom);
    const [balance, setBalance] = useState(0);
    const [typeBalance, setTypeBalance] = useState<"payable" | "receivable">("payable");
    const { register, setValue, getValues, reset, watch, control } = useForm<TExchange>({
        defaultValues: ResetExchange
    });

    const confirm = async () => {
        const form: any = {...getValues()};
        form.origin = `sales-order`;
        form.originDescription = `Troca no PV - nº ${salesOrderCode}`;
        form.salesOrderItemId = salesOrderItem.id;
        form.productId = product.id;
        form.hasVariations = product.hasVariations;
        form.hasSerial = product.hasSerial;
        form.type = exchargeType;

        await create(form);
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
        setSalesOrderItem({});
        reset(ResetExchange);
        setModal(false);
    };

    useEffect(() => {
        const diff = salesOrderItem?.value - watch("price");
        setTypeBalance(diff < 0 ? "payable" : "receivable");  
        setBalance(diff < 0 ? Math.abs(diff) : diff);     
    }, [watch("price")]);

    useEffect(() => {
        const initial = async () => {
        };
        initial();
    }, [modal]);

    return (
        <Modal isOpen={modal} onClose={close} className="w-[80dvw] max-w-240 m-4">
            <div className="no-scrollbar relative overflow-y-auto rounded-3xl bg-white p-4 dark:bg-gray-900 lg:p-11">
                <div className="px-2 pr-14">
                    <h4 className="mb-2 text-2xl font-semibold text-gray-800 dark:text-white/90">{exchargeType == "exchange" ? "Troca" : "Devolução"} do Produto</h4>
                </div>

                <form className="flex flex-col">
                    <div className="custom-scrollbar max-h-[calc(100dvh-15rem)] overflow-y-auto px-2 pb-3">
                        <div className="grid grid-cols-8 gap-4">
                            {
                                exchargeType == "return" ?
                                (
                                    <>
                                    <div className="col-span-8 lg:col-span-6">
                                        <Label title="Produto" />
                                        <Autocomplete disabled defaultValue={product.name} objKey="id" objValue="productName" onSearch={(value: string) => getAutocompleProduct(value)} onSelect={(opt) => { }} options={products}/>
                                    </div>
                                    <div className="col-span-8 lg:col-span-2">
                                        <Label title="Gerar Cashback?" required={false}/>
                                        <Checkbox checked={watch("generateCashback")} onChange={(e) => {setValue("generateCashback", e)}} />
                                    </div>
                                    </>
                                ) : (
                                    <>
                                        <div className="col-span-8 lg:col-span-6">
                                            <Label title="Produto Atual" required={false}/>
                                            <Autocomplete disabled defaultValue={product.name} objKey="id" objValue="productName" onSearch={(value: string) => getAutocompleProduct(value)} onSelect={(opt) => { }} options={products}/>
                                        </div>
                                        <div className="col-span-6 md:col-span-2">
                                            <Label title="Valor Pago" required={false}/>
                                            <Controller
                                                name="cost"
                                                control={control}
                                                defaultValue={salesOrderItem?.value}
                                                render={({ field: { onChange, value } }) => (
                                                <NumericFormat
                                                    className="input-erp-primary input-erp-default" 
                                                    value={salesOrderItem?.value}
                                                    onValueChange={(_) => {}}
                                                    thousandSeparator="."
                                                    decimalSeparator=","
                                                    prefix="R$ "
                                                    decimalScale={2}
                                                    fixedDecimalScale
                                                    allowNegative={false}
                                                    placeholder="Valor da Abertura"
                                                    disabled
                                                />
                                                )}
                                            />
                                        </div>
                                        <div className="col-span-8 lg:col-span-6">
                                            <Label title="Novo Produto" />
                                            <Autocomplete defaultValue={watch("productName")} objKey="id" objValue="productName" onSearch={(value: string) => getAutocompleProduct(value)} onSelect={(opt) => {
                                                setValue("price", parseFloat(opt.price));
                                                setValue("productId", opt.id);
                                                setBalance(salesOrderItem?.value - parseFloat(opt.price));
                                            }} options={products}/>
                                        </div>
                                        <div className="col-span-6 md:col-span-2">
                                            <Label title="Preço" required={false}/>
                                            <Controller
                                                name="price"
                                                control={control}
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
                                                    placeholder="Preço"
                                                />
                                            )}/>
                                        </div>
                                        {
                                            watch("productId") &&
                                            <div className="col-span-6 md:col-span-2">
                                                <Label title={typeBalance == "payable" ? 'Valor a Pagar' : 'Valor do Troco'} required={false}/>
                                                {/* <input value={formattedMoney(balance)} type="text" /> */}
                                                <input value={formattedMoney(balance)} disabled type="text" className="input-erp-primary input-erp-default no-spinner"/>
                                            </div>
                                        }
                                    </>
                                )
                            }
                            <div className="col-span-9">
                                <Button className="me-2" size="sm" variant="outline" onClick={close}>Cancelar</Button>
                                <Button className="me-2" size="sm" variant="primary" onClick={confirm}>Confirmar</Button>
                            </div>
                        </div>
                    </div>
                </form>
            </div>
        </Modal>
    )
}