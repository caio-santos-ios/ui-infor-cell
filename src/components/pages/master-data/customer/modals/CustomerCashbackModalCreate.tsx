"use client";

import { loadingAtom } from "@/jotai/global/loading.jotai";
import { api } from "@/service/api.service";
import { configApi, resolveResponse } from "@/service/config.service";
import { useAtom } from "jotai";
import Button from "@/components/ui/button/Button";
import { Modal } from "@/components/ui/modal";
import { Controller, useForm } from "react-hook-form";
import Label from "@/components/form/Label";
import React, { useEffect, useState } from "react";
import { NumericFormat } from "react-number-format";
import { ResetCustomerCashback, TCustomerCashback } from "@/types/master-data/customer/customer.type";
import { customerCashbackIdModalAtom, customerCashbackModalCreateAtom } from "@/jotai/masterData/customerCashback.jotai";
import { customerAtom } from "@/jotai/masterData/customer.jotai";
import Autocomplete from "@/components/form/Autocomplete";

export default function CustomerCashbackModalCreate() {
  const [_, setIsLoading] = useAtom(loadingAtom);
  const [modalCreate, setModalCreate] = useAtom(customerCashbackModalCreateAtom);
  const [customerCashbackId, setCustomerCashbackId] = useAtom(customerCashbackIdModalAtom);
  const [cashbacks, setCashbacks] = useState<TCustomerCashback[]>([]);
  const [products, setProducts] = useState<any[]>([]);
  const [customer] = useAtom(customerAtom);
  
  const { getValues, setValue, register, reset, watch, control } = useForm<TCustomerCashback>({
    defaultValues: ResetCustomerCashback
  });

  const create = async () => {
    try {
      const user = localStorage.getItem("telemovviName");
      const cashback: TCustomerCashback = {
        ...getValues(),
        currentValue: watch("value"),
        origin: "customer",
        date: new Date(),
        originDescription: "Adição de cashback feita manualmente",
        responsible: user ? user : ""
      };

      const list = [...customer.cashbacks];

      if(!customerCashbackId) {
        list.push(cashback);
      };

      setIsLoading(true);
      const {data} = await api.put(`/customers/cashbacks`, {cashbacks: list, id: customer.id, productId: watch("productId")}, configApi());
      const result = data.result;
      resolveResponse({status: 201, message: result.message});
      close();
    } catch (error) {
      resolveResponse(error);
    } finally {
      setIsLoading(false);
    }
  };

  const close = () => {
    setModalCreate(false);
    setCustomerCashbackId("");
    reset(ResetCustomerCashback);
  };

  const getAutocompleProduct = async (value: string) => {
    try {
      if(!value) return setProducts([]);
      
      const {data} = await api.get(`/products/autocomplete?deleted=false&orderBy=name&sort=desc&pageSize=10&pageNumber=1&regex$or$name=${value}&regex$or$code=${value}`, configApi());
      const result = data.result;
      const list = result.data.map((x: any) => ({...x, isOutOfStock: x.stock.length == 0}));
      setProducts(list);
    } catch (error) {
      resolveResponse(error);
    }
  };

  return (
    <Modal isOpen={modalCreate} onClose={close} className={`m-4 w-[80dvw] max-w-160 bg-red-400`}>
      <div className={`no-scrollbar relative overflow-y-auto rounded-3xl bg-white p-4 dark:bg-gray-900 lg:p-11`}>
        <div className="px-2 pr-14">
          <h4 className="mb-2 text-2xl font-semibold text-gray-800 dark:text-white/90">Cashback</h4>
        </div>

        <form className="flex flex-col">
          <div className={`max-h-[70dvh] custom-scrollbar overflow-y-auto px-2 pb-3`}>
            <div className="grid grid-cols-6 gap-4">

              <div className="col-span-6">
                <Label title="Descrição" />
                <input maxLength={50} placeholder="Descrição" {...register("description")} type="text" className="input-erp-primary input-erp-default"/>
              </div>
              <div className="col-span-6 lg:col-span-2">
                <Label title="Valor" />
                <Controller
                  name="value"
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
              <div className="col-span-6">
                <Label title="Reservar Produto" required={false}/>
                <Autocomplete placeholder="Buscar produto...." defaultValue={watch("productName")} objKey="id" objValue="productName" onSearch={(value: string) => getAutocompleProduct(value)} onSelect={(opt) => {
                  setValue("productId", opt.id);
                  setValue("productName", opt.productName);
                }} options={products}/>
              </div>
            </div>
          </div>
          
          <div className="flex items-center gap-3 px-2 mt-6 lg:justify-end">
            <Button size="sm" variant="outline" onClick={close}>Cancelar</Button>
            <Button size="sm" variant="primary" onClick={() => create()}>Adicionar</Button>
          </div>
        </form>
      </div>
    </Modal> 
  );
}