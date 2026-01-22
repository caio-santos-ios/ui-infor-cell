"use client";

import { loadingAtom } from "@/jotai/global/loading.jotai";
import { api } from "@/service/api.service";
import { configApi, resolveResponse } from "@/service/config.service";
import { useAtom } from "jotai";
import { useEffect, useState } from "react";
import { Controller, SubmitHandler, useForm } from "react-hook-form";
import ComponentCard from "@/components/common/ComponentCard";
import Label from "@/components/form/Label";
import Button from "@/components/ui/button/Button";
import { useRouter } from "next/navigation";
import { NumericFormat } from "react-number-format";
import { ResetProduct, TProduct } from "@/types/product/product/product.type";
import { TCategorie } from "@/types/product/categorie/categorie.type";
import { TModel } from "@/types/product/model/model.type";
import Switch from "@/components/form/Switch";
import TextArea from "@/components/form/input/TextArea";

type TProp = {
  id?: string;
};

export default function ProductPriceCostForm({id}: TProp) {
  const [_, setIsLoading] = useAtom(loadingAtom);  

  const { control, getValues, reset, register, setValue, watch } = useForm<TProduct>({
    defaultValues: ResetProduct
  });

  const costPrice = watch("cost");
  const salePrice = watch("price");
  const priceDiscount = 0;

  const save = async (body: TProduct) => {
    if(body.id) {
      await update(body);
    };
  };
    
  const update: SubmitHandler<TProduct> = async (body: TProduct) => {
    try {
      setIsLoading(true);
      const {data} = await api.put(`/products`, body, configApi());
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
      const {data} = await api.get(`/products/${id}`, configApi());
      const result = data.result.data;
      reset(result);
    } catch (error) {
      resolveResponse(error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    const finalSaleValue = salePrice - priceDiscount;
    const profit = finalSaleValue - costPrice;

    if (costPrice > 0) {
      const calculatedMarkup = (profit / costPrice) * 100;
      setValue("margin", calculatedMarkup);
    } else if (finalSaleValue > 0 && costPrice === 0) {
      setValue("margin", 100); 
    } else {
      setValue("margin", 0);
    }
  }, [costPrice, salePrice, priceDiscount, setValue]);
  
  useEffect(() => {
    if(id != "create") {
      getById(id!);
    };
  }, []);

  return (
    <>
      <ComponentCard title="Dados Gerais" hasHeader={false}>
        <div className="grid grid-cols-6 gap-2 max-h-[calc(100dvh-23.5rem)] md:max-h-[calc(100dvh-26rem)] lg:max-h-[calc(100dvh-26rem)] xl:max-h-[calc(100dvh-23.5rem)] overflow-y-auto">  
          <div className="col-span-6 xl:col-span-1">
            <Label title="Custo Atual" required={false}/>
            <Controller
              name="cost"
              control={control}
              defaultValue={0}
              render={({ field: { onChange, value } }) => (
                <NumericFormat
                  className="input-erp-primary input-erp-default" 
                  value={value}
                  onValueChange={(values) => {
                    setValue("cost", values.floatValue ? values.floatValue : 0);
                  }}
                  thousandSeparator="."
                  decimalSeparator=","
                  prefix="R$ "
                  decimalScale={2}
                  fixedDecimalScale
                  allowNegative={false}
                  placeholder="Custo Atual"
                />
              )}
            />
          </div>
          <div className="col-span-6 xl:col-span-1">
            <Label title="Custo Médio" required={false}/>
            <Controller
              name="averageCost"
              control={control}
              defaultValue={0}
              render={({ field: { onChange, value } }) => (
                <NumericFormat
                  className="input-erp-primary input-erp-default" 
                  value={value}
                  onValueChange={(values) => {
                    setValue("averageCost", values.floatValue ? values.floatValue : 0);
                  }}
                  thousandSeparator="."
                  decimalSeparator=","
                  prefix="R$ "
                  decimalScale={2}
                  fixedDecimalScale
                  allowNegative={false}
                  placeholder="Custo Médio"
                />
              )}
            />
          </div>
          <div className="col-span-6 xl:col-span-1">
            <Label title="Preço de Venda" required={false}/>
            <Controller
              name="price"
              control={control}
              defaultValue={0}
              render={({ field: { onChange, value } }) => (
                <NumericFormat
                  className="input-erp-primary input-erp-default" 
                  value={value}
                  onValueChange={(values) => {
                    setValue("price", values.floatValue ? values.floatValue : 0);
                  }}
                  thousandSeparator="."
                  decimalSeparator=","
                  prefix="R$ "
                  decimalScale={2}
                  fixedDecimalScale
                  allowNegative={false}
                  placeholder="Preço de Venda"
                />
              )}
            />
          </div>
          <div className="col-span-6 xl:col-span-1">
            <Label title="Preço Mínimo" required={false}/>
            <Controller
              name="minimumPrice"
              control={control}
              defaultValue={0}
              render={({ field: { onChange, value } }) => (
                <NumericFormat
                  className="input-erp-primary input-erp-default" 
                  value={value}
                  onValueChange={(values) => {
                    setValue("minimumPrice", values.floatValue ? values.floatValue : 0);
                  }}
                  thousandSeparator="."
                  decimalSeparator=","
                  prefix="R$ "
                  decimalScale={2}
                  fixedDecimalScale
                  allowNegative={false}
                  placeholder="Preço Mínimo"
                />
              )}
            />
          </div>
          <div className="col-span-6 xl:col-span-1">
            <Label title="Margem" required={false} />
            <Controller
              name="margin"
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
                  suffix=" %"
                  decimalScale={2}
                  fixedDecimalScale
                  allowNegative={false} 
                  placeholder="Margem"
                />
              )}
            />
          </div>
          <div className="col-span-6 xl:col-span-1">
            <Label title="Permitir Desconto" required={false}/>
            <select {...register("hasDiscount")} className="h-11 w-full appearance-none rounded-lg border border-gray-300 bg-transparent px-4 py-2.5 pr-11 text-sm shadow-theme-xs placeholder:text-gray-400 focus:border-brand-300 focus:outline-hidden focus:ring-3 focus:ring-brand-500/10 dark:border-gray-700 dark:bg-gray-900 dark:text-white/90 dark:placeholder:text-white/30 dark:focus:border-brand-800 text-gray-800 dark:bg-dark-900">
              <option value="yes" className="text-gray-700 dark:bg-gray-900 dark:text-gray-400">Sim</option>
              <option value="no" className="text-gray-700 dark:bg-gray-900 dark:text-gray-400">Não</option>
            </select>
          </div>
        </div>
      </ComponentCard>
      <Button onClick={() => save({...getValues()})} type="submit" className="w-full xl:max-w-20 mt-2" size="sm">Salvar</Button>
    </>
  );
}