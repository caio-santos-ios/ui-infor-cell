"use client";

import { loadingAtom } from "@/jotai/global/loading.jotai";
import { api } from "@/service/api.service";
import { configApi, resolveResponse } from "@/service/config.service";
import { useAtom } from "jotai";
import Button from "@/components/ui/button/Button";
import { Modal } from "@/components/ui/modal";
import { Controller, useForm } from "react-hook-form";
import Label from "@/components/form/Label";
import { NumericFormat } from "react-number-format";
import {
    accountPayableIdAtom,
    accountPayablePayModalAtom,
} from "@/jotai/financial/account-payable/accountPayable.jotai";
import {
    ResetPayAccountPayable,
    TPayAccountPayable,
} from "@/types/financial/account-payable/account-payable.type";

export default function AccountPayableModalPay() {
    const [_, setIsLoading] = useAtom(loadingAtom);
    const [modalPay, setModalPay] = useAtom(accountPayablePayModalAtom);
    const [accountPayableId, setAccountPayableId] = useAtom(accountPayableIdAtom);

    const { getValues, register, control, reset } = useForm<TPayAccountPayable>({
        defaultValues: ResetPayAccountPayable,
    });

    const pay = async () => {
        try {
            setIsLoading(true);
            const { data } = await api.put(
                `/accounts-payable/pay`,
                { ...getValues(), id: accountPayableId },
                configApi()
            );
            resolveResponse({ status: 200, message: data.result.message });
            close();
        } catch (error) {
            resolveResponse(error);
        } finally {
            setIsLoading(false);
        }
    };

    const close = () => {
        setModalPay(false);
        setAccountPayableId("");
        reset(ResetPayAccountPayable);
    };

    return (
        <Modal
            isOpen={modalPay}
            onClose={close}
            className="m-4 w-[90dvw] max-w-120"
        >
            <div className="no-scrollbar relative overflow-y-auto rounded-3xl bg-white p-4 dark:bg-gray-900 lg:p-11">
                <div className="px-2 pr-14">
                    <h4 className="mb-2 text-2xl font-semibold text-gray-800 dark:text-white/90">
                        Baixar Título
                    </h4>
                    <p className="mb-4 text-sm text-gray-500 dark:text-gray-400">
                        Informe o valor pago e a data do pagamento.
                    </p>
                </div>

                <form className="flex flex-col">
                    <div className="px-2 pb-3">
                        <div className="grid grid-cols-6 gap-4">

                            <div className="col-span-6 lg:col-span-3">
                                <Label title="Valor Pago" />
                                <Controller
                                    name="amountPaid"
                                    control={control}
                                    defaultValue={0}
                                    render={({ field: { onChange, value } }) => (
                                        <NumericFormat
                                            className="input-erp-primary input-erp-default"
                                            value={value}
                                            onValueChange={(v) => onChange(v.floatValue ?? 0)}
                                            thousandSeparator="."
                                            decimalSeparator=","
                                            prefix="R$ "
                                            decimalScale={2}
                                            fixedDecimalScale
                                            allowNegative={false}
                                            placeholder="Valor Pago"
                                        />
                                    )}
                                />
                            </div>

                            {/* Data do Pagamento */}
                            <div className="col-span-6 lg:col-span-3">
                                <Label title="Data do Pagamento" />
                                <input
                                    {...register("paidAt")}
                                    type="date"
                                    className="input-erp-primary input-erp-default"
                                />
                            </div>

                            {/* Status */}
                            <div className="col-span-6">
                                <Label title="Status" />
                                <select
                                    {...register("status")}
                                    className="h-11 w-full appearance-none rounded-lg border border-gray-300 bg-transparent px-4 py-2.5 pr-11 text-sm shadow-theme-xs placeholder:text-gray-400 focus:border-brand-300 focus:outline-hidden focus:ring-3 focus:ring-brand-500/10 dark:border-gray-700 dark:bg-gray-900 dark:text-white/90 dark:placeholder:text-white/30 dark:focus:border-brand-800 text-gray-800"
                                >
                                    <option value="paid">Pago</option>
                                    <option value="partial">Parcial</option>
                                    <option value="cancelled">Cancelado</option>
                                </select>
                            </div>
                        </div>
                    </div>

                    <div className="flex items-center gap-3 px-2 mt-6 lg:justify-end">
                        <Button size="sm" variant="outline" onClick={close}>
                            Cancelar
                        </Button>
                        <Button size="sm" variant="primary" onClick={pay}>
                            Confirmar Pagamento
                        </Button>
                    </div>
                </form>
            </div>
        </Modal>
    );
}
