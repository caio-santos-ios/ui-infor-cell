import Autocomplete from "@/components/form/Autocomplete";
import AutocompletePlus from "@/components/form/AutocompletePlus";
import Label from "@/components/form/Label";
import Button from "@/components/ui/button/Button";
import { Modal } from "@/components/ui/modal"
import { salesOrderIdAtom, salesOrderModalAtom, salesOrderModalStepAtom, salesOrderStatusAtom } from "@/jotai/commercial/sales-order/salesOrder.jotai";
import { loadingAtom } from "@/jotai/global/loading.jotai";
import { customerAtom, customerModalCreateAtom } from "@/jotai/masterData/customer.jotai";
import { api } from "@/service/api.service";
import { configApi, resolveResponse } from "@/service/config.service";
import { ResetBox, TBox } from "@/types/commercial/box/box.type";
import { ResetSalesOrder, TSalesOrder } from "@/types/commercial/sales-orders/sales-order.type";
import { ResetCustomer } from "@/types/master-data/customer/customer.type";
import { useAtom } from "jotai";
import { useEffect, useState } from "react";
import { Controller, useForm } from "react-hook-form";
import { IoIosWarning } from "react-icons/io";
import { NumericFormat } from "react-number-format";

export const SalesOrderModalBox = () => {
    const [_, setIsLoading] = useAtom(loadingAtom);
    const [_____, setModalStep] = useAtom(salesOrderModalStepAtom);
    
    const [boxOpened, setBoxOpened] = useState<boolean>(false);
    const [___, setModalBoxCreate] = useState<boolean>(false);
    const [__, setBox] = useState<boolean>(false);

    const { getValues, setValue, reset, control } = useForm<TBox>({
        defaultValues: ResetBox
    });

    const createBox = async () => {
        try {
            setIsLoading(true);
            const {data} = await api.post(`/boxes`, {...getValues()}, configApi());
            const result = data.result;
            resolveResponse({status: 201, message: result.message});
            setModalBoxCreate(false);
            setModalStep("seller");
        } catch (error) {
            resolveResponse(error);
        } finally {
            setIsLoading(false);
        }
    };

    const updateBox = async () => {
        try {
            setIsLoading(true);
            const {data} = await api.put(`/boxes/close`, {...getValues()}, configApi());
            const result = data.result;
            resolveResponse({status: 200, message: result.message});
            setModalBoxCreate(false);
            setModalStep("items");
        } catch (error) {
            resolveResponse(error);
        } finally {
            setIsLoading(false);
        }
    };

    const getBoxByCreatedBy = async () => {
        try {
            const {data} = await api.get(`/boxes/verify`, configApi());
            const result = data.result;

            setBoxOpened(false);
            setModalBoxCreate(false);
            if(result.data == null) {
                setModalBoxCreate(true);
            } else {
                reset(result.data);
                setValue("closingValue", result.data.value);
                
                const createdAt = result.data.createdAt; 
                const [year, month, day] = createdAt.split("T")[0].split("-");
                const dateCreated = new Date(Number(year), Number(month) - 1, Number(day));
                
                const toDay = new Date();
                toDay.setHours(0, 0, 0, 0);

                const isAbertoOntem = dateCreated.getTime() < toDay.getTime();

                if (isAbertoOntem) {
                    setBoxOpened(true);
                    setModalBoxCreate(true);
                    setBox(result.data);
                };
            };
        } catch (error) {
            resolveResponse(error);
        }
    };    

    useEffect(() => {
        const initial = async () => {
            await getBoxByCreatedBy();
        };
        initial();
    }, []);

    return (
        <div className={`grid grid-cols-2 gap-3`}>
            {
                boxOpened &&
                <div className="col-span-1">
                    <div className="flex flex-col items-center justify-between gap-4 p-4 bg-amber-50 border-l-4 border-amber-500 rounded-r-lg shadow-sm dark:bg-amber-900/20 dark:border-amber-600">
                        <div className="flex items-center gap-3">
                            <div className="p-2 bg-amber-500 rounded-full text-white">
                                <IoIosWarning size={20} />
                            </div>
                        
                            <div>
                                <h3 className="text-sm font-bold text-amber-800 dark:text-amber-200 uppercase tracking-wide">
                                    Caixa Pendente
                                </h3>
                                <p className="text-sm text-amber-700 dark:text-amber-300">
                                    Existe um caixa aberto de <strong>ontem</strong>. Para continuar com as vendas de hoje, é necessário encerrá-lo.
                                </p>
                            </div>
                        </div>

                        <div className="flex gap-2 shrink-0 w-full">
                            {/* <Button size="sm" variant="outline" onClick={() => {
                            setModalBoxCreate(false);
                            setBoxOpened(false);
                            }}>Ignorar</Button> */}
                            <Button size="sm" variant="primary" onClick={() => updateBox()}>Fechar e Abrir Novo</Button>
                        </div>
                    </div>
                </div>
            }

            <div className={`${boxOpened ? 'col-span-1' : 'col-span-2'}`}>
                <div className="grid grid-cols-2 gap-4">
                    <div className="col-span-2">
                        <Label title="Valor da Abertura" />
                        <Controller
                            name="openingValue"
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
                                placeholder="Valor da Abertura"
                                disabled={boxOpened}
                            />
                            )}
                        />
                    </div>
                    {
                        boxOpened &&
                        <div className="col-span-2">
                            <Label title="Valor do Fechamento" />
                                <Controller
                                name="closingValue"
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
                                    placeholder="Valor do Fechamento"
                                    />
                                )}
                            />
                        </div>
                    }
                </div>
            </div>
            
            {/* 
                <div className="col-span-6 md:col-span-3">
                <Label title="Venda por 2 etapas?" required={false}/>
                <select disabled={boxOpened} {...RegisterBox("twoSteps")} className="h-11 w-full appearance-none rounded-lg border border-gray-300 bg-transparent px-4 py-2.5 pr-11 text-sm shadow-theme-xs placeholder:text-gray-400 focus:border-brand-300 focus:outline-hidden focus:ring-3 focus:ring-brand-500/10 dark:border-gray-700 dark:bg-gray-900 dark:text-white/90 dark:placeholder:text-white/30 dark:focus:border-brand-800 text-gray-800 dark:bg-dark-900">
                    <option value="yes" className="text-gray-700 dark:bg-gray-900 dark:text-gray-400">Sim</option>
                    <option value="no" className="text-gray-700 dark:bg-gray-900 dark:text-gray-400">Não</option>
                </select>
                </div>   
            */}
            {
                !boxOpened && (
                    <div className="col-span-1">
                        <Button className="w-full" size="sm" variant="primary" onClick={createBox}>Abrir Caixa</Button>
                    </div>
                )
            }
        </div>
    )
}