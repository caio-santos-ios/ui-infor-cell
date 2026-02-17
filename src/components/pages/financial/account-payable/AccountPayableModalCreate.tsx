"use client";

import { loadingAtom } from "@/jotai/global/loading.jotai";
import { api } from "@/service/api.service";
import { configApi, resolveResponse } from "@/service/config.service";
import { useAtom } from "jotai";
import Button from "@/components/ui/button/Button";
import { Modal } from "@/components/ui/modal";
import { Controller, useForm } from "react-hook-form";
import Label from "@/components/form/Label";
import { useEffect, useState } from "react";
import { NumericFormat } from "react-number-format";
import {
    accountPayableIdAtom,
    accountPayableModalAtom,
} from "@/jotai/financial/account-payable/accountPayable.jotai";
import {
    ResetAccountPayable,
    TAccountPayable,
} from "@/types/financial/account-payable/account-payable.type";

export default function AccountPayableModalCreate() {
    const [_, setIsLoading] = useAtom(loadingAtom);
    const [modalCreate, setModalCreate] = useAtom(accountPayableModalAtom);
    const [accountPayableId, setAccountPayableId] = useAtom(accountPayableIdAtom);
    const [paymentMethods, setPaymentMethods] = useState<any[]>([]);

    const { getValues, setValue, register, reset, control, watch } =
        useForm<TAccountPayable>({ defaultValues: ResetAccountPayable });

    // ─── API ──────────────────────────────────────────────────────────────────
    const create = async () => {
        try {
            setIsLoading(true);
            const { data } = await api.post(`/accounts-payable`, { ...getValues() }, configApi());
            resolveResponse({ status: 201, message: data.result.message });
            close();
        } catch (error) {
            resolveResponse(error);
        } finally {
            setIsLoading(false);
        }
    };

    const update = async () => {
        try {
            setIsLoading(true);
            const { data } = await api.put(`/accounts-payable`, { ...getValues() }, configApi());
            resolveResponse({ status: 200, message: data.result.message });
            close();
        } catch (error) {
            resolveResponse(error);
        } finally {
            setIsLoading(false);
        }
    };

    const getById = async (id: string) => {
        try {
            setIsLoading(true);
            const { data } = await api.get(`/accounts-payable/${id}`, configApi());
            reset(data.result.data);
        } catch (error) {
            resolveResponse(error);
        } finally {
            setIsLoading(false);
        }
    };

    const getPaymentMethods = async () => {
        try {
            const { data } = await api.get(
                `/payment-methods?deleted=false&ne$type=receivable&orderBy=name&sort=asc&pageSize=100&pageNumber=1`,
                configApi()
            );
            setPaymentMethods(data.result.data ?? []);
        } catch {
            setPaymentMethods([]);
        }
    };

    // ─── helpers ──────────────────────────────────────────────────────────────
    const close = () => {
        setModalCreate(false);
        setAccountPayableId("");
        reset(ResetAccountPayable);
    };

    useEffect(() => {
        const initial = async () => {
            await getPaymentMethods();
            if (accountPayableId) {
                await getById(accountPayableId);
            }
        };
        initial();
    }, [modalCreate]);

    // ─── render ───────────────────────────────────────────────────────────────
    return (
        <Modal
            isOpen={modalCreate}
            onClose={close}
            className="m-4 w-[90dvw] max-w-160"
        >
            <div className="no-scrollbar relative overflow-y-auto rounded-3xl bg-white p-4 dark:bg-gray-900 lg:p-11">
                <div className="px-2 pr-14">
                    <h4 className="mb-2 text-2xl font-semibold text-gray-800 dark:text-white/90">
                        Conta a Pagar
                    </h4>
                </div>

                <form className="flex flex-col">
                    <div className="max-h-[70dvh] custom-scrollbar overflow-y-auto px-2 pb-3">
                        <div className="grid grid-cols-6 gap-4">

                            {/* Descrição */}
                            <div className="col-span-6">
                                <Label title="Descrição" />
                                <input
                                    maxLength={100}
                                    placeholder="Descrição"
                                    {...register("description")}
                                    type="text"
                                    className="input-erp-primary input-erp-default"
                                />
                            </div>

                            {/* Fornecedor */}
                            <div className="col-span-6 lg:col-span-4">
                                <Label title="Fornecedor" required={false} />
                                <input
                                    maxLength={100}
                                    placeholder="Nome do fornecedor"
                                    {...register("supplierName")}
                                    type="text"
                                    className="input-erp-primary input-erp-default"
                                />
                            </div>

                            {/* Origem */}
                            <div className="col-span-6 lg:col-span-2">
                                <Label title="Origem" required={false} />
                                <select
                                    {...register("originType")}
                                    className="h-11 w-full appearance-none rounded-lg border border-gray-300 bg-transparent px-4 py-2.5 pr-11 text-sm shadow-theme-xs placeholder:text-gray-400 focus:border-brand-300 focus:outline-hidden focus:ring-3 focus:ring-brand-500/10 dark:border-gray-700 dark:bg-gray-900 dark:text-white/90 dark:placeholder:text-white/30 dark:focus:border-brand-800 text-gray-800"
                                >
                                    <option value="manual">Manual</option>
                                    <option value="purchase-order">Pedido de Compra</option>
                                    <option value="service-order">Ordem de Serviço</option>
                                </select>
                            </div>

                            {/* Forma de Pagamento */}
                            <div className="col-span-6 lg:col-span-3">
                                <Label title="Forma de Pagamento" required={false} />
                                <select
                                    {...register("paymentMethodId")}
                                    onChange={(e) => {
                                        const selected = paymentMethods.find(
                                            (p) => p.id === e.target.value
                                        );
                                        setValue("paymentMethodId", e.target.value);
                                        setValue("paymentMethodName", selected?.name ?? "");
                                    }}
                                    className="h-11 w-full appearance-none rounded-lg border border-gray-300 bg-transparent px-4 py-2.5 pr-11 text-sm shadow-theme-xs placeholder:text-gray-400 focus:border-brand-300 focus:outline-hidden focus:ring-3 focus:ring-brand-500/10 dark:border-gray-700 dark:bg-gray-900 dark:text-white/90 dark:placeholder:text-white/30 dark:focus:border-brand-800 text-gray-800"
                                >
                                    <option value="">Selecione</option>
                                    {paymentMethods.map((p: any) => (
                                        <option key={p.id} value={p.id}>
                                            {p.name}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            {/* Valor */}
                            <div className="col-span-6 lg:col-span-3">
                                <Label title="Valor" />
                                <Controller
                                    name="amount"
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
                                            placeholder="Valor"
                                        />
                                    )}
                                />
                            </div>

                            {/* Parcela nº */}
                            <div className="col-span-6 lg:col-span-3">
                                <Label title="Parcela Nº" required={false} />
                                <input
                                    {...register("installmentNumber", { valueAsNumber: true })}
                                    type="number"
                                    min={1}
                                    placeholder="1"
                                    className="input-erp-primary input-erp-default no-spinner"
                                />
                            </div>

                            {/* Total de parcelas */}
                            <div className="col-span-6 lg:col-span-3">
                                <Label title="Total de Parcelas" required={false} />
                                <input
                                    {...register("totalInstallments", { valueAsNumber: true })}
                                    type="number"
                                    min={1}
                                    placeholder="1"
                                    className="input-erp-primary input-erp-default no-spinner"
                                />
                            </div>

                            {/* Vencimento */}
                            <div className="col-span-6 lg:col-span-3">
                                <Label title="Data de Vencimento" />
                                <input
                                    {...register("dueDate")}
                                    type="date"
                                    className="input-erp-primary input-erp-default"
                                />
                            </div>

                            {/* Observações */}
                            <div className="col-span-6">
                                <Label title="Observações" required={false} />
                                <textarea
                                    {...register("notes")}
                                    rows={3}
                                    placeholder="Observações"
                                    className="input-erp-primary input-erp-default resize-none"
                                />
                            </div>
                        </div>
                    </div>

                    <div className="flex items-center gap-3 px-2 mt-6 lg:justify-end">
                        <Button size="sm" variant="outline" onClick={close}>
                            Cancelar
                        </Button>
                        {accountPayableId ? (
                            <Button size="sm" variant="primary" onClick={update}>
                                Salvar
                            </Button>
                        ) : (
                            <Button size="sm" variant="primary" onClick={create}>
                                Adicionar
                            </Button>
                        )}
                    </div>
                </form>
            </div>
        </Modal>
    );
}
