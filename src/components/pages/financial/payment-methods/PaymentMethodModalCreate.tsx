"use client";

import { loadingAtom } from "@/jotai/global/loading.jotai";
import { api } from "@/service/api.service";
import { configApi, resolveResponse } from "@/service/config.service";
import { useAtom } from "jotai";
import Button from "@/components/ui/button/Button";
import { Modal } from "@/components/ui/modal";
import { Controller, useFieldArray, useForm } from "react-hook-form";
import Label from "@/components/form/Label";
import React, { useEffect, useState } from "react";
import { ResetPaymentMethod, TPaymentMethod } from "@/types/payment-method/payment-method.type";
import { paymentMethodIdAtom, paymentMethodModalAtom } from "@/jotai/financial/payment-methods/paymentMethod.jotai";
import { NumericFormat } from "react-number-format";

export default function PaymentMethodModalCreate() {
  const [_, setIsLoading] = useAtom(loadingAtom);
  const [modalCreate, setModalCreate] = useAtom(paymentMethodModalAtom);
  const [paymentMethodId, setPaymentMethodId] = useAtom(paymentMethodIdAtom);

  const { getValues, setValue, register, reset, watch, control } = useForm<TPaymentMethod>({
    defaultValues: ResetPaymentMethod
  });
  
  const { fields, append, remove } = useFieldArray({
    control,
    name: "interest",
  });

  const create = async () => {
    try {
      setIsLoading(true);
      const {data} = await api.post(`/payment-methods`, {...getValues()}, configApi());
      const result = data.result;
      resolveResponse({status: 201, message: result.message});
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
      const {data} = await api.put(`/payment-methods`, {...getValues()}, configApi());
      const result = data.result;
      resolveResponse({status: 200, message: result.message});
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
      const {data} = await api.get(`/payment-methods/${id}`, configApi());
      const result = data.result.data;
      reset(result);
    } catch (error) {
      resolveResponse(error);
    } finally {
      setIsLoading(false);
    }
  };

  const close = () => {
    setModalCreate(false);
    setPaymentMethodId("");
    reset(ResetPaymentMethod);
  };

  useEffect(() => {
    setValue("interest", []);
    const array: {installment: number; value: number;}[] = [];
    for (let index = 0; index < watch("numberOfInstallments"); index++) {
      array.push({installment: index + 1, value: 0});
    };
    setValue("interest", array);
  }, [watch("numberOfInstallments")]);
  
  useEffect(() => {
    const intial = async () => {
      if(paymentMethodId) {
        await getById(paymentMethodId);
      };
    };
    intial();
  }, [modalCreate]);

  return (
    <Modal isOpen={modalCreate} onClose={() => setModalCreate(false)} className={`m-4 w-[80dvw] max-w-160 bg-red-400`}>
      <div className={`no-scrollbar relative overflow-y-auto rounded-3xl bg-white p-4 dark:bg-gray-900 lg:p-11`}>
        <div className="px-2 pr-14">
          <h4 className="mb-2 text-2xl font-semibold text-gray-800 dark:text-white/90">Forma de Pagamento</h4>
        </div>

        <form className="flex flex-col">
          <div className={`max-h-[70dvh] custom-scrollbar overflow-y-auto px-2 pb-3`}>
            <div className="grid grid-cols-6 gap-4">

              <div className="col-span-6">
                <Label title="Nome" />
                <input maxLength={50} placeholder="Nome" {...register("name")} type="text" className="input-erp-primary input-erp-default"/>
              </div>

              <div className="col-span-6 lg:col-span-3">
                <Label title="Tipo"/>
                <select {...register("type")} className="h-11 w-full appearance-none rounded-lg border border-gray-300 bg-transparent px-4 py-2.5 pr-11 text-sm shadow-theme-xs placeholder:text-gray-400 focus:border-brand-300 focus:outline-hidden focus:ring-3 focus:ring-brand-500/10 dark:border-gray-700 dark:bg-gray-900 dark:text-white/90 dark:placeholder:text-white/30 dark:focus:border-brand-800 text-gray-800 dark:bg-dark-900">
                  <option value="all" className="text-gray-700 dark:bg-gray-900 dark:text-gray-400">Contas a Pagar e Receber</option>
                  <option value="payable" className="text-gray-700 dark:bg-gray-900 dark:text-gray-400">Contas a Pagar</option>
                  <option value="receivable" className="text-gray-700 dark:bg-gray-900 dark:text-gray-400">Contas a Receber</option>
                </select>
              </div>
              
              <div className="col-span-6 lg:col-span-3">
                <Label title="Nº máximo de parcelas" />
                <input maxLength={50} placeholder="Nº máximo de parcelas" {...register("numberOfInstallments")} type="number" className="input-erp-primary input-erp-default no-spinner"/>
              </div>

              {fields.map((field, index) => (
                <React.Fragment key={field.id}>
                  <div className="col-span-4 xl:col-span-2">
                    <Label title={`${index + 1}º Parcela`} required={false}/>
                    <Controller
                      name={`interest.${index}.value`}
                      control={control}
                      render={({ field: { onChange, value } }) => (
                        <NumericFormat
                          className="input-erp-primary input-erp-default w-full"
                          value={value}
                          onValueChange={(v) => onChange(v.floatValue)}
                          suffix=" %"
                          decimalScale={2}
                          fixedDecimalScale
                          placeholder="Juros"
                        />
                      )}
                    />
                  </div>
                </React.Fragment>
              ))}
            </div>
          </div>
          
          <div className="flex items-center gap-3 px-2 mt-6 lg:justify-end">
            <Button size="sm" variant="outline" onClick={() => close()}>Cancelar</Button>
            {
              paymentMethodId ? 
              <Button size="sm" variant="primary" onClick={() => update()}>Salvar</Button>
              :
              <Button size="sm" variant="primary" onClick={() => create()}>Adicionar</Button>
            }
          </div>
        </form>
      </div>
    </Modal> 
  );
}