"use client";

import { loadingAtom } from "@/jotai/global/loading.jotai";
import { api } from "@/service/api.service";
import { configApi, resolveResponse } from "@/service/config.service";
import { useAtom } from "jotai";
import { useEffect } from "react";
import { Controller, SubmitHandler, useForm } from "react-hook-form";
import ComponentCard from "@/components/common/ComponentCard";
import Button from "@/components/ui/button/Button";
import { useRouter } from "next/navigation";
import { ResetPurchaseOrder, TPurchaseOrder } from "@/types/purchase/purchase-order/purchase-order.type";
import Label from "@/components/form/Label";
import { NumericFormat } from "react-number-format";
import { purchaseOrderStatusAtom } from "@/jotai/purchaseOrder/purchaseOrder.jotai";

type TProp = {
  id?: string;
};

export default function PurchaseOrderDataForm({id}: TProp) {
  const [_, setIsLoading] = useAtom(loadingAtom);
  const [status, setStatus] = useAtom(purchaseOrderStatusAtom);
  const router = useRouter();  

  const { control, getValues, reset, register, setValue, watch } = useForm<TPurchaseOrder>({
    defaultValues: ResetPurchaseOrder
  });

  // const status = watch("status");

  const save = async (body: TPurchaseOrder) => {
    if(!body.id) {
      await create(body);
    } else {
      await update(body);
    };
  };
      
  const create: SubmitHandler<TPurchaseOrder> = async (body: TPurchaseOrder) => {
    try {
      setIsLoading(true);
      const {data} = await api.post(`/purchase-orders`, body, configApi());
      const result = data.result;
      resolveResponse({status: 201, message: result.message});
      router.push(`/purchase/purchase-order/${result.data.id}`)
    } catch (error) {
      resolveResponse(error);
    } finally {
      setIsLoading(false);
    }
  };
    
  const update: SubmitHandler<TPurchaseOrder> = async (body: TPurchaseOrder) => {
    try {
      setIsLoading(true);
      const {data} = await api.put(`/purchase-orders`, body, configApi());
      const result = data.result;
      resolveResponse({status: 200, message: result.message});
    } catch (error) {
      resolveResponse(error);
    } finally {
      setIsLoading(false);
    }
  };

  const getById = async (id: string) => {
    try {
      setIsLoading(true);
      const {data} = await api.get(`/purchase-orders/${id}`, configApi());
      const result = data.result.data;
      setStatus(result.status);
      reset(result);
      setValue("date", result.date.split("T")[0]);
      setValue("updatedAt", result.updatedAt.split("T")[0]);
    } catch (error) {
      resolveResponse(error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if(id != "create") {
      getById(id!);
    };
  }, []);

  return (
    <>
      <ComponentCard title="Dados Gerais" hasHeader={false}>
        <div className="grid grid-cols-6 gap-2">  
          <div className="col-span-6 xl:col-span-1">
            <Label title="Data" />
            <input disabled={status == 'Finalizado'} placeholder="Data" {...register("date")} type="date" className="input-erp-primary input-erp-default"/>
          </div>
          <div className="col-span-6 xl:col-span-1">
            <Label title="Total" required={false}/>
            <Controller
              disabled
              name="total"
              control={control}
              defaultValue={0}
              render={({ field: { onChange, value } }) => (
                <NumericFormat
                  className="input-erp-primary input-erp-default" 
                  value={value}
                  onValueChange={(values) => {
                    setValue("total", values.floatValue ? values.floatValue : 0);
                  }}
                  thousandSeparator="."
                  decimalSeparator=","
                  prefix="R$ "
                  decimalScale={2}
                  fixedDecimalScale
                  allowNegative={false}
                  placeholder="Total"
                  disabled
                />
              )}
            />
          </div>
          <div className="col-span-6 xl:col-span-1">
            <Label title="Quantidade" required={false}/>
            <input disabled placeholder="Quantidade" {...register("quantity")} type="number" className="input-erp-primary input-erp-default"/>
          </div>
          <div className="col-span-6 xl:col-span-3">
            <Label title="Observações" required={false} />
            <input disabled={status == 'Finalizado'} placeholder="Observações" {...register("notes")} type="text" className="input-erp-primary input-erp-default"/>
          </div> 
          {
            status == 'Finalizado' &&
            <>
              <div className="col-span-6 xl:col-span-1">
                <Label title="Data da Aprovação" required={false}/>
                <input disabled placeholder="" {...register("updatedAt")} type="date" className="input-erp-primary input-erp-default"/>
              </div>
              <div className="col-span-6 xl:col-span-2">
                <Label title="Usuário Aprovador" required={false}/>
                <input disabled placeholder="" {...register("userApproval")} type="text" className="input-erp-primary input-erp-default"/>
              </div>
            </>
          }
        </div>
      </ComponentCard>
      {
        status != 'Finalizado' &&
        <Button onClick={() => save({...getValues()})} type="submit" className="w-full xl:max-w-20 mt-2" size="sm">Salvar</Button>
      }
    </>
  );
}