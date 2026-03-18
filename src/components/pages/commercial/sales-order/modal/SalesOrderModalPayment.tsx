import Label from "@/components/form/Label";
import Button from "@/components/ui/button/Button";
import { salesOrderIdAtom, salesOrderModalAtom, salesOrderModalStepAtom } from "@/jotai/commercial/sales-order/salesOrder.jotai";
import { loadingAtom } from "@/jotai/global/loading.jotai";
import { api } from "@/service/api.service";
import { configApi, resolveResponse } from "@/service/config.service";
import { ResetSalesOrderFinish, TSalesOrderFinish } from "@/types/commercial/sales-orders/sales-order.type";
import { TPaymentMethod } from "@/types/payment-method/payment-method.type";
import { formattedMoney } from "@/utils/mask.util";
import { useAtom } from "jotai";
import { useEffect, useMemo, useState } from "react";
import { Controller, useForm } from "react-hook-form";
import { NumericFormat } from "react-number-format";

export const SalesOrderModalPayment = () => {
    const [_, setIsLoading] = useAtom(loadingAtom);
    const [___, setModalStep] = useAtom(salesOrderModalStepAtom);
    
    const [paymentMethods, setPaymentMethod] = useState<TPaymentMethod[]>([]);
    const [salesOrderId, setSalesOrderId] = useAtom(salesOrderIdAtom);
    const [__, setModalCreate] = useAtom(salesOrderModalAtom);

    const [baseTotal, setBaseTotal] = useState(0);
    const [listOfParcels, setListOfParcels] = useState<any[]>([]);
    const [parcelSurcharge, setParcelSurcharge] = useState(0);
    const [mySurchargeTotal, setMySurchargeTotal] = useState(0);

    const { getValues, reset, register, watch, control } = useForm<TSalesOrderFinish>({
        defaultValues: ResetSalesOrderFinish
    });

    const watchedPaymentMethodId      = watch("paymentMethodId");
    const watchedFreight              = watch("freight") ?? 0;
    const watchedDiscountValue        = watch("discountValue") ?? 0;
    const watchedDiscountType         = watch("discountType");
    const watchedNumberOfInstallments = watch("numberOfInstallments");

    const discountAmount = useMemo(() => {
        if (!watchedDiscountValue) return 0;
        if (watchedDiscountType === "percentage") {
            return (baseTotal * watchedDiscountValue) / 100;
        }
        return watchedDiscountValue;
    }, [baseTotal, watchedDiscountValue, watchedDiscountType]);

    const parcelBase = useMemo(() => {
        const result = baseTotal - discountAmount;
        return result < 0 ? 0 : result;
    }, [baseTotal, discountAmount]);

    const displayTotalWithSurcharge = useMemo(() => {
        return parcelBase + parcelSurcharge + watchedFreight;
    }, [parcelBase, parcelSurcharge, watchedFreight]);

    useEffect(() => {
        const payment = paymentMethods.find(p => p.id === watchedPaymentMethodId);
        if (!payment) {
            setListOfParcels([]);
            setParcelSurcharge(0);
            return;
        }

        const list = payment.interest.map((item: any) => {
            const parcel         = parcelBase / item.installment;
            const surcharge      = (parcel * parseFloat(item.surcharge))      / 100;
            const transactionFee = (parcel * parseFloat(item.transactionFee)) / 100;
            const parcelTotal    = parcel + surcharge + transactionFee;
            const surchargeTotal = (surcharge + transactionFee) * item.installment;

            return {
                label: `${item.installment}x de ${formattedMoney(parcelTotal)}`,
                installment: item.installment,
                value: parcelTotal,
                surchargeTotal,
            };
        });

        setListOfParcels(list);

        const currentInstallment = getValues("numberOfInstallments");
        const selected = list.find(p => p.installment === Number(currentInstallment)) ?? list[0];
        setParcelSurcharge(selected?.surchargeTotal ?? 0);
    }, [watchedPaymentMethodId, parcelBase, paymentMethods]);
    
    useEffect(() => {
        if (!watchedNumberOfInstallments || listOfParcels.length === 0) return;
        const selected = listOfParcels.find(p => p.installment === Number(watchedNumberOfInstallments));
        setParcelSurcharge(selected?.surchargeTotal ?? 0);
        setMySurchargeTotal(selected?.surchargeTotal);
    }, [watchedNumberOfInstallments, listOfParcels]);

    const getById = async (id: string) => {
        try {
            const { data } = await api.get(`/sales-orders/${id}`, configApi());
            const result = data.result.data;
            setBaseTotal(parseFloat(result.total));
        } catch (error) {
            resolveResponse(error);
        }
    };

    const getSelectPaymentMethod = async () => {
        try {
            const { data } = await api.get(
                `/payment-methods?deleted=false&ne$type=payable&orderBy=createdAt&sort=desc&pageSize=1000&pageNumber=1`,
                configApi()
            );
            setPaymentMethod(data.result.data);
        } catch (error) {
            resolveResponse(error);
        }
    };

    const finish = async () => {
        try {
            setIsLoading(true);
            console.log({total: displayTotalWithSurcharge, subtotal: baseTotal, id: salesOrderId, tax: mySurchargeTotal})
            const { data } = await api.put(`/sales-orders/finish`, {...getValues(), total: displayTotalWithSurcharge, subtotal: baseTotal, id: salesOrderId, tax: mySurchargeTotal}, configApi());

            resolveResponse({ status: 201, message: data.result.message });
            closed();
        } catch (error) {
            resolveResponse(error);
        } finally {
            setIsLoading(false);
        }
    };

    const closed = () => {
        setModalCreate(false);
        setSalesOrderId("");
    };

    useEffect(() => {
        const initial = async () => {
            reset(ResetSalesOrderFinish);
            await getSelectPaymentMethod();
            await getById(salesOrderId);
        };
        initial();
    }, []);

    return (
        <div className="grid grid-cols-8 gap-4">                        
            <div className="col-span-8 md:col-span-4">
                <Label title="Forma de Pagamento" />
                <select {...register("paymentMethodId")} className="h-11 w-full appearance-none rounded-lg border border-gray-300 bg-transparent px-4 py-2.5 pr-11 text-sm shadow-theme-xs placeholder:text-gray-400 focus:border-brand-300 focus:outline-hidden focus:ring-3 focus:ring-brand-500/10 dark:border-gray-700 dark:bg-gray-900 dark:text-white/90 dark:placeholder:text-white/30 dark:focus:border-brand-800 text-gray-800 dark:bg-dark-900">
                    <option value="" className="text-gray-700 dark:bg-gray-900 dark:text-gray-400">Selecione</option>
                    {paymentMethods.map((x: any) => (
                        <option key={x.id} value={x.id} className="text-gray-700 dark:bg-gray-900 dark:text-gray-400">{x.name}</option>
                    ))}
                </select>
            </div>

            <div className="col-span-8 md:col-span-2">
                <Label title="Desconto" required={false}/>
                <div className="relative flex items-stretch w-full">
                    <Controller
                        name="discountValue"
                        control={control}
                        defaultValue={0}
                        render={({ field: { onChange, value } }) => (
                            <NumericFormat
                                className="h-11 w-full rounded-lg border appearance-none px-4 py-2.5 text-sm shadow-theme-xs placeholder:text-gray-400 focus:outline-hidden focus:ring-3 focus:border-(--erp-primary-color) dark:bg-gray-900 dark:text-white/90 dark:placeholder:text-white/30 dark:focus:border-(--erp-primary-color) bg-transparent text-gray-800 border-gray-300 focus:ring-brand-500/10 dark:border-gray-700 rounded-r-none border-r-0 text-right"
                                value={value}
                                onValueChange={(values) => onChange(values.floatValue ?? 0)}
                                thousandSeparator="."
                                decimalSeparator=","
                                prefix={watchedDiscountType === "money" ? "R$ " : ""}
                                suffix={watchedDiscountType === "percentage" ? " %" : ""}
                                decimalScale={2}
                                fixedDecimalScale
                                allowNegative={false}
                            />
                        )}
                    />
                    <div className="flex items-center">
                        <select {...register("discountType")} className="h-full border border-gray-300 bg-gray-50 px-2 py-1 text-sm font-medium text-gray-700 focus:border-brand-500 focus:ring-brand-500 dark:border-gray-700 dark:bg-gray-800 dark:text-white rounded-r-lg outline-none cursor-pointer">
                            <option value="money">R$</option>
                            <option value="percentage">%</option>
                        </select>
                    </div>
                </div>
            </div>

            <div className="col-span-8 md:col-span-2">
                <Label title="Quantidade de Parcelas" required={false}/>
                <select {...register("numberOfInstallments")} className="h-11 w-full appearance-none rounded-lg border border-gray-300 bg-transparent px-4 py-2.5 pr-11 text-sm shadow-theme-xs placeholder:text-gray-400 focus:border-brand-300 focus:outline-hidden focus:ring-3 focus:ring-brand-500/10 dark:border-gray-700 dark:bg-gray-900 dark:text-white/90 dark:placeholder:text-white/30 dark:focus:border-brand-800 text-gray-800 dark:bg-dark-900">
                    {listOfParcels.map((n, i) => (
                        <option key={i} value={n.installment} className="dark:bg-gray-900">
                            {n.label}
                        </option>
                    ))}
                </select>
            </div>

            <div className="col-span-8 md:col-span-2">
                <Label title="Frete" required={false}/>
                <Controller
                    name="freight"
                    control={control}
                    defaultValue={0}
                    render={({ field: { onChange, value } }) => (
                        <NumericFormat
                            className="input-erp-primary input-erp-default" 
                            value={value}
                            onValueChange={(values) => onChange(values.floatValue ?? 0)}
                            thousandSeparator="."
                            decimalSeparator=","
                            prefix="R$ "
                            decimalScale={2}
                            fixedDecimalScale
                            allowNegative={false}
                            placeholder="Frete"
                        />
                    )}
                />  
            </div>

            <div className="col-span-8 md:col-span-6">
                <Label title="Transportadora" required={false}/>
                <input maxLength={50} placeholder="Transportadora" {...register("currier")} type="text" className="input-erp-primary input-erp-default"/>
            </div>

            <div className="col-span-8 lg:col-span-4">
                <h1 className="py-1.5 px-4 text-start bg-green-600 text-white rounded-lg">
                    TOTAL DO PEDIDO: <strong>{formattedMoney(displayTotalWithSurcharge)}</strong>
                </h1>
            </div>

            <div className="col-span-8 lg:col-span-4 flex justify-end">
                <Button className="mr-4" size="sm" variant="outline" onClick={() => setModalStep("items")}>Voltar</Button>
                <Button size="sm" variant="primary" onClick={finish}>Finalizar Venda</Button>
            </div>
        </div>
    );
};