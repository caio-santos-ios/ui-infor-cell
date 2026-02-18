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
import { ResetAccountReceivable, TAccountReceivable } from "@/types/financial/accounts-receivable/accounts-receivable.type";
import { accountReceivableIdAtom, accountReceivableModalAtom } from "@/jotai/financial/accounts-receivable/accountsReceivable.jotai";
import { NumericFormat } from "react-number-format";
import AutocompletePlus from "@/components/form/AutocompletePlus";
import { customerAtom, customerModalCreateAtom } from "@/jotai/masterData/customer.jotai";

export default function AccountReceivableModalCreate() {
  const [_, setIsLoading] = useAtom(loadingAtom);
  const [modalCreate, setModalCreate] = useAtom(accountReceivableModalAtom);
  const [accountReceivableId, setAccountReceivableId] = useAtom(accountReceivableIdAtom);
  const [paymentMethods, setPaymentMethods] = useState<any[]>([]);
  const [customers, setCustomers] = useState<any[]>([]);
  const [__, setCustomerModalCreate] = useAtom(customerModalCreateAtom);
  const [customer, setCustomer] = useAtom(customerAtom);

  const { getValues, setValue, register, reset, control, watch } = useForm<TAccountReceivable>({
    defaultValues: ResetAccountReceivable
  });

  const create = async () => {
    try {
      setIsLoading(true);
      const { data } = await api.post(`/accounts-receivable`, { ...getValues() }, configApi());
      const result = data.result;
      resolveResponse({ status: 201, message: result.message });
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
      const { data } = await api.put(`/accounts-receivable`, { ...getValues() }, configApi());
      const result = data.result;
      resolveResponse({ status: 200, message: result.message });
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
      const { data } = await api.get(`/accounts-receivable/${id}`, configApi());
      const result = data.result.data;
      reset(result);
      setValue("dueDate", result.dueDate.split("T")[0]);
    } catch (error) {
      resolveResponse(error);
    } finally {
      setIsLoading(false);
    }
  };

  const getPaymentMethods = async () => {
    try {
        const { data } = await api.get(`/payment-methods?deleted=false&ne$type=payable&orderBy=name&sort=asc&pageSize=100&pageNumber=1`,
            configApi()
        );
        setPaymentMethods(data.result.data ?? []);
    } catch {
        setPaymentMethods([]);
    }
  };

  const getAutocompleCustomer = async (value: string) => {
    try {
      if(!value) return setCustomers([]);
      const {data} = await api.get(`/customers?deleted=false&orderBy=tradeName&sort=desc&pageSize=10&pageNumber=1&regex$or$tradeName=${value}&regex$or$corporateName=${value}&regex$or$document=${value}`, configApi());
      const result = data.result;
      setCustomers(result.data);
    } catch (error) {
      resolveResponse(error);
    }
  };

  const close = () => {
    setModalCreate(false);
    setAccountReceivableId("");
    reset(ResetAccountReceivable);
  };

  useEffect(() => {
    if(customer.id && customer.tradeName) {
      setValue("customerId", customer.id);
      setValue("customerName", customer.tradeName);
    };
  }, [customer])

  useEffect(() => {
    const initial = async () => {
      await getPaymentMethods();

      if (accountReceivableId) {
        await getById(accountReceivableId);
      }
    };
    initial();
  }, [modalCreate]);

  return (
    <Modal isOpen={modalCreate} onClose={() => setModalCreate(false)} className="m-4 w-[80dvw] max-w-160">
      <div className="no-scrollbar relative overflow-y-auto rounded-3xl bg-white p-4 dark:bg-gray-900 lg:p-11">
        <div className="px-2 pr-14">
          <h4 className="mb-2 text-2xl font-semibold text-gray-800 dark:text-white/90">
            Conta a Receber
          </h4>
        </div>

        <form className="flex flex-col">
          <div className="max-h-[70dvh] custom-scrollbar overflow-y-auto px-2 pb-3">
            <div className="grid grid-cols-6 gap-4">
              <div className="col-span-6">
                <Label title="Descrição" />
                <input maxLength={200} placeholder="Ex: Serviço de troca de tela" {...register("description")} type="text" className="input-erp-primary input-erp-default" />
              </div>

              <div className="col-span-6">
                <Label title="Cliente" required={false}/>
                <AutocompletePlus onAddClick={() => {
                    setCustomerModalCreate(true); 
                  }} placeholder="Buscar cliente..." defaultValue={watch("customerName")} objKey="id" objValue="tradeName" onSearch={(value: string) => getAutocompleCustomer(value)} onSelect={(opt) => {
                  setValue("customerId", opt.id);
                }} options={customers}/>
              </div>

              <div className="col-span-6 lg:col-span-4">
                <Label title="Forma de Pagamento" required={false} />
                <select {...register("paymentMethodId")} className="h-11 w-full appearance-none rounded-lg border border-gray-300 bg-transparent px-4 py-2.5 pr-11 text-sm shadow-theme-xs placeholder:text-gray-400 focus:border-brand-300 focus:outline-hidden focus:ring-3 focus:ring-brand-500/10 dark:border-gray-700 dark:bg-gray-900 dark:text-white/90 dark:placeholder:text-white/30 dark:focus:border-brand-800 text-gray-800">
                    <option value="">Selecione</option>
                    {paymentMethods.map((p: any) => (
                        <option key={p.id} value={p.id}>
                          {p.name}
                        </option>
                    ))}
                </select>
              </div>
              <div className="col-span-6 lg:col-span-2">
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
              <div className="col-span-6 lg:col-span-3">
                <Label title="Data de Vencimento" />
                <input {...register("dueDate")} type="date" className="input-erp-primary input-erp-default" />
              </div>
              <div className="col-span-6">
                <Label title="Observações" />
                <textarea maxLength={500} placeholder="Observações" {...register("notes")} rows={3} className="input-erp-primary input-erp-default resize-none" />
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3 px-2 mt-6 lg:justify-end">
            <Button size="sm" variant="outline" onClick={() => close()}>Cancelar</Button>
            {
              (watch("status") != "paid" && watch("status") != "cancelled") &&
              (
                accountReceivableId
              ? <Button size="sm" variant="primary" onClick={() => update()}>Salvar</Button>
              : <Button size="sm" variant="primary" onClick={() => create()}>Adicionar</Button>
              )
            }
          </div>
        </form>
      </div>
    </Modal>
  );
}
